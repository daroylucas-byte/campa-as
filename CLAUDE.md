# Campañas IA

SaaS B2B multi-tenant: agencias/negocios generan campañas de marketing de 30 días con IA
en nombre de sus propios clientes.

- Repo: `https://github.com/daroylucas-byte/campa-as` (branch `main`)
- Supabase project-ref: `puhrwlbgdpdohuhvtvbp` (región us-west-2, Postgres 17)
- Origen: módulo extraído del proyecto Grafiko (imprenta), generalizado a multi-tenant real.
- Estado: backend completo y deployado (BD + 4 Edge Functions activas). Frontend armado con
  Gemini (React 19 + TS + Tailwind v4), funcional. Pendiente: deploy a Vercel.

## Stack

- Backend: Supabase (Postgres 17 + Auth + Storage + Edge Functions Deno) + Gemini API
- Frontend: React 19, TypeScript, Vite, Tailwind CSS v4, React Hook Form, react-hot-toast,
  `@supabase/supabase-js` v2

## Estructura de carpetas

```
src/
  pages/
    Landing.tsx          # landing pública
    Login.tsx             # login/signup (Supabase Auth)
    NegocioSelector.tsx    # elegir/crear negocio tras login
    Dashboard.tsx           # vista global de la agencia + workspace de cliente activo
  components/
    Sidebar.tsx             # navegación fija (Dashboard/Clientes/Campañas/Calendario)
    Header.tsx
    ClientContextBar.tsx
    IdentidadVisual.tsx     # panel de identidad visual (subida + análisis)
    CampanasList.tsx        # listado de campañas del cliente activo
    CampaignCanvas.tsx      # detalle de campaña: plan, posts por semana, generación de imagen
    Modals.tsx              # CrearNegocio, CargarCreditos, CambiarCliente, CrearCampana
  context/
    AppContext.tsx          # user, negocioActivo, clienteActivo, campanaActiva, saldo
  services/                 # toda llamada a Supabase pasa por acá, nunca directo desde componentes
    supabaseClient.ts
    negocios.ts
    clientes.ts
    campanas.ts
  types/
    database.types.ts
supabase/
  functions/                # 4 Edge Functions, ver abajo
  migrations/                # (aplicadas vía MCP, no hay carpeta local de migraciones versionada)
```

## Multi-tenancy

Un usuario puede pertenecer a varios negocios (agencias). Cada negocio ve solo sus propios
clientes, campañas y saldo — aislado por RLS real, no por convención de la app.

- `negocios` — el tenant. Columna `creado_por UUID DEFAULT auth.uid()`.
- `negocio_usuarios` — puente many-to-many usuario↔negocio, con `rol` ('admin' | 'editor').
- Todas las demás tablas cuelgan de `negocio_id`, directo o transitivamente vía `cliente_id`
  → `clientes.negocio_id` o `campana_id` → `campanas_cliente.cliente_id` → ...
- Helper RLS: `es_miembro_negocio(p_negocio_id UUID) RETURNS BOOLEAN` — reutilizado en todas
  las policies. `SECURITY DEFINER`, ejecutable solo por `authenticated`.
- Al insertar en `negocios`, un trigger (`crear_wallet_para_negocio_nuevo`) auto-asigna al
  creador como `admin` en `negocio_usuarios` **y** inicializa su wallet en `saldo_marketing`
  con `saldo = 0`, todo en la misma transacción del INSERT (necesario porque PostgREST evalúa
  la policy de SELECT del `RETURNING` antes de que corran los triggers `AFTER INSERT` — sin
  esto, `insert().select()` sobre `negocios` devuelve 403 la primera vez).
- La policy de SELECT en `negocios` permite ver la fila si `es_miembro_negocio(id)` **o**
  `creado_por = auth.uid()` — el segundo caso cubre el instante de creación, antes de que la
  membresía exista.

## Base de datos

