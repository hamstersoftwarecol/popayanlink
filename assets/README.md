# Fotografías incluidas en Drivelink

Las seis fotografías de vehículos se descargaron el 20 de octubre de 2026 desde los identificadores de Unsplash ya utilizados por el proyecto. `vehicle-images.json` conserva esos identificadores y los nombres de archivo para documentar su procedencia.

Los archivos WebP están en `public/images/`, aproximadamente 844 KB en total. La foto de Porsche también se utiliza en la portada y en los fondos del panel. Las páginas y el catálogo usan direcciones del mismo origen `/images/...`; el visitante no solicita estas imágenes a Unsplash.

Las compilaciones y los despliegues usan los archivos guardados. No descargan fotografías. Solo para volver a descargar deliberadamente los originales:

```sh
npm run images:download
```

Las integraciones de autenticación, pagos y mensajería siguen requiriendo conexión. Este cambio no añade un modo sin conexión a esas funciones.
