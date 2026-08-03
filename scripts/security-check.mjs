import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const failures = [];
const notices = [];

function read(relativePath) {
  const absolutePath = join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`Missing required file: ${relativePath}`);
    return '';
  }
  return readFileSync(absolutePath, 'utf8');
}

function requireText(relativePath, pattern, message) {
  const content = read(relativePath);
  if (!pattern.test(content)) failures.push(`${relativePath}: ${message}`);
}

requireText('.gitignore', /^\.env$/m, 'local environment files must be ignored');
requireText('.gitignore', /^\.env\.\*$/m, 'environment variants must be ignored');
requireText('apps/mobile/src/core/providers/AuthProvider.tsx', /!__DEV__\s*\|\|\s*process\.env\.EXPO_PUBLIC_ENABLE_DEMO_MODE\s*!==\s*'true'/, 'demo mode must fail closed outside development');
requireText('apps/mobile/src/core/data/services/authTokenStorage.native.ts', /expo-secure-store/, 'native sessions must use SecureStore');
requireText('apps/api/src/features/auth/routes.ts', /verifyIdToken/, 'Google ID tokens must be verified by the API');
requireText('apps/api/src/core/security/session.ts', /hashSessionToken/, 'session tokens must be stored as keyed hashes');
requireText('apps/api/src/core/http/app.ts', /CSRF_REJECTED/, 'cookie mutations need origin validation');
requireText('apps/api/src/core/security/rateLimit.ts', /SECURITY_DEPENDENCY_UNAVAILABLE/, 'production distributed rate limiting must fail closed');
requireText('prisma/migrations/20260802000000_init/migration.sql', /SecurityAuditEvent_append_only/, 'security audit records must be append-only');
requireText('prisma/migrations/20260802000000_init/migration.sql', /LedgerEntry_balanced_transaction/, 'financial ledger transactions must balance');
requireText('prisma/migrations/20260802010000_user_blocks/migration.sql', /UserBlock_not_self/, 'personal blocks must reject self-targeting at the database layer');
requireText('prisma/migrations/20260802020000_ranking_idempotency/migration.sql', /RankingEvent_periodId_userId_matchId_kind_key/, 'verified match ranking effects must be domain-idempotent');
requireText('prisma/migrations/20260802030000_match_result_submissions/migration.sql', /MatchResultSubmission_scores/, 'opposing score declarations must preserve bounded evidence');
requireText('apps/api/src/features/account/routes.ts', /verifyIdToken/, 'account deletion must require fresh Google reauthentication');
requireText('render.yaml', /ENABLE_PRIZE_LOBBIES[\s\S]{0,80}value: "false"/, 'prize lobbies must deploy disabled by default');
requireText('render.yaml', /ENABLE_REFERRAL_PAYOUTS[\s\S]{0,80}value: "false"/, 'cash referral payouts must deploy disabled by default');

const mobileSource = [
  read('apps/mobile/src/core/data/client/apiClient.ts'),
  read('apps/mobile/src/core/providers/AuthProvider.tsx'),
].join('\n');
if (/DATABASE_URL|DIRECT_URL|SESSION_PEPPER|AUDIT_HASH_SECRET/.test(mobileSource)) {
  failures.push('A server-only secret name appears in mobile runtime source.');
}

const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const audit = spawnSync(npmExecutable, ['audit', '--omit=dev', '--json', '--audit-level=high'], { cwd: root, encoding: 'utf8' });
try {
  const report = JSON.parse(audit.stdout || '{}');
  const vulnerabilities = report.metadata?.vulnerabilities ?? {};
  const severe = (vulnerabilities.high ?? 0) + (vulnerabilities.critical ?? 0);
  if (severe > 0) failures.push(`npm audit found ${severe} high/critical production vulnerabilities.`);
  const moderate = vulnerabilities.moderate ?? 0;
  if (moderate > 0) notices.push(`npm audit reports ${moderate} moderate findings; review docs/SECURITY.md before releases.`);
} catch {
  failures.push('npm audit did not return valid JSON.');
}

for (const notice of notices) console.warn(`NOTICE: ${notice}`);
if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exitCode = 1;
} else {
  console.log('Security baseline checks passed.');
}