| Tabla | Rol |
|---|---|
| `negocios` | Tenant (agencia/negocio) |
| `negocio_usuarios` | Membresía usuario↔negocio, con rol |
| `clientes` | Cliente final de cada negocio (`negocio_id`, `razon_social`) |
| `identidad_visual_cliente` | Imágenes de referencia subidas por cliente, con `categoria` |
| `analisis_identidad_cliente` | Resultado del análisis IA, 1 por cliente (`cliente_id UNIQUE`) |
| `campanas_cliente` | Nivel 1: campaña de 30 días (`pilares_semanales` JSONB, NULL hasta generar plan) |
| `campana_posts` | Nivel 2/3: posts por semana (5-7 c/u), con `imagen_url` cuando se genera |
| `saldo_marketing` | Wallet de créditos IA, 1 por negocio (`negocio_id UNIQUE`) |
| `transacciones_marketing` | Historial de cargas/consumos de créditos |
| `uso_gemini` | Tracking de tokens reales por llamada a Gemini, para calibrar costos en créditos |

Estructura de 3 niveles deliberada (Campaña → Posts por semana → Imagen por post) — ver
sección "Decisiones de diseño" abajo antes de proponer cambios al schema.

`identidad_visual_cliente.categoria` — `'logo' | 'flyer' | 'post' | 'foto_producto' | 'otro'`
(default `'otro'`). Se pasa a Gemini en `analizar-identidad-cliente` para que priorice el
logo como identidad central de marca y use el resto como contexto de aplicación.

### RPCs

```
cargar_saldo_marketing(p_negocio_id UUID, p_monto NUMERIC, p_descripcion TEXT, p_usuario_id UUID) RETURNS NUMERIC
descontar_saldo_marketing(p_negocio_id UUID, p_monto NUMERIC, p_tipo TEXT, p_descripcion TEXT, p_usuario_id UUID) RETURNS NUMERIC
```

Ambas atómicas (`SECURITY DEFINER`, lock `FOR UPDATE` en el descuento). `descontar_saldo_marketing`
tira excepción `'Saldo insuficiente'` si no alcanza — el frontend debe capturar el error de la
RPC y mostrarlo. Ejecutables solo por `authenticated` (revocado explícitamente de `PUBLIC`/`anon`).

### Storage

Bucket `marketing` (público, lectura sin auth, escritura solo `authenticated`):
- `identidad-clientes/{cliente_id}/{timestamp}-{random}.{ext}` — imágenes de referencia.
- `campanas/{post_id}-{timestamp}.{ext}` — imágenes generadas por post.

## Edge Functions

Todas: `POST`, requieren `SUPABASE_SERVICE_ROLE_KEY` y `GEMINI_API_KEY` como secrets de la
función (nunca expuestas al cliente). CORS abierto (`Access-Control-Allow-Origin: *`).
Deployadas y activas (`verify_jwt: true`).

| Función | Costo créditos | Modelo Gemini | Input | Output |
|---|---|---|---|---|
| `analizar-identidad-cliente` | 500 | `gemini-3.1-flash-image` | `{ cliente_id, usuario_id? }` | `{ estilo_descripcion }` |
| `generar-campana` | 600 | `gemini-2.5-flash` | `{ campana_id, usuario_id? }` | `{ pilares, resumen }` |
| `generar-semana-campana` | 600 | `gemini-2.5-flash` | `{ campana_id, semana (1-4), usuario_id? }` | `{ posts: [...] }` |
| `generar-imagen-campana` | 1250 | `gemini-3.1-flash-image` | `{ post_id, usuario_id?, sugerencia_usuario? }` | `{ imagen_url }` |

Reglas de negocio que las funciones aplican (no bypasear desde el frontend):
- `generar-semana-campana` falla 400 si la campaña no tiene `pilares_semanales` todavía
  (hay que llamar `generar-campana` primero) o si esa semana ya tiene posts generados
  (hay que borrarlos a mano para regenerar — no hay versionado).
- El `negocio_id` para el descuento de saldo se resuelve siempre desde la fila de BD
  (cliente/campaña/post → negocio), nunca se confía en un valor del body.
- El descuento de saldo ocurre **antes** de llamar a Gemini. Si Gemini falla, el crédito se
  pierde (sin reembolso) — limitación conocida, ver pendientes.
- `generar-imagen-campana` acepta `sugerencia_usuario` opcional (texto libre) para guiar una
  regeneración — se agrega al prompt como ajuste de alta prioridad sin descartar el resto del
  contexto (identidad de marca, contenido del post, reglas de idioma). Mismo costo que la
  primera generación.
