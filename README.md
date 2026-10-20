# Drivelink

Plataforma automotriz en español con Astro 7, React, Cloudflare Workers/D1 y caché KV opcional. Incluye catálogo, solicitudes de alquiler con o sin conductor, citas de taller, reservas de compra, pruebas de manejo, portal del cliente y panel administrativo.

## Despliegue activo

URL pública en la cuenta del propietario: https://drivelink.business-alejandrolopezmurillo.workers.dev

Worker, D1 y KV publicados. Configuración y comandos: [DESPLIEGUE_CLOUDFLARE.md](./DESPLIEGUE_CLOUDFLARE.md). La copia de Sites conserva acceso privado y usa una D1 independiente.

## Estado de la entrega

Es una base funcional desplegable, con datos persistentes y APIs verificadas. Sin credenciales, el panel muestra una **vista de ejemplo**, el catálogo es ilustrativo y las solicitudes de invitado se guardan como pendientes. No se simulan llamadas, mensajes enviados ni cobros. Las operaciones administrativas están bloqueadas por defecto.

Clerk, Vapi, Kapso, KV y Stripe necesitan las cuentas, identificadores y secretos del negocio para activarse. Sus conexiones externas no se han probado con cuentas reales. Stripe es opcional y requiere una cuenta que pueda cobrar en COP. Esta versión aloja **un negocio por instalación**; no implementa suscripciones SaaS, aprovisionamiento automático de empresas ni aislamiento de múltiples negocios dentro de una sola base de datos.

## Ejecutar localmente

Requiere Node.js 24+ y npm.

```sh
npm ci
npm run db:local
npm run build
npm run preview
```

Abrir http://localhost:4321. El servidor de vista previa ejecuta el Worker y D1 reales de desarrollo. Los datos permanecen en `.wrangler/` y no se publican con el código.

Para desarrollo con recarga automática de la interfaz, ejecutar en dos terminales:

```sh
npx wrangler dev --port 8787
npm run dev
```

Copiar `.env.example` a `.dev.vars` para los secretos locales. `LOCAL_ADMIN=true` **solo** habilita administración en el host de loopback de desarrollo; nunca lo establezcas en producción. Permite probar la administración sin una cuenta de Clerk. En cuentas reales se usa Clerk.

Opcional: `npm run seed:local` carga seis vehículos y cuatro servicios ilustrativos. El seed está separado de las migraciones y no se aplica al publicar. El catálogo de ejemplo también se materializa al registrar la primera solicitud de prueba. Desactiva `DEMO_CATALOG` y usa una base limpia antes de recibir clientes reales.

## Verificación

Informe actualizado: [VERIFICACION.md](./VERIFICACION.md). La suite incluye 15 pruebas, las cinco regresiones corregidas y el límite de solicitudes del despliegue público.

```sh
npm run check
npm run build
npm test
npm audit --omit=dev
```

Las pruebas ejecutan el Worker compilado con una base SQLite que implementa la interfaz D1. Verifican: protección del administrador; sesión de invitado; persistencia; presupuesto calculado en servidor; aislamiento entre clientes; idempotencia; solicitudes concurrentes; liberación de disponibilidad; horarios del taller; origen de peticiones; servicios desactivados; HMAC de Kapso; callbacks de Vapi; control de pagos y firma/importe del webhook de Stripe.

También se aplicaron las migraciones sobre D1 local de Wrangler y se completó una reserva desde la interfaz hasta el portal en el navegador. Los datos de esa prueba quedan únicamente en la base local.

## Estructura

- `src/pages/index.astro`: documento y carga de la isla interactiva.
- `src/components/App.tsx`: panel, catálogo, formularios y portal.
- `src/styles/global.css`: diseño responsive, menú móvil y estilos.
- `worker/index.ts`: API, autenticación, webhooks y recursos estáticos.
- `worker/domain.ts`: validación, precios y transiciones de estados.
- `db/schema.ts`: esquema Drizzle.
- `drizzle/`: migraciones versionadas, incluidos triggers de exclusión.
- `db/seed.sql`: inventario ilustrativo, carga opcional.
- `scripts/build-worker.mjs`: empaqueta el sitio Astro y el Worker ESM.
- `tests/worker.test.mjs`: pruebas de integración.

