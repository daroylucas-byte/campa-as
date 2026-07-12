# Campañas IA

SaaS B2B multi-tenant: agencias/negocios generan campañas de marketing de 30 días con IA
en nombre de sus propios clientes.

**Estado actual: solo backend.** El frontend se arma por fuera con Gemini/otra herramienta.
Este documento es el contrato que ese frontend necesita para integrar.

- Supabase project-ref: `puhrwlbgdpdohuhvtvbp` (región us-west-2, Postgres 17)
- Origen: módulo extraído del proyecto Grafiko (imprenta), generalizado a multi-tenant real.

## Stack backend

- Supabase: Postgres 17 + Auth + Storage + Edge Functions (Deno)
- Gemini API (Google) para generación de texto e imágenes

## Multi-tenancy

Un usuario puede pertenecer a varios negocios (agencias). Cada negocio ve solo sus propios
clientes, campañas y saldo — aislado por RLS real, no por convención de la app.

- `negocios` — el tenant.
- `negocio_usuarios` — puente many-to-many usuario↔negocio, con `rol` ('admin' | 'editor').
- Todas las demás tablas cuelgan de `negocio_id`, directo o transitivamente vía `cliente_id`
  → `clientes.negocio_id` o `campana_id` → `campanas_cliente.cliente_id` → ...
- Helper RLS: `es_miembro_negocio(p_negocio_id UUID) RETURNS BOOLEAN` — reutilizado en todas
  las policies. `SECURITY DEFINER`, solo ejecutable por `authenticated`.
- Al insertar en `negocios`, un trigger (`crear_wallet_para_negocio_nuevo`) inicializa
  automáticamente su fila en `saldo_marketing` con `saldo = 0`.

## Base de datos

| Tabla | Rol |
|---|---|
| `negocios` | Tenant (agencia/negocio) |
| `negocio_usuarios` | Membresía usuario↔negocio, con rol |
| `clientes` | Cliente final de cada negocio (`negocio_id`, `razon_social`) |
| `identidad_visual_cliente` | Imágenes de referencia subidas por cliente |
| `analisis_identidad_cliente` | Resultado del análisis IA, 1 por cliente (`cliente_id UNIQUE`) |
| `campanas_cliente` | Nivel 1: campaña de 30 días (`pilares_semanales` JSONB, NULL hasta generar plan) |
| `campana_posts` | Nivel 2/3: posts por semana (5-7 c/u), con `imagen_url` cuando se genera |
| `saldo_marketing` | Wallet de créditos IA, 1 por negocio (`negocio_id UNIQUE`) |
| `transacciones_marketing` | Historial de cargas/consumos de créditos |

Estructura de 3 niveles deliberada (Campaña → Posts por semana → Imagen por post) — ver
sección "Decisiones de diseño" abajo antes de proponer cambios al schema.

### RPCs

```
cargar_saldo_marketing(p_negocio_id UUID, p_monto NUMERIC, p_descripcion TEXT, p_usuario_id UUID) RETURNS NUMERIC
descontar_saldo_marketing(p_negocio_id UUID, p_monto NUMERIC, p_tipo TEXT, p_descripcion TEXT, p_usuario_id UUID) RETURNS NUMERIC
```

Ambas atómicas (`SECURITY DEFINER`, lock `FOR UPDATE` en el descuento). `descontar_saldo_marketing`
tira excepción `'Saldo insuficiente'` si no alcanza — el frontend debe capturar el error de la
RPC y mostrarlo. Solo `authenticated` puede ejecutarlas.

### Storage

Bucket `marketing` (público, lectura sin auth, escritura solo `authenticated`):
- `identidad-clientes/{cliente_id}/{timestamp}-{random}.{ext}` — imágenes de referencia.
- `campanas/{post_id}-{timestamp}.{ext}` — imágenes generadas por post.

## Edge Functions

Todas: `POST`, requieren `SUPABASE_SERVICE_ROLE_KEY` y `GEMINI_API_KEY` como secrets de la
función (nunca expuestas al cliente). CORS abierto (`Access-Control-Allow-Origin: *`).

