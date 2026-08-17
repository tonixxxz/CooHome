# IntercambiaHogar

Plataforma de introducción para **intercambiar hospedajes** en lugar de pagar arriendos caros. Los usuarios acuerdan solo **gastos comunes** o los costos que propongan de forma transparente.

## Funcionalidades

- **Inicio** — Introducción al concepto y hospedajes destacados
- **Explorar** — Buscar y filtrar hospedajes disponibles
- **Publicar** — Subir fotos, descripción y gastos propuestos
- **Detalle** — Galería, gastos, reseñas y botón de chat
- **Chat** — Mensajería para acordar intercambios
- **Reseñas** — Calificación con estrellas y comentarios
- **Términos y condiciones** — Reglas de la comunidad
- **Denuncias** — Reportar publicaciones o conductas inapropiadas

## Cómo ejecutar

No requiere Node.js ni instalación. Abre `index.html` en tu navegador:

1. Navega a la carpeta del proyecto
2. Haz doble clic en `index.html`, o
3. Arrastra el archivo a Chrome, Edge o Firefox

Los datos se guardan en **localStorage** del navegador (modo prototipo).

## Estructura

```
intercambio-hospedaje/
├── index.html
├── css/styles.css
├── js/
│   ├── store.js    # Datos y persistencia
│   └── app.js      # Vistas y navegación
└── README.md
```

## Próximos pasos (producción)

- Backend con autenticación de usuarios
- Base de datos para hospedajes, chats y denuncias
- Moderación de contenido y verificación de identidad
- Pagos opcionales solo para gastos acordados
