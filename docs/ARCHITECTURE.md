# Arquitectura de Tinball

## Límites del sistema

```text
Expo React Native (Android / iOS / Web)
        │ HTTPS + sesión nativa/cookie web
        ▼
Fastify API en Render ─── Redis (rate limit, nonce, presence)
        │
        ├── Neon PostgreSQL (datos transaccionales)
        ├── Object storage privado (fotos/evidencia; integración futura)
        ├── Google OAuth verification
        └── Workers (notificaciones, retención, ranking, moderación)
```

La app nunca conecta directamente a Neon. Todas las autorizaciones y mutaciones pasan por la API. La API usa `DATABASE_URL` pooled para tráfico y `DIRECT_URL` para migraciones/restore.

## Aplicación móvil

- Arquitectura por feature: `auth`, `home`, `discovery`, `lobbies`, `matches`, `teams`, `chat`, `rankings`, `tournaments`, `rewards`, `venues`, `referrals`, `profile`.
- Pantallas separadas de sus archivos `ScreenStyled.ts`.
- Tema semántico central; ningún color de marca hardcodeado en pantallas.
- Navegación tipada con native stack. La barra principal conserva cinco destinos.
- Servicios HTTP fuera de componentes/providers.
- Token nativo en SecureStore; web sólo cookie HttpOnly.
- Datos demo aislados y disponibles únicamente en builds de desarrollo.
- Listas virtualizadas con FlashList; imágenes con `expo-image`.

## API

- Rutas agrupadas por dominio, schemas Zod y autorización por membresía.
- El usuario/sender se deriva de la sesión; no se acepta desde el body.
- Idempotency keys para inscripciones, resultados, canjes y pagos.
- Concurrencia protegida por transacciones y constraints únicas.
- Errores públicos normalizados; logs estructurados sin tokens ni PII.
- Features financieras fail-closed mediante variables de entorno.

## Datos

Las entidades principales se encuentran en `prisma/schema.prisma`. Los puntos/ranking/pagos usan ledgers append-only. Reviews requieren partido finalizado y participación comprobada por reglas de servicio más constraints. Soft delete/pseudonimización se reserva para contenido con obligaciones de retención; sesiones, dispositivos y datos efímeros se eliminan.

## Despliegue

- Render Web Service: API y health checks.
- GitHub Actions programado: invoca cada 15 minutos el endpoint interno autenticado para retención, vencimientos, suspensiones y recálculo de valoraciones. Render Cron no ofrece plan Free.
- Neon: ramas separadas para desarrollo/preview/producción.
- GitHub Pages: `expo export --platform web`; sólo variables `EXPO_PUBLIC_*` no secretas.
- EAS: development/preview/production profiles para Android e iOS.

Para la web autenticada se recomiendan dominios hermanos HTTPS (por ejemplo `app.tinball.com` en GitHub Pages y `api.tinball.com` en Render). Así la cookie HttpOnly permanece first-party/same-site. Los dominios por defecto `github.io` y `onrender.com` son cross-site entre sí y no constituyen una configuración final robusta frente al bloqueo moderno de cookies de terceros.
