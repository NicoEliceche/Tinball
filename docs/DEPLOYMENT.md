# Despliegue

## Neon

1. Crear proyectos o ramas independientes para desarrollo, preview y producción.
2. Copiar la URL pooled a `DATABASE_URL` y la URL directa a `DIRECT_URL`.
3. Ejecutar migraciones desde CI/Render con el rol de migración; la API debe usar un rol sin permisos DDL.
4. Probar `npm run prisma:migrate:deploy` y `npm run prisma:seed` sólo en desarrollo.
5. Configurar backups/PITR y practicar una restauración antes del lanzamiento.

## Render API y mantenimiento

`render.yaml` crea el web service gratuito de la API. Cargar los secretos marcados `sync: false`. El health check `/api/v1/health` queda degradado en producción si falta Redis. Los cron jobs de Render no admiten instancia Free; por eso `.github/workflows/maintenance.yml` invoca el endpoint interno desde GitHub Actions. Configurar allí los secrets `TINBALL_API_URL` y `TINBALL_WORKER_SECRET`, y usar el mismo `WORKER_SECRET` en Render.

## Google OAuth

Crear clientes separados web, Android e iOS. Registrar bundle/package `com.nicoeliceche.tinball`, SHA-1/SHA-256 de Android, URL scheme de iOS y orígenes/redirects web exactos. Los tres client IDs se configuran en EAS; la API recibe las audiencias equivalentes. Google Sign-In nativo requiere una development build, no Expo Go.

## Android/iOS con EAS

Desde `apps/mobile`:

```powershell
npx eas-cli build --profile development --platform android
npx eas-cli build --profile development --platform ios
npx eas-cli build --profile production --platform all
```

Antes del perfil production, definir las variables `EXPO_PUBLIC_*` en el environment de EAS y confirmar que `EXPO_PUBLIC_API_URL` sea HTTPS.

## Web y GitHub Pages

Definir `EXPO_PUBLIC_BASE_PATH=/NOMBRE_DEL_REPO` para un project site y ejecutar `npm run build:web`. Publicar `apps/mobile/dist` con GitHub Pages Actions. Los client IDs son públicos por diseño; ningún secreto de API/base debe usar prefijo `EXPO_PUBLIC_`.

Configurar también `EXPO_PUBLIC_TERMS_URL`, `EXPO_PUBLIC_PRIVACY_URL` y `EXPO_PUBLIC_COMMUNITY_RULES_URL` como variables del repositorio. Los borradores de `docs` deben revisarse, completar datos legales y publicarse antes de activar producción.

Para login web robusto, asignar dominios hermanos HTTPS: por ejemplo `app.tinball.com` a GitHub Pages y `api.tinball.com` a Render. Agregar sólo `https://app.tinball.com` a `CORS_ORIGINS`, usar esa misma URL como origen OAuth autorizado y apuntar `EXPO_PUBLIC_API_URL` a `https://api.tinball.com`. Los dominios gratuitos `github.io` y `onrender.com` son cross-site entre sí; depender de cookies de terceros allí no es una arquitectura de producción confiable.

El plan Free de Render sirve para un MVP y pruebas, pero puede suspender el servicio por inactividad y no ofrece un SLA de producción. Mantener el worker programado en GitHub Actions y pasar a un plan con disponibilidad adecuada antes de una campaña pública.