| Función | Costo créditos | Modelo Gemini | Input | Output |
|---|---|---|---|---|
| `analizar-identidad-cliente` | 500 | `gemini-3.1-flash-image` | `{ cliente_id, usuario_id? }` | `{ estilo_descripcion }` |
| `generar-campana` | 600 | `gemini-2.5-flash` | `{ campana_id, usuario_id? }` | `{ pilares, resumen }` |
| `generar-semana-campana` | 600 | `gemini-2.5-flash` | `{ campana_id, semana (1-4), usuario_id? }` | `{ posts: [...] }` |
| `generar-imagen-campana` | 1250 | `gemini-3.1-flash-image` | `{ post_id, usuario_id? }` | `{ imagen_url }` |

Reglas de negocio que las funciones aplican (no bypasear desde el frontend):
- `generar-semana-campana` falla 400 si la campaña no tiene `pilares_semanales` todavía
  (hay que llamar `generar-campana` primero) o si esa semana ya tiene posts generados
  (hay que borrarlos a mano para regenerar — no hay versionado).
- El `negocio_id` para el descuento de saldo se resuelve siempre desde la fila de BD
  (cliente/campaña/post → negocio), nunca se confía en un valor del body.
- El descuento de saldo ocurre **antes** de llamar a Gemini. Si Gemini falla, el crédito se
  pierde (sin reembolso) — limitación conocida, ver pendientes.

⚠️ Antes de asumir que `gemini-3.1-flash-image` / `gemini-2.5-flash` siguen vigentes, correr
`GET https://generativelanguage.googleapis.com/v1beta/models?key=<key>` — los nombres de
modelo Gemini cambian y varían según cuenta/API key.

## Variables de entorno

Cliente (frontend, prefijo `VITE_` va al bundle — nunca poner secrets acá):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Edge Functions únicamente (nunca en el bundle del cliente):
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY` — **pendiente de cargar**, el usuario la configura cuando la tenga.

## Decisiones de diseño (no revertir sin justificación)

- **3 niveles, no piezas sueltas**: Campaña → Posts por semana → Imagen por post. Representa
  un plan de agencia real con calendario y variedad de formatos; una campaña con "piezas"
  sueltas de texto no alcanza.
- **Generación por semana, no el mes completo de una vez**: pedirle a un LLM 30 días de
  contenido en una sola respuesta arriesga corte/JSON mal formado. Plan de 4 pilares (chico)
  + una llamada separada por semana bajo demanda (acotada y confiable).
- **El plan de pilares es prerrequisito de los posts** — sin eje temático de la semana no hay
  contexto para generar sus posts.
- **Meta cuantificable la escribe el usuario, nunca la IA** — no hay integración real con
  redes sociales detrás, así que no hay datos para sustentar una promesa de resultado.
- **Fecha calendario exacta no se calcula** — el modelo devuelve día de texto ("Lunes"), no
  se resuelve contra `fecha_inicio`. Limitación consciente, no bug (ver pendientes).
- **Identidad visual por cliente, no singleton** — cada cliente del negocio tiene su propio
  análisis, reutilizado entre todas sus campañas.
- **Prompt de imagen: identidad visual al principio, marcada prioridad #1** — no diluida al
  final. Los modelos de imagen priorizan mejor las restricciones de estilo así.
- **Reglas de idioma explícitas en prompt de imagen** — español rioplatense, alfabeto español
  únicamente, sin diacríticos de otros idiomas, nombre de marca deletreado exacto. Evita que
  el modelo "filtre" ortografía de otro idioma en texto generado dentro de la imagen.

## Convenciones

- Toda llamada a Supabase desde el frontend va por una capa de servicios — nunca directo
  desde componentes.
- RLS siempre habilitado, nunca deshabilitar para "simplificar" debugging.
- `service_role` key solo vive en Edge Functions, nunca en el cliente.
- Variables `VITE_*` nunca contienen secrets — van al bundle público.

## Pendientes conocidos

- [ ] Reembolso de créditos si la llamada a Gemini falla después de descontar el saldo.
- [ ] Cálculo de fecha calendario real por post (hoy solo día de texto en el copy).
- [ ] Integración de pago real para `cargar_saldo_marketing` (hoy es carga manual).
- [ ] Posible integración directa de publicación (Meta Graph API, etc.) en vez de solo
      generar contenido para subir a mano.
- [ ] Deploy de las Edge Functions y carga de `GEMINI_API_KEY` como secret.
- [ ] Verificar nombres de modelo Gemini vigentes antes del primer deploy real.
