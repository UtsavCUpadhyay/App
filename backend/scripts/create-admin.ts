import { loadConfig } from '../src/config.js';
import { createPgRepositories } from '../src/infra/pg/repositories.js';
import { createPool, runMigrations } from '../src/infra/pg/pool.js';
import { AdminService } from '../src/modules/admin/admin.service.js';
import type { AdminRole } from '../src/domain/types.js';

/**
 * Ops utility: create an admin account.
 *   ADMIN_EMAIL=a@b.com ADMIN_PASSWORD=... ADMIN_ROLE=moderator \
 *   DATABASE_URL=... npm run create-admin
 * Roles: verification_reviewer | moderator | support | superadmin.
 */
async function main(): Promise<void> {
  const { databaseUrl } = loadConfig();
  if (!databaseUrl) throw new Error('DATABASE_URL is required');
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const role = (process.env.ADMIN_ROLE ?? 'moderator') as AdminRole;
  if (!email || !password) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');

  const pool = createPool(databaseUrl);
  await runMigrations(pool);
  const admin = await new AdminService(createPgRepositories(pool)).createAdmin(email, password, role);
  await pool.end();

  // eslint-disable-next-line no-console
  console.log(`Created admin ${admin.email} with role ${admin.role}`);
}

void main();
