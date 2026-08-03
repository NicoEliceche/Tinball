# API v1

Todas las rutas salvo health, login e internas requieren sesión. Las rutas de producto requieren además onboarding completo y cuenta activa.

- Auth/perfil: `POST /auth/google`, `GET /auth/me`, `POST /auth/logout`, `GET /profile/me`, `PUT /profile/onboarding`, `PUT /profile/settings`.
- Cuenta: `GET /account/export` y `DELETE /account` con reautenticación Google. Exportación y borrado siguen disponibles por API durante una suspensión.
- Descubrimiento/invitaciones: `GET /players/discover`, `GET /players/:id`, `GET /players/:id/reviews`, `POST|DELETE /players/:id/block`, `POST /players/:id/invite`, `GET /invites`, `POST /invites/:id/respond`.
- Lobbies: `GET|POST /lobbies`, `GET /lobbies/:id/requests`, `POST /lobbies/:id/join`, respuesta del organizador y conversión de lobby completo a partido confirmado.
- Partidos: `GET /matches/me`, `GET /matches/:id`, confirmación de asistencia, formación, código/check-in, resultado por representantes opuestos y no-show. El segundo marcador coincidente aplica Elo y puntos una sola vez; una diferencia crea disputa.
- Equipos/chat: `POST /teams`, `GET /teams/:id`, conversaciones y mensajes autorizados por membresía.
- Social: feed, publicaciones verificadas, reacciones y comentarios moderados.
- Competencia: ranking actual, torneos, detalle e inscripción por capitán. Los torneos monetarios fallan cerrados por feature flag.
- Fidelidad: recompensas y canje serializable por puntos.
- Premium: `POST /premium/interest`; la compra permanece deshabilitada hasta integrar tiendas y términos comerciales.
- Canchas: directorio/detalle y reserva detrás de feature flag.
- Cuenta/comunidad: notificaciones, referidos, reportes, suspensiones y apelaciones.
- Administración: colas y decisiones de moderación protegidas por rol, incluida evidencia por lado y resolución de resultados disputados.

Los errores siguen `{ error: { code, message, requestId, fieldErrors? } }`. Las mutaciones de alto impacto incluyen UUID de idempotencia en el body. El detalle de contratos está en `packages/contracts/src/index.ts`.
