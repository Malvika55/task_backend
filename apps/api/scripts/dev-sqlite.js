const { spawn } = require('child_process');
const path = require('path');

// Ensure DATABASE_URL points to a sqlite file inside the prisma folder
process.env.DATABASE_URL =
  process.env.DATABASE_URL?.startsWith('file:')
    ? process.env.DATABASE_URL
    : `file:${path.join(__dirname, '..', 'prisma', 'dev.db')}`;

const child = spawn('npx', ['tsx', 'watch', 'src/server.ts'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..'),
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 0));
