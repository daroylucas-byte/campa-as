---
name: clonar-proyecto
description: >
  Guía paso a paso para clonar el proyecto matafuegos ERP para un nuevo cliente:
  exportar schema de Supabase, crear nuevo proyecto, configurar Vercel, ARCA,
  módulo de Promociones IA, Agente Estratégico y Mercado Pago.
---

# Skill: Clonar Proyecto para Nuevo Cliente

## Cuándo usar esta skill
Cuando el usuario quiere clonar este proyecto (matafuegos ERP) para un nuevo cliente con su propia base de datos Supabase y deploy en Vercel.

## Checklist previa — avisar ANTES de empezar

Antes de tocar cualquier cosa, mostrar este checklist al usuario y pedirle que confirme que tiene todo:

---

**Antes de clonar, necesitás tener a mano:**

**Accesos**
- [ ] Cuenta Supabase disponible (propia o del cliente) para crear el proyecto nuevo
- [ ] Acceso a Vercel para hacer el deploy
- [ ] Acceso SSH al VPS `72.60.252.11` (solo si el cliente usa ARCA)

**Datos del cliente**
- [ ] Nombre de la empresa / razón social
- [ ] CUIT del cliente
- [ ] Dirección comercial
- [ ] Email y password para el primer usuario administrador

**Si usa módulo Promociones IA / Agente Estratégico**
- [ ] API Key de Google AI Studio (`GEMINI_API_KEY`) — generarla en aistudio.google.com
- [ ] Decidir si el saldo de marketing lo carga el admin manualmente o vía Mercado Pago

**Si usa Mercado Pago para recargas de saldo**
- [ ] Cuenta de Mercado Pago del cliente con credenciales productivas activadas
- [ ] `ACCESS_TOKEN` productivo de MP (empieza con `APP_USR-`)
- [ ] URL de Vercel del cliente para configurar back_urls y webhook

**Si usa ARCA/facturación electrónica**
- [ ] Certificado digital (`.crt`) emitido por AFIP
- [ ] Clave privada (`.key`) correspondiente al certificado
- [ ] Número de punto de venta habilitado en AFIP para factura electrónica
- [ ] Confirmación si es ambiente homologación (prueba) o producción

**Lo que NO necesitás** (lo hace Claude):
- Exportar el schema manualmente
- Escribir el SQL de tablas/triggers/RLS
- Configurar las variables de entorno una por una

---

Preguntar: **¿Tenés todo lo de arriba listo? ¿Avanzamos?**

Si confirma, recién ahí preguntar:

1. **Nombre del cliente / proyecto** (ej: "extintores-lopez")
2. **¿Ya tiene cuenta en Supabase?** (propia o la tuya)
3. **¿Ya tiene cuenta en Vercel?** (propia o la tuya)
4. **¿Usa módulo de Promociones IA?** (sí/no)
5. **¿Usa Mercado Pago para recargar saldo?** (sí/no)
6. **¿Usa ARCA/facturación electrónica?** (sí/no)
7. **¿Mismo VPS para ARCA o VPS propio?**

## Pasos del proceso

### FASE 1 — Preparar el schema de la DB actual

Usar el MCP de Supabase para exportar el schema del proyecto origen:

```
Ejecutar en SQL Editor de Supabase origen:
SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

Luego hacer dump completo con supabase CLI:
```bash
supabase db dump --db-url "postgresql://postgres:<PASSWORD>@db.<REF_ORIGEN>.supabase.co:5432/postgres" > schema_cliente.sql
```

La password está en Supabase → Settings → Database → Connection string.

### FASE 2 — Crear proyecto nuevo en Supabase

1. supabase.com → New Organization (si cuenta nueva) → New Project
2. Elegir región (preferentemente us-east-1 o sa-east-1 para Argentina)
3. Anotar:
   - Project URL: `https://<nuevo-ref>.supabase.co`
   - Anon key: desde Settings → API
   - Service Role Key: desde Settings → API (solo para secrets, nunca en frontend)
   - DB password: la que pusieron al crear

### FASE 3 — Aplicar schema al proyecto nuevo

