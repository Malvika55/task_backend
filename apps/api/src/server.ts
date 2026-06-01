import { Role } from '@prisma/client';
import { createApp } from './app';
import { env } from './config/env';
import { prisma, initPrisma } from './config/prisma';
import { hashPassword } from './lib/password';

const start = async () => {
  const db = await initPrisma();

  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    await db.user.upsert({
      where: { email: env.ADMIN_EMAIL },
      update: {
        name: 'Platform Admin',
        passwordHash: await hashPassword(env.ADMIN_PASSWORD),
        role: Role.ADMIN,
      },
      create: {
        email: env.ADMIN_EMAIL,
        name: 'Platform Admin',
        passwordHash: await hashPassword(env.ADMIN_PASSWORD),
        role: Role.ADMIN,
      },
    });
  }

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
  });
};

void start();
