# Tinball — sistema de diseño maestro

**Fuente:** UI/UX Pro Max, identidad de `public/assets/tinball_logo2.jpeg` y validación específica para producto deportivo móvil.

## Dirección

- Estilo: **Match Night / Modern Dark**, energético pero legible.
- Producto: comunidad, coordinación y competencia de fútbol amateur.
- Diales: variación 6/10, movimiento 5/10, densidad 6/10.
- La interfaz debe sentirse como previa de partido: oscura, enfocada, con acentos de cancha y datos claros.

## Colores

| Rol | Dark | Light | Uso |
|---|---|---|---|
| Primario | `#2FD05A` | `#157A35` | CTA, estado activo, progreso |
| Primario fuerte | `#20A947` | `#0E5B27` | pressed, texto sobre fondos claros |
| Fondo | `#07090C` | `#F4F7F3` | pantalla |
| Superficie | `#11151A` | `#FFFFFF` | tarjetas |
| Superficie elevada | `#191F25` | `#EAF0E9` | sheets, inputs |
| Texto | `#F7FAF7` | `#101612` | principal |
| Texto secundario | `#B7C1B9` | `#4C5C50` | apoyo |
| Borde | `#2B3530` | `#CED9D0` | separación |
| Información | `#5DA9FF` | `#1769AA` | info |
| Advertencia | `#F7C948` | `#8A5A00` | pendientes |
| Peligro | `#FF5C6C` | `#B42335` | rechazo, sanción, destrucción |

El rojo del logo sólo representa rechazar, error o peligro. Nunca se usa como CTA normal. El verde funcional siempre se acompaña con icono/texto para no depender sólo del color.

## Tipografía

- Titulares y números deportivos: **Barlow Condensed 700/800**.
- Cuerpo, controles y chat: **Barlow 400/500/600/700**.
- Titulares en sentence case; mayúsculas sólo para marcadores, overlines y etiquetas breves.
- Escala móvil: 12, 14, 16, 18, 22, 28, 36. Texto base mínimo 16 cuando es lectura continua.
- Números de ranking/resultado con figuras tabulares cuando la plataforma lo soporte.

## Forma y espacio

- Ritmo 4/8 dp: 4, 8, 12, 16, 24, 32, 40, 48.
- Touch target: 48 dp; separación mínima 8 dp.
- Radios continuos: 10, 14, 18, 24; pills sólo para chips/estado.
- Tarjetas con borde sutil y elevación baja; no glassmorphism sobre listas largas.
- Contenido máximo en tablet/web: 720 dp para lectura, 1180 dp para dashboards.

## Navegación e interacción

- Cinco tabs como máximo, siempre icono + texto.
- Stack nativo para rutas profundas y back predecible.
- Una CTA primaria por pantalla.
- Feedback de toque dentro de 100 ms; transición 160–240 ms.
- Animar sólo transform/opacity. Respetar Reduce Motion.
- Swipes de descubrimiento siempre tienen botones visibles equivalentes.

## Componentes distintivos

- `FootballRating`: 1–5 balones vectoriales con labels accesibles.
- `PlayerCard`: foto, posición, distancia aproximada, nivel y confiabilidad.
- `MatchCard`: fecha, formato, cupos, localidad, organizador y compromiso.
- `ScoreBoard`: alto contraste, números grandes, estado textual.
- `ReliabilityBadge`: porcentaje + texto; nunca sólo color.
- `FeatureGate`: explica por qué Premium/compliance bloquea una función.

## Accesibilidad y entrega

- Contraste AA: 4.5:1 texto, 3:1 UI grande.
- Dynamic Type sin cortar nombres, localidades o CTAs.
- Labels/hints en controles; orden de lectura igual al visual.
- Safe areas y contenido inferior reservado para tabs.
- Estados vacío, carga, offline, error y disabled en todos los flujos.
- Validar 375 px, teléfono grande, tablet y landscape; dark/light por separado.
- Sin emojis como iconos estructurales; una sola familia Ionicons.