```bash
psql "postgresql://postgres:<PASSWORD_NUEVO>@db.<REF_NUEVO>.supabase.co:5432/postgres" < schema_cliente.sql
```

O desde Supabase SQL Editor: pegar el contenido del schema.sql y ejecutar.

**Verificar que se crearon:**
- Todas las tablas (ventas, clientes, productos, stock_por_local, etc.)
- Tablas del módulo marketing: `promociones` (con columnas `imagen_url` e `imagenes_meta` JSONB), `config_promo`, `identidad_visual` (con columna `tipo_imagen_producto`), `saldo_marketing`, `transacciones_marketing`
- Tablas del agente estratégico: `informes_estrategia`
- Los triggers de audit_log
- Las políticas RLS en todas las tablas
- Las vistas (vista_kardex, vista_ventas_resumen, etc.)
- RPCs: `cargar_saldo`, `descontar_saldo`, `resumen_para_promo`, `resumen_para_estrategia`

### FASE 4 — Configurar datos iniciales

Insertar configuración base:
```sql
INSERT INTO configuracion (id, nombre_app, color_primario, color_secundario)
VALUES (1, 'ERP <Nombre Cliente>', '#3525cd', '#006c49');
```

Insertar saldo inicial de marketing (requerido para el módulo de promociones):
```sql
INSERT INTO saldo_marketing (id, saldo) VALUES (1, 0);
```

Crear primer local:
```sql
INSERT INTO locales (nombre, direccion) VALUES ('<Nombre Local>', '<Dirección>');
```

### FASE 5 — Crear primer usuario superadmin

1. Supabase nuevo → Authentication → Users → Add User
2. Ingresar email y password del admin del cliente
3. Copiar el UUID del usuario creado
4. Ejecutar en SQL:
```sql
UPDATE profiles SET rol = 'superadmin' WHERE id = '<UUID_DEL_USUARIO>';
```

### FASE 6 — Clonar y configurar el repo

```bash
# Opción A: mismo repo, nueva carpeta
git clone https://github.com/daroylucas-byte/matafuegos <nombre-cliente>
cd <nombre-cliente>
npm install

# Opción B: fork en GitHub para repos separados por cliente
# (recomendado si los clientes van a tener customizaciones distintas)
```

Crear `.env.local` para el nuevo cliente:
```
VITE_SUPABASE_URL=https://<nuevo-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<nueva-anon-key>
VITE_ARCA_BACKEND_URL=https://arca.srv1055314.hstgr.cloud
VITE_SENTRY_DSN=<dsn-nuevo-o-reusar-el-existente>
SENTRY_AUTH_TOKEN=<token>
SENTRY_ORG=dariodesarrollos
SENTRY_PROJECT=<nombre-proyecto-sentry>
```

### FASE 6b — Configurar secrets de Edge Functions

En Supabase del proyecto nuevo → Edge Functions → Manage secrets:

**Siempre requeridos:**
- `SUPABASE_SERVICE_ROLE_KEY` = service role key del proyecto nuevo

**Si usa módulo Promociones IA / Agente Estratégico:**
- `GEMINI_API_KEY` = clave de Google AI Studio del cliente

**Si usa Mercado Pago:**
- `MERCADOPAGO_ACCESS_TOKEN` = access token productivo del cliente (`APP_USR-...`)

### FASE 6c — Deployar Edge Functions al proyecto nuevo

```bash
# Siempre deployar (módulo promociones + estrategia)
supabase functions deploy generar-promos --project-ref <REF_NUEVO>
supabase functions deploy generar-imagen-promo --project-ref <REF_NUEVO>
supabase functions deploy analizar-identidad-visual --project-ref <REF_NUEVO>
supabase functions deploy generar-estrategia --project-ref <REF_NUEVO>

# Solo si usa Mercado Pago
supabase functions deploy crear-preferencia-mp --project-ref <REF_NUEVO>
supabase functions deploy webhook-mp --project-ref <REF_NUEVO>
```

