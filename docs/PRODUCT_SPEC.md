# Tinball — especificación funcional

## Propuesta

Tinball reduce la fricción principal del fútbol amateur: conseguir la cantidad correcta de jugadores confiables, del nivel y la zona adecuados, y convertir ese grupo en un partido efectivamente jugado. La experiencia combina descubrimiento rápido, lobbies, equipos, organización, reputación y competencia.

## Modos principales

1. **Me falta uno:** tarjetas de jugadores compatibles por posición, localidad, disponibilidad, nivel y reputación. Aceptar envía invitación; rechazar no expone a la otra persona.
2. **Lobby abierto:** jugadores individuales completan un cupo (5v5, 7v7, 8v8 u 11v11) por localidad.
3. **Lobby con premades:** equipos o grupos parciales buscan rival y completan faltantes.
4. **Desafío con premio:** módulo preparado pero desactivado hasta contar con validación legal, KYC/edad, geofencing, antifraude, pagos/escrow, impuestos y juego responsable.

## Navegación

La barra inferior se limita a cinco destinos:

- **Inicio:** feed, próximos partidos, acciones rápidas, progreso de puntos y novedades.
- **Buscar:** Me falta uno, lobbies y filtros por localidad.
- **Partidos:** calendario, historial, equipos, formación, chats y torneos.
- **Ranking:** tabla mensual, ranking personal y recompensas.
- **Perfil:** ficha pública, posiciones, métricas, valoraciones, ajustes y seguridad.

Premium, canchas, referidos, notificaciones y configuración viven como rutas secundarias, no como pestañas adicionales.

## Reputación y ranking

Se separan tres conceptos para evitar manipulación:

- **Valoración comunitaria:** de 1 a 5 balones de fútbol. Sólo participantes con check-in en un partido finalizado pueden valorar. Las reseñas se publican cuando ambas partes valoraron o al vencer una ventana de 72 horas. Etiquetas estructuradas: puntualidad, compañerismo, juego limpio, comunicación y rendimiento.
- **Tinball Rank:** puntuación competitiva calculada con resultado, dificultad del rival, formato y confiabilidad. Premium nunca da ventaja en este ranking.
- **Puntos canjeables:** fidelidad por partidos verificados, rachas y contribuciones. Premium puede multiplicarlos; no altera el mérito deportivo.

La tabla mensual conserva snapshots y un historial auditable de cada variación. Los administradores no editan el total directamente: agregan eventos compensatorios trazables.

## Ausencias, abuso y seguridad comunitaria

- Confirmación 24 h y 3 h antes del partido.
- Check-in por ventana temporal y código del organizador; la ubicación precisa no se conserva.
- Primera ausencia: advertencia y pérdida de confiabilidad.
- Reincidencia: enfriamiento progresivo de 24 h, 72 h, 7 días y revisión manual.
- Apelaciones, bloqueo y reportes disponibles desde perfil, partido y chat.
- Mensajes sólo dentro de equipos/lobbies/partidos donde el usuario es miembro.
- Moderación de texto, límites de frecuencia y registro de eventos de seguridad.

## Equipos y partidos

- Plantel con capitán, administradores, jugadores e invitados.
- Titulares y suplentes sobre una formación, con posición asignada.
- Chat de equipo persistente y chat por partido con ciclo de vida propio.
- Estados de partido: borrador, convocando, confirmado, en curso, finalizado, cancelado y disputado.
- Resultado confirmado por capitanes; desacuerdos crean una disputa moderable.
- Historial personal y de equipo, asistencias, victorias, goles/asistencias opcionales y fair play.

## Torneos

- Quincenales, mensuales y semestrales/anuales.
- Inscripción por equipo, lista bloqueada al comenzar, fixtures y llaves.
- Premios y costos se muestran en moneda y se almacenan en unidades mínimas, nunca en `float`.
- La liquidación monetaria permanece detrás de una feature flag y un ledger de doble entrada.

## Premium

- Sin anuncios.
- Lobbies verificados o de mayor compromiso.
- Multiplicador de puntos canjeables.
- Filtros avanzados y estadísticas extendidas.
- Nunca compra ranking, mejores reseñas ni inmunidad a sanciones.

## Canchas

- Directorio patrocinado claramente identificado.
- Filtros por localidad, formato, superficie, precio y servicios.
- Reseñas verificadas ligadas a reservas/partidos.
- Reserva desde Tinball preparada como integración futura, desactivada por defecto.

## Feed social

Publicaciones de resultados, búsqueda de jugadores, logros y contenido de equipo. Los resultados se enlazan a partidos verificados para impedir publicaciones falsas. Reacciones y comentarios tienen límites y herramientas de moderación.

## Referidos

La sección existe desde el MVP para compartir código, ver invitados válidos y recompensas. Los pagos en dinero quedan desactivados hasta implementar atribución antifraude, límites, retenciones impositivas, verificación de identidad y reglas de campañas. Inicialmente se recomiendan puntos o beneficios no monetarios de sponsors.

## Criterios de lanzamiento

- Login Google real y onboarding completo.
- Flujos Me falta uno, lobby abierto/premade, equipo, formación, partido y chats.
- Reviews verificadas con balones y ranking no pay-to-win.
- Herramientas de no-show, bloqueo, reporte y apelación.
- Torneos, premium, puntos, rewards, canchas y referidos con flags cuando corresponda.
- Android/iOS mediante development builds y export web estática.
- Barreras técnicas y operativas de `docs/SECURITY.md` aprobadas.

