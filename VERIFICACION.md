# Verificación de Drivelink

Fecha: 20 de octubre de 2026 (America/Bogota).

## Resultado

La aplicación base funciona en las comprobaciones realizadas. Se corrigieron cinco fallos encontrados al ampliar la revisión. No está lista para una operación comercial completa: las integraciones externas y el inventario real siguen pendientes.

## Comprobaciones completadas

- TypeScript: sin errores.
- Compilación de Astro y Worker: correcta. Persiste una advertencia de optimización por un chunk de SDK superior a 500 KB; no impide la compilación.
- Pruebas automatizadas: 20/20 aprobadas, ejecutando el Worker compilado contra SQLite con las migraciones D1.
- Dependencias de producción: `npm audit --omit=dev`, cero vulnerabilidades detectadas.
- Cloudflare Wrangler con D1 local: solicitudes de alquiler, taller y reserva de compra; cálculo de precio; persistencia; reintentos idempotentes; consulta de disponibilidad y cancelación. Todo correcto.
- Pago manual simulado únicamente en un registro QA local: al cancelar queda `refund_required`. No hubo movimientos de dinero.
- Navegador local: catálogo, taller, ventas, reservas, clientes, agentes, mensajes, finanzas, configuración, sitio web y portal cargan sin errores de conexión.
- Clerk local: SDK e interfaz Core 3 cargan; la ventana real de inicio de sesión abre correctamente. Inicio de sesión, registro y menú de cuenta integrados; no se completó una sesión de usuario.
- Clerk en workers.dev: `/api/session` confirma la instancia de desarrollo conectada; inicio de sesión y registro abren en español, con aviso visible de prueba. `/api/admin/overview` mantiene HTTP 403 para invitados. Falta el registro e inicio de sesión del propietario para verificar una sesión real.
- Dominio adicional `drivelink.agryvalores.com`: HTTPS y `/api/session` responden 200. El propietario mantiene workers.dev como URL principal.
- Hosting: sitio activo, acceso privado del propietario conservado.
- D1 desplegada: binding `DB` y siete tablas de la aplicación presentes.
- Logs de producción consultados, ventana de 180 minutos: sin eventos de error registrados. Esto no sustituye pruebas de tráfico real.

## Landing y protección de rutas

- Landing pública en `/`, con navegación y diseño propios, servicios, catálogo destacado, preguntas frecuentes y publicación de propietarios.
- Revisión visual en escritorio y en 390 px, menú móvil y apertura del formulario de taller correctos.
- Rutas públicas mantienen HTTP 200 al recargar y no incluyen el menú ni los informes administrativos en el HTML inicial.
- Páginas `/dashboard` y `/dashboard/*` redirigen visitantes a `/acceso`, con `Cache-Control: no-store`.
- El enlace antiguo `/#dashboard` también termina en el acceso sin mostrar el panel.
- Después de publicar en Cloudflare: raíz, catálogo, taller, ventas y portal devuelven HTTP 200; `/dashboard` y `/dashboard/clientes` devuelven HTTP 302 hacia `/acceso`; la API administrativa mantiene HTTP 403 sin autorización.
- Pruebas con JWT RSA generados localmente: el administrador autorizado accede; un cliente autenticado no recibe permisos; tokens vencidos y de otro origen se rechazan. No se crearon usuarios de prueba en Clerk.
- Las APIs administrativas conservan la validación Bearer y no aceptan la cookie de página como sustituto. El parámetro de retorno del acceso rechaza destinos externos.

## Fallos reproducidos y corregidos

1. **Catálogo y publicaciones pendientes.** Un auto de propietario pendiente de aprobación podía impedir materializar el vehículo de ejemplo al reservar, causando un error de clave foránea. Ahora se comprueba la existencia del vehículo seleccionado.
2. **Disponibilidad.** Un auto con reserva de compra activa podía aparecer disponible para fechas posteriores al plazo mostrado, aunque la base de datos rechazaba la reserva. La consulta web y la herramienta Vapi comparten ahora la política de bloqueo. Las búsquedas por fecha también excluyen autos en mantenimiento.
3. **Validación de fechas.** La búsqueda aceptaba intervalos incompletos o invertidos. Ahora exige ambas fechas, orden válido, inicio futuro y máximo 90 días.
4. **Pruebas de manejo.** Se permitía iniciar antes del cierre y terminar después. Ahora se valida la hora final, igual que en el taller.
5. **Cancelación con pago recibido.** Un registro pagado cancelado conservaba el estado de pago sin señalar la devolución. Ahora queda marcado `refund_required`; la devolución efectiva requiere gestión del negocio.

Cada corrección tiene una prueba de regresión que falló antes del cambio y pasó después.

## Límites de esta verificación

En la revisión inicial, el usuario eligió pruebas locales y no se completó el inicio de sesión en la copia privada de Sites. Después autorizó publicar en su cuenta de Cloudflare. En ese despliegue público se comprobó una reserva de invitado, su aislamiento, disponibilidad e idempotencia contra D1 remota, y se canceló al terminar. No se probó una cuenta real de Clerk. Ver DESPLIEGUE_CLOUDFLARE.md para la comprobación remota.

El entorno de Sites consultado no tenía variables configuradas. El despliegue propio de Cloudflare ya tiene D1 y KV y las claves de la instancia de desarrollo de Clerk, activadas por elección del propietario para workers.dev. No hay instancia de producción de Clerk ni cuenta administrativa asignada. No se verificaron con proveedores reales:

- Inicio de sesión y permisos con cuentas de Clerk.
- Llamadas y agentes Vapi.
- Envío o recepción reales de WhatsApp con Kapso.
- Cobros y reembolsos en una pasarela de pago.

KV sí quedó conectado y comprobado en el despliegue propio de Cloudflare; continúa sin binding en la copia de Sites.

Las pruebas de webhooks verifican autenticación, firmas, importes e idempotencia usando eventos sintéticos. No equivalen a una validación de extremo a extremo con los proveedores.

El catálogo inicial sigue siendo ilustrativo. Esta versión funciona con un negocio por instalación. La facturación fiscal, las suscripciones SaaS y la multitenencia no están implementadas. La compra completa y los reembolsos se gestionan fuera de la aplicación. Consultar README.md para configuración y límites operativos.
