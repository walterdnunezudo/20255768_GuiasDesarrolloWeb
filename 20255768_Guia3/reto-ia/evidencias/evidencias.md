# Evidencias del Reto IA – Guía 3

## 1. Herramienta utilizada
Claude (Anthropic). *(Confirma que sea distinta a las usadas en las guías 1 y 2.)*

## 2. Instrucción enviada
Actúa como desarrollador web. Crea una nueva versión de la página de inicio del sitio "Trío Azteca de El Salvador",
un trío musical salvadoreño de boleros y serenatas, cuya finalidad es mostrar el servicio y recibir contrataciones.
Conserva: menú (Inicio, Repertorio & Demos, Contrataciones), botón de WhatsApp, sección hero, filosofía del trío,
dos muestras de audio, tres servicios (serenatas, bodas, galas) y pie con contacto.
Mantén la identidad visual del sitio: tonos cálidos oscuros, dorado como acento, tipografía con serifa.
Construye la distribución principal de la página con CSS Grid (display: grid, grid-template-columns,
grid-template-areas y gap), no solo en una galería. Flexbox solo dentro del menú y los botones.
Entrega por separado un archivo index.html y un archivo css/style.css, ambos comentados.

## 3. Código originalmente generado
Guarda aquí una copia de index.html y style.css tal como los entregó la herramienta, antes de tus correcciones.

## 4. Código final
`../index.html` y `../css/style.css`.

## 5. Cambios realizados al resultado original (completa con los tuyos)
- Se verificaron las rutas de imágenes y audios (assets/img y assets/audio).
- Se verificó que los enlaces de repertorio.html y contrataciones.html apunten a las páginas del sitio.
- Se ajustaron los colores a la identidad de las guías anteriores.
- Se añadió el área "pie" y el media query para una sola columna en móvil.

## Guion de la propiedad a modificar en vivo (video)
Cambiar `grid-template-columns: 3fr 2fr` a `1fr 1fr` en `.pagina`: se espera que Filosofía y Muestras ocupen el mismo ancho.