**Nota sobre generar-imagen-promo:** acepta `tipo`: `simple` (1 imagen cuadrada, $1.250), `pack` (feed 1:1 + feed vertical 4:5 + story 9:16, $3.000), `carrusel` (hasta 5 tarjetas 1:1, $5.000). Las imágenes del pack/carrusel se guardan en `promociones.imagenes_meta` JSONB.

**Nota sobre analizar-identidad-visual:** detecta automáticamente `tipo_imagen_producto` (`FOTOGRAFIA_REAL` o `ILUSTRACION`) desde las imágenes de marca subidas. Este valor alimenta los prompts de generación para usar foto hiperrealista o ilustración según corresponda.

### FASE 6d — Configurar webhook de Mercado Pago (si aplica)

1. Ir a mercadopago.com.ar/developers → Tu aplicación → Webhooks
2. Agregar URL: `https://<nuevo-ref>.supabase.co/functions/v1/webhook-mp`
3. Eventos: `payment`

Actualizar las `back_urls` en la Edge Function `crear-preferencia-mp` con la URL de Vercel del cliente.

### FASE 7 — Deploy en Vercel

1. vercel.com → Add New Project → importar repo (o fork)
2. Framework: Vite
3. Cargar todas las variables de entorno del paso 6
4. Deploy

### FASE 8 — Configurar ARCA (si aplica)

Si el cliente usa facturación electrónica:

El backend ARCA en el VPS (`72.60.252.11`) ya está corriendo y es multi-tenant — NO necesita Docker ni instalación nueva. Lee config directamente de Supabase.

1. Configurar en Supabase del nuevo cliente (tabla `configuracion`, columna `servicios`):
```sql
UPDATE configuracion
SET servicios = jsonb_set(
  COALESCE(servicios, '{}'),
  '{arca,<LOCAL_ID>}',
  '{
    "cuit": "<CUIT_CLIENTE>",
    "punto_venta": 1,
    "modo": "produccion",
    "condicion_iva": "monotributista",
    "certificado_crt": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
    "clave_privada_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
  }'
)
WHERE id = 1;
```

2. El backend acepta `{ ventaId, localId, supabaseUrl, supabaseKey }` — si el cliente tiene su propia DB Supabase, pasar `supabaseUrl` y `supabaseKey` en el request desde el frontend.

3. Verificar con health check: `GET https://arca.srv1055314.hstgr.cloud/health`

**Nota:** el número de comprobante en el PDF usa `factura.punto_venta` y `factura.numero_comprobante` reales devueltos por AFIP — se muestra como `XXXX-XXXXXXXX`.

## Checklist final

- [ ] Schema aplicado (todas las tablas presentes)
- [ ] RLS activo en todas las tablas
- [ ] Triggers audit_log funcionando
- [ ] Tabla `saldo_marketing` con registro id=1
- [ ] Primer superadmin creado y puede loguearse
- [ ] Variables de entorno en Vercel
- [ ] Deploy exitoso en Vercel
- [ ] App accesible desde URL de Vercel
- [ ] `GEMINI_API_KEY` en Supabase secrets (si usa módulo promociones/estrategia)
- [ ] `MERCADOPAGO_ACCESS_TOKEN` en Supabase secrets (si usa MP)
- [ ] Webhook de MP configurado con URL correcta (si usa MP)
- [ ] Edge Functions deployadas en proyecto nuevo
- [ ] ARCA configurado en `configuracion.servicios.arca.<local_id>` con cuit, punto_venta, modo, cert y key (si aplica)
- [ ] Columnas `imagenes_meta` en `promociones` y `tipo_imagen_producto` en `identidad_visual` presentes en el schema
- [ ] Observability → Data API sin errores en Supabase

## Notas importantes

- **Nunca compartir** `service_role_key` en variables VITE_
- Cada cliente tiene su propia DB — los datos están completamente aislados
- El backend ARCA en la VPS puede servir a múltiples clientes simultáneamente
- El saldo de marketing es global (singleton id=1) — se comparte entre todos los locales del cliente
- Si el cliente quiere su propio Sentry, crear proyecto nuevo en sentry.io
- Los modelos Gemini activos: `gemini-2.5-flash` (texto), `gemini-2.5-flash-image` (imágenes)
