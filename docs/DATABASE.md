# Base de datos PostgreSQL / Neon

La fuente de verdad está en `prisma/schema.prisma`; las migraciones SQL agregan constraints que Prisma no puede expresar por sí solo. La app nunca usa credenciales de Neon: sólo la API accede con `DATABASE_URL` pooled y las migraciones usan `DIRECT_URL`.

## Dominios

| Dominio | Entidades principales | Invariantes |
|---|---|---|
| Identidad | `User`, `OAuthIdentity`, `Session`, `PlayerProfile`, `UserSettings`, `PushDevice` | Google `providerSub` único, sesión opaca almacenada como HMAC, perfil 1:1 |
| Seguridad comunitaria | `UserBlock`, `Report`, `Suspension`, `NoShowEvent`, `SecurityAuditEvent` | bloqueo direccional sin auto-bloqueo, no-show único por partido/persona, auditoría append-only encadenada |
| Fútbol | `Team`, `TeamMember`, `Lobby`, `LobbyParticipant`, `Match`, `MatchParticipant`, `MatchLineupEntry` | membresías/cupos únicos, posiciones por lado, lobby único por partido |
| Resultado y reputación | `MatchResultSubmission`, `PlayerReview`, `RankingPeriod`, `RankingEntry`, `RankingEvent` | declaración única por lado, reviews únicas entre dos asistentes, efecto Elo único por usuario/partido/período |
| Social | `Conversation`, `ConversationMember`, `Message`, `FeedPost`, `FeedReaction`, `FeedComment`, `PlayerInvite` | acceso por membresía, `clientId` de mensaje único, reacción única, invitación única por contexto |
| Fidelidad | `PointsLedgerEntry`, `Reward`, `RewardRedemption`, `ReferralCode`, `Referral`, `PremiumInterest` | ledger de puntos append-only lógico, canje e impacto de partido idempotentes, un referido por invitado |
| Competencia y canchas | `Tournament`, `TournamentEntry`, `TournamentGame`, `Venue`, `VenueField`, `Booking`, `VenueReview` | plantel snapshot, inscripción única, exclusión temporal contra doble reserva |
| Dinero futuro | `WalletAccount`, `LedgerTransaction`, `LedgerEntry`, `PrizeChallenge`, `Subscription` | enteros en unidad mínima, ledger append-only y constraint diferido de partida doble |
| Operación | `Notification`, `IdempotencyRecord` | replay ligado a usuario+operación+UUID y vencimiento automático |

## Flujo transaccional crítico

```text
marcador HOME ─┐
               ├─ mismo score → Match CONFIRMED
marcador AWAY ─┘                    │
                                    ├─ RankingEvent + RankingEntry (Elo)
                                    ├─ PointsLedgerEntry (100 / Premium 150)
                                    └─ Notification

scores distintos → Match DISPUTED → resolución moderada → mismo flujo idempotente
```

Todos los pasos ocurren en transacciones `Serializable`. Constraints de dominio evitan que un retry, carrera o resolución repetida aplique puntos dos veces.

## Migraciones y entornos

- `20260802000000_init`: modelo integral, exclusión de reservas, auditoría/ledger append-only y partida doble.
- `20260802010000_user_blocks`: bloqueos personales.
- `20260802020000_ranking_idempotency`: efectos únicos de ranking y fidelidad.
- `20260802030000_match_result_submissions`: evidencia de marcadores opuestos.
- `20260802040000_premium_interest`: lista de interés Premium.

Usar ramas Neon separadas para desarrollo, preview y producción. `prisma migrate dev` sólo en desarrollo; producción usa `prisma migrate deploy` desde un rol con DDL. Ensayar PITR/restore, monitorear crecimiento de mensajes/auditoría y aprobar una matriz de retención antes del lanzamiento.
