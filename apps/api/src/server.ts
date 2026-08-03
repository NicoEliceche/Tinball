import { buildApp } from './core/http/app.js';
import { env } from './core/config/env.js';
const app = await buildApp();
try { await app.listen({ host: '0.0.0.0', port: env.PORT }); } catch (error) { app.log.fatal(error); process.exit(1); }

