# Seguridad de Tinball

Ningún sistema conectado a Internet puede garantizar estar “completamente blindado”. Esta base reduce superficie de ataque, falla de forma cerrada en funciones sensibles y deja trazabilidad, pero un lanzamiento real requiere revisión independiente, monitoreo continuo y respuesta operativa.

## Modelo de amenazas

Los activos principales son cuentas y reputación, conversaciones, ubicaciones aproximadas, resultados, puntos, reservas y eventualmente dinero. Los adversarios considerados incluyen cuentas falsas, robo de sesión, abuso entre jugadores, organizadores maliciosos, bots, fraude de referidos, manipulación de resultados, sobreventa de cupos/turnos, filtración de secretos y personal interno con privilegios.

Los límites de confianza son: dispositivo ↔ API, API ↔ Google, API ↔ Neon/Redis, worker ↔ API y moderador ↔ herramientas administrativas. La app nunca recibe credenciales de Neon ni secretos de servidor.

## Controles implementados

- Google ID Token verificado en servidor contra audiencias separadas por plataforma; no se confía en datos de perfil enviados por el cliente.
- Sesiones opacas de 256 bits. En PostgreSQL sólo queda un HMAC; Android/iOS usa SecureStore y web una cookie `HttpOnly`, `Secure` en producción y `SameSite=Lax`.
- Verificación de `Origin` en mutaciones autenticadas por cookie, CORS por allowlist y Helmet.
- Zod en todos los cuerpos/parámetros sensibles, límite de cuerpo de 1 MiB, timeouts y errores sin stack ni PII.
- Rate limit local general y Upstash distribuido para login, escrituras y códigos de check-in. En producción las rutas sensibles devuelven 503 si Redis no está configurado.
- Autorización por membresía/rol; `senderId`, `userId` y propietarios siempre salen de la sesión.
- Transacciones `Serializable`, constraints y claves de idempotencia para cupos, resultados, inscripciones y canjes.
- Resultado confirmado por representantes de lados opuestos; cada declaración se conserva separada y una discrepancia queda `DISPUTED` hasta resolución moderada auditada.
- Check-in con código rotativo, ventana temporal y sin persistir geolocalización precisa.
- Reviews sólo entre asistentes verificados, ciegas hasta reciprocidad o 72 h, con moderación y valoración de 1 a 5 balones.
- Ausencias progresivas, confiabilidad, suspensión temporal, apelación y resolución por moderador.
- Bloqueo personal persistente: excluye descubrimiento, invitaciones y feed en ambos sentidos, cancela invitaciones pendientes y deja evento de auditoría.
- Exportación de datos con selección explícita y borrado con reautenticación Google, revocación de sesiones, cancelación futura y seudonimización histórica.
- Ranking Elo y puntos de fidelidad en ledgers separados; constraints de dominio impiden aplicar dos veces un mismo partido. Premium sólo multiplica fidelidad.
- Logs con tokens/cookies redactados; IP y user-agent se guardan como HMAC. Auditoría encadenada y append-only.
- Ledger monetario append-only, montos enteros en unidad mínima y constraint diferido de doble entrada.
- Reservas protegidas contra solapamiento en PostgreSQL.
- Desafíos con dinero, pagos de referidos, compra Premium y reservas permanecen desactivados por defecto.

## Hallazgo transitorio de dependencias

`npm audit` reporta actualmente 13 hallazgos moderados encadenados desde tooling de Expo hacia `xcode@3.0.1 → uuid@7.0.3` (GHSA-w5hq-g745-h8pq). El código vulnerable corresponde a variantes UUID con buffer aportado por el llamador dentro de tooling de generación iOS; Tinball no usa esa API en runtime. `expo-doctor` exige el árbol compatible con SDK 57 y el arreglo sugerido por npm degrada Expo de forma incompatible, por lo que no se fuerza. CI sí bloquea cualquier hallazgo `high` o `critical`; este riesgo moderado debe revisarse en cada actualización oficial de Expo.

## Obligatorio antes de producción

1. Configurar dominios HTTPS definitivos, clientes OAuth reales, rotación de secretos y Upstash; nunca reutilizar secretos entre entornos.
2. Usar ramas Neon separadas, rol de runtime sin DDL, rol de migraciones separado, PITR/backups y restore ensayado.
3. Ejecutar SAST, análisis de dependencias, DAST y pentest independiente sobre API, web y builds nativos.
4. Activar protección de ramas, revisión de dos personas para auth/pagos/migraciones, Dependabot/Renovate y commits firmados.
5. Conectar moderación real, alertas, métricas, trazas, Sentry equivalente sin PII y guardias de incidentes.
6. Revisar legalmente y publicar los borradores de Términos, Privacidad y reglas comunitarias; configurar canal de soporte y URLs públicas. Borrado/exportación y apelación ya existen técnicamente, pero requieren procedimiento operativo.
7. Para dinero: dictamen legal por jurisdicción, 18+, KYC/AML cuando aplique, geofencing, PSP/escrow, conciliación, chargebacks, impuestos, antifraude y juego responsable. No habilitar flags antes.
8. Para tiendas: validar políticas vigentes de Google Play y App Store sobre suscripciones, premios y pagos.

## Operación e incidentes

- Alertas mínimas: picos de 401/403/429, errores de Google, rate limiter degradado, cambios de rol, suspensiones, disputas, fallas de ledger y roturas de la cadena de auditoría.
- Ante robo de sesión: revocar sesiones del usuario, rotar peppers si hubo acceso a base, invalidar todas las sesiones y preservar auditoría.
- Ante filtración: aislar servicio, rotar credenciales, evaluar alcance, restaurar desde punto conocido y aplicar el proceso legal de notificación.
- No borrar eventos de auditoría ni ledger. Las correcciones se agregan como eventos compensatorios.

Ejecutar `npm run security:check` y `npm run verify` antes de cada entrega.