Astro genera el frontend estático. Un Worker ESM sirve el frontend y las APIs en el mismo origen. Los recursos se incluyen en el Worker para que el paquete funcione con hosting Workers sin requerir un binding adicional de archivos. El SDK de voz y Clerk se cargan dinámicamente al necesitarlos.

## Identidad y permisos: Clerk

Configura los valores de `.env.example` en el entorno del Worker:

- `CLERK_PUBLISHABLE_KEY`: clave pública de la aplicación.
- `CLERK_SECRET_KEY`: secreto del backend.
- `ADMIN_USER_IDS`: IDs de usuario de Clerk separados por coma, sin asignaciones a partir de datos editables por el usuario.
- `APP_ORIGIN`: origen exacto de tu despliegue.
- `DEMO_CATALOG=false`: no ofrecer inventario ilustrativo en una base vacía.

El cliente envía un token de sesión Bearer; el servidor verifica firma y origen autorizado. Cada recurso administrativo comprueba permisos. Los clientes solo ven/cancelan sus reservas. Sin Clerk, una cookie de invitado aleatoria, HttpOnly, SameSite y Secure en HTTPS mantiene las reservas en ese navegador. Una reserva de invitado no se transfiere automáticamente al iniciar sesión: implementa verificación de propiedad antes de migrarla a una cuenta permanente.

Guía oficial: https://clerk.com/docs/reference/backend/verify-token

## Alquiler, taller y ventas

Los importes son enteros COP y se calculan exclusivamente en servidor. Un día de alquiler es cada período iniciado de 24 horas, máximo 90 días. Extras de ejemplo: conductor $120.000/día, entrega $60.000, garantía reembolsable $500.000. Ajustar estas políticas en `worker/domain.ts` antes de operar. La dirección de entrega se recoge en observaciones.

El taller atiende lunes a sábado de 08:00 a 18:00 en America/Bogota y utiliza una capacidad simultánea de una cita. Para varios puestos o técnicos hay que modelar recursos adicionales. Las citas se bloquean por su duración real. Los triggers de SQLite impiden reservas de vehículo y citas solapadas, incluso ante peticiones simultáneas. Las solicitudes pendientes retienen disponibilidad hasta cancelación o gestión del administrador; aún no existe vencimiento automático.

La reserva de compra registra un depósito de $2.000.000. La prueba de manejo es gratuita. Una reserva de venta activa retiene el vehículo. Una compra completa, financiación, transferencias de propiedad y documentación comercial se tramitan fuera de esta versión. Las publicaciones de propietarios requieren aprobación del administrador.

El administrador importa CSV transaccional (máximo 200 filas/250 KB), añade servicios, activa/desactiva categorías y verifica pagos manuales. Campos de CSV obligatorios: `name,brand,category,year,daily_rate,plate,image`. Opcionales: `seats,sale_price,transmission,fuel`. Fotos HTTPS. Las matrículas son únicas.

## Agentes de voz: Vapi

Configurar `VAPI_PUBLIC_KEY`, los cuatro IDs de asistente y `VAPI_WEBHOOK_SECRET`. Crear agentes en español para recepcionista, alquiler, taller y venta. Configurar su Server URL en `https://TU_DOMINIO/api/webhooks/vapi` y la autenticación de servidor Bearer con el mismo secreto. No configurar el secreto en el navegador.

Herramientas soportadas:

| Nombre | Argumentos |
| --- | --- |
| `get_catalog` | `{}` |
| `check_availability` | `{startAt,endAt}` como fechas ISO UTC |
| `get_quote` | Datos de la solicitud (ver abajo) |
| `create_booking` | Datos de la solicitud con consentimiento del cliente |

Datos: `kind` (`rental`, `repair`, `sale`, `test_drive`), `vehicleId` o `serviceId`, `vehicleDetails` para taller, `name`, `email`, `phone`, `startAt`, `endAt` para alquiler, `driver`, `delivery` (`office`/`delivery`), `paymentMethod` (`store`/`transfer`), `notes` opcional. El servidor asigna idempotencia estable a cada llamada de herramienta de Vapi. El agente debe confirmar los datos antes de solicitar la reserva y decir que queda pendiente de confirmación y pago.

