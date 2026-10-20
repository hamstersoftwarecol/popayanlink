# Despliegue en la cuenta de Cloudflare del propietario

Publicado el 20 de octubre de 2026, en America/Bogota.

**URL pública:** https://drivelink.business-alejandrolopezmurillo.workers.dev

## Recursos activos

| Recurso | Nombre / binding | Estado |
| --- | --- | --- |
| Cloudflare Worker | `drivelink` | Publicado en workers.dev |
| D1 | `drivelink` / `DB` | Dos migraciones aplicadas, siete tablas de aplicación |
| KV | `DRIVELINK_CACHE` / `CACHE` | Conectado y comprobado por el servidor |
| Límite de solicitudes | `PUBLIC_API_LIMITER` | 30 solicitudes por minuto por IP para presupuesto, reserva, leads y publicaciones |
| Logs | Observability | Activos con muestreo del 10% |

El despliegue público fue autorizado expresamente por el propietario. La copia de Sites conserva su audiencia privada. Cada instalación tiene una D1 independiente; no se comparten reservas ni secretos entre ambas.

El administrador permanece protegido: `LOCAL_ADMIN=false` y los endpoints administrativos requieren una cuenta de Clerk autorizada. El sitio público funciona como catálogo de ejemplo hasta configurar los datos reales y las integraciones.

## Comprobación después de publicar

- Página principal: HTTP 200.
- API de catálogo y sesión: HTTP 200.
- KV detectado por el servidor.
- Endpoint administrativo sin cuenta autorizada: HTTP 403.
- Presupuesto calculado en el servidor.
- Solicitud de prueba guardada en D1 remota, con reintento idempotente.
- Vehículo excluido de la disponibilidad durante la solicitud.
- Una segunda sesión de invitado no pudo ver la solicitud de la primera.
- Solicitud QA `DL-136048DD` cancelada al terminar, sin cobro ni mensajes externos.
- Compilación y TypeScript correctos; 15/15 pruebas aprobadas.
- Cero vulnerabilidades detectadas por `npm audit --omit=dev`.

## Volver a desplegar

La configuración real de producción está en `wrangler.cloudflare.jsonc`. El archivo `wrangler.jsonc` mantiene la configuración de desarrollo local.

```sh
npm ci
npm run deploy:cloudflare
```

El comando compila, comprueba tipos, ejecuta las pruebas, aplica migraciones pendientes a D1 remota y publica el Worker. No carga datos de ejemplo mediante migraciones ni borra reservas existentes. `npm run deploy` ejecuta el mismo flujo.

## Activar integraciones

Faltan las claves de Clerk, Vapi, Kapso y la pasarela de pagos. No se generan ni se inventan credenciales. Para cargarlas sin guardarlas en Git:

1. Copiar `.env.example` a `.env.production` (archivo ignorado).
2. Completar solo las claves de producción de los proveedores.
3. Establecer `APP_ORIGIN=https://drivelink.business-alejandrolopezmurillo.workers.dev` y los IDs administrativos autorizados.
4. Ejecutar:

```sh
npm run secrets:cloudflare
```

El script envía únicamente las claves permitidas mediante stdin a Wrangler. No muestra los valores, no sube `LOCAL_ADMIN` y no almacena credenciales en el repositorio. El comando de carga puede crear una nueva versión de configuración del Worker; comprobar el estado después de cargar las claves.

Configurar estos webhooks en cada proveedor:

- Vapi: `https://drivelink.business-alejandrolopezmurillo.workers.dev/api/webhooks/vapi`
- Kapso: `https://drivelink.business-alejandrolopezmurillo.workers.dev/api/webhooks/kapso`
- Stripe opcional: `https://drivelink.business-alejandrolopezmurillo.workers.dev/api/webhooks/stripe`

Los secretos deben coincidir con los configurados en cada proveedor. Ver README.md para autenticación, firmas y eventos.

Antes de recibir clientes reales, cargar inventario y políticas reales, desactivar `DEMO_CATALOG` y retirar los datos ilustrativos de forma controlada. No se ha configurado un dominio personalizado porque el propietario no indicó ninguno.