- Cada llamada exitosa a Gemini inserta una fila en `uso_gemini` con `usageMetadata` (tokens
  de prompt/candidates/total) — usar esta tabla para calibrar si el costo en créditos de cada
  función sigue siendo correcto a medida que se acumula uso real.

⚠️ Antes de asumir que `gemini-3.1-flash-image` / `gemini-2.5-flash` siguen vigentes, correr
`GET https://generativelanguage.googleapis.com/v1beta/models?key=<key>` — los nombres de
modelo Gemini cambian y varían según cuenta/API key. Confirmado vigentes al 2026-07-11.

### Gotcha de Deno: conversión de ArrayBuffer a base64

`String.fromCharCode(...bytes)` con spread revienta el call stack ("Maximum call stack size
exceeded") con imágenes de más de ~65KB, porque pasa cada byte como argumento individual y V8
tiene un límite de argumentos por llamada. `analizar-identidad-cliente` usa una función
`arrayBufferABase64` que convierte por chunks de 8KB — replicar ese patrón en cualquier Edge
Function nueva que necesite encodear binarios a base64.

## Variables de entorno

Cliente (Vercel + local, prefijo `VITE_` va al bundle — nunca poner secrets acá):
- `VITE_SUPABASE_URL` — Supabase Dashboard → Settings → API → Project URL
- `VITE_SUPABASE_ANON_KEY` — mismo lugar → Project API keys → `anon` `public`

Edge Functions únicamente (secrets de Supabase, nunca en Vercel ni en el bundle):
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY` — cargada.

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
- **Fecha calendario real calculada en backend, no por la IA** — el modelo sigue devolviendo
  el día de texto ("Lunes"), pero `generar-semana-campana` resuelve `fecha` (columna real de
  `campana_posts`) sumando offsets a partir de `campanas_cliente.fecha_inicio` + `(semana-1)*7`
  + el offset del día. `fecha_inicio` se interpreta como el Lunes de la Semana 1. Si el día
  devuelto por la IA no matchea ninguno de los 7 nombres esperados, `fecha` queda `NULL` (fallback
  seguro, no rompe el insert).
- **Identidad visual por cliente, no singleton** — cada cliente del negocio tiene su propio
  análisis, reutilizado entre todas sus campañas. Categorizada por tipo de imagen (logo,
  flyer, post, foto de producto, otro) para que la IA priorice el logo como identidad central.
- **Prompt de imagen: identidad visual al principio, marcada prioridad #1** — no diluida al
  final. Los modelos de imagen priorizan mejor las restricciones de estilo así.
- **Reglas de idioma explícitas en prompt de imagen** — español rioplatense, alfabeto español
  únicamente, sin diacríticos de otros idiomas, nombre de marca deletreado exacto. Evita que
  el modelo "filtre" ortografía de otro idioma en texto generado dentro de la imagen.
- **Ajuste de regeneración de imagen es aditivo, no reemplaza contexto** — la sugerencia del
  usuario se suma al final del prompt como prioridad alta, sin descartar identidad visual ni
  contenido del post.

## Convenciones

- Toda llamada a Supabase desde el frontend va por `src/services/` — nunca directo desde
  componentes/páginas.
- RLS siempre habilitado, nunca deshabilitar para "simplificar" debugging.
- `service_role` key solo vive en Edge Functions, nunca en el cliente ni en Vercel.
- Variables `VITE_*` nunca contienen secrets — van al bundle público.
- Al modificar una Edge Function, redeployar con `mcp__claude_ai_Supabase__deploy_edge_function`
  (no hay CLI de Supabase configurada localmente en este proyecto) e incluir siempre
  `supabase/functions/_shared/cors.ts` como archivo del deploy.

## Pendientes conocidos

- [ ] Deploy a Vercel (variables de entorno ya identificadas, deploy en curso).
- [ ] Reembolso de créditos si la llamada a Gemini falla después de descontar el saldo.
- [ ] Integración de pago real para `cargar_saldo_marketing` (hoy es carga manual).
- [ ] Posible integración directa de publicación (Meta Graph API, etc.) en vez de solo
      generar contenido para subir a mano.
- [ ] Activar "Leaked Password Protection" en Supabase Auth Dashboard (Authentication →
      Policies → Password Security) — no configurable por SQL/migración.
- [ ] Calibrar costo en créditos de cada función contra uso real registrado en `uso_gemini`
      una vez que haya volumen de datos.
