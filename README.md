# Tinball

Tinball es una plataforma social de fútbol amateur para encontrar jugadores, completar equipos, crear lobbies por localidad, organizar partidos y torneos, administrar planteles, conversar, calificar asistencia/rendimiento y canjear puntos de fidelidad.

## Arquitectura

- `apps/mobile`: Expo SDK 57 + React Native 0.86 para Android, iOS y web.
- `apps/api`: API Fastify para Render, con autenticación Google verificada en servidor.
- `packages/contracts`: contratos Zod y tipos compartidos entre app y API.
- `prisma`: modelo PostgreSQL/Neon, migraciones y seed de desarrollo.
- `design-system/tinball`: fuente de verdad visual generada y ajustada con UI/UX Pro Max.
- `docs`: producto, arquitectura, seguridad y despliegue.

Render aloja la API. La exportación web de Expo puede publicarse como sitio estático en GitHub Pages o Render Static Sites. Una app web autenticada debe usar un dominio HTTPS permitido explícitamente por CORS; en producción conviene usar dominios hermanos (`app.tinball.com`/`api.tinball.com`) para mantener la cookie HttpOnly first-party. GitHub Pages sirve el frontend, no la API ni secretos.

## Inicio rápido

1. Copiar `.env.example` a `.env` y `apps/mobile/.env.example` a `apps/mobile/.env`.
2. Ejecutar `npm install`.
3. Ejecutar `npm run prisma:generate` y `npm run prisma:migrate:dev` con una rama de Neon de desarrollo.
4. Iniciar API con `npm run dev:api`.
5. Iniciar la app con `npm run dev:mobile:client`.

Google Sign-In nativo requiere una development build; Expo Go no incluye ese módulo. Para recorrer el producto sin credenciales, el modo demo sólo aparece en desarrollo y nunca crea una sesión válida de producción.

## Verificación

```powershell
npm run verify
npm run security:check
```

La documentación operativa y las barreras obligatorias previas al lanzamiento están en `docs/SECURITY.md`; el mapa de entidades e invariantes está en `docs/DATABASE.md`. `docs/PRIVACY_DRAFT.md`, `docs/TERMS_DRAFT.md` y `docs/COMMUNITY_RULES.md` son bases publicables sólo después de completar datos y revisión legal.
