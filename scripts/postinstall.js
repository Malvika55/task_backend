/**
 * Prisma generate needs DATABASE_URL in env but does not connect to the DB.
 * Skip in CI when only building the frontend (SKIP_PRISMA=1).
 */
const { execSync } = require('child_process');

if (process.env.SKIP_PRISMA === '1') {
  console.log('postinstall: skipping Prisma generate (SKIP_PRISMA=1)');
  process.exit(0);
}

const databaseUrl =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/task_platform?schema=public';

execSync('npm run prisma:generate --workspace @p5/api', {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: databaseUrl },
});