Habilitar eventos `tool-calls` y `end-of-call-report`. La extracción `analysis.structuredData` puede incluir `callbackRequested` (booleano), `name` e `interest`. Solo se captura un lead por llamada cuando se solicita expresamente una devolución y existe teléfono del cliente. No se realiza ninguna llamada saliente automáticamente.

Documentación: https://docs.vapi.ai/server-url y https://docs.vapi.ai/quickstart/web

## WhatsApp: Kapso

Configurar `KAPSO_API_KEY`, `KAPSO_PHONE_NUMBER_ID`, `KAPSO_WEBHOOK_SECRET`. Registrar `https://TU_DOMINIO/api/webhooks/kapso` para `whatsapp.message.received`. Se verifica HMAC SHA256 del cuerpo original y se deduplican mensajes por ID externo. Se admiten eventos individuales y lotes.

Los administradores pueden enviar texto desde una reserva. El endpoint usa la API oficial `https://api.kapso.ai/meta/whatsapp/v24.0/PHONE_ID/messages`. La respuesta significa aceptado por el proveedor, no entrega confirmada. Los mensajes libres requieren la ventana de atención de WhatsApp; fuera de ella hay que configurar plantillas aprobadas (no incluidas). No hay bot de texto generativo ni seguimiento de entregas en esta versión.

Documentación: https://docs.kapso.ai/docs/whatsapp/send-messages/text y https://docs.kapso.ai/docs/platform/webhooks/security

## Pagos en línea: Stripe opcional

Configurar `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`. El portal mostrará “Pagar en línea” para solicitudes elegibles. Se cobra el servicio y, en alquileres, la garantía; para compra se cobra solo el depósito. El servidor crea un Checkout con importe y moneda propios. El navegador nunca decide precios ni puede marcar pagos como completados.

Webhook: `https://TU_DOMINIO/api/webhooks/stripe`, eventos `checkout.session.completed` y `checkout.session.async_payment_succeeded`. Se verifican firma, antigüedad, moneda e importe antes de registrar pago. Los eventos se deduplican. Un pago posterior a una cancelación se marca `refund_required` para gestión manual. No se reembolsa dinero automáticamente.

La cuenta del negocio debe ser elegible para Stripe y COP. Si necesita una pasarela local, sustituir este adaptador. Los pagos en tienda/transferencia siguen operativos con confirmación manual del administrador. Los comprobantes CSV **no son facturas fiscales**; integración con un proveedor de facturación electrónica y obligaciones locales quedan pendientes.

Documentación: https://docs.stripe.com/api/checkout/sessions/create y https://docs.stripe.com/webhooks

## Cloudflare D1 y KV

El binding D1 se llama `DB`. La caché KV opcional se llama `CACHE`; solo almacena configuración con TTL de 60 s, nunca disponibilidad ni datos de pago. La base D1 es la fuente de verdad y el sistema funciona sin KV.

El despliegue de la cuenta del propietario ya está configurado en `wrangler.cloudflare.jsonc`, con los IDs reales de D1 y KV. `wrangler.jsonc` mantiene el marcador local para la vista previa. No cambiarlo para publicar.

```sh
npm run deploy:cloudflare
```

El comando compila, comprueba tipos y pruebas, aplica las migraciones remotas y publica. Para cargar las claves reales desde `.env.production` (ignorado por Git), usar `npm run secrets:cloudflare`. El procedimiento completo y la URL están en [DESPLIEGUE_CLOUDFLARE.md](./DESPLIEGUE_CLOUDFLARE.md).

La instalación de Sites provisiona su propia D1 según `.openai/hosting.json` y aplica las migraciones del paquete; esa copia funciona sin KV. Las dos instalaciones tienen bases y variables independientes. Nunca guardar secretos en Git.

## Antes de operar públicamente

Configurar credenciales, inventario, servicios y políticas reales; comprobar Clerk, voz, mensajería y pagos con cuentas de prueba; definir privacidad/consentimiento, términos y gestión de devoluciones; activar protección contra abuso (rate limiting/Turnstile/WAF), monitorización y copias de seguridad según el volumen del negocio. No publicar el catálogo ilustrativo como inventario real. El despliegue inicial de Sites conserva acceso privado del propietario y no cambia la audiencia automáticamente.
