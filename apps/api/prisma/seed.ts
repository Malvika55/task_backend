import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/lib/password';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('ADMIN_EMAIL and ADMIN_PASSWORD are not set, skipping seed.');
    return;
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.upsert({
    where: { email },
    update: { name: 'Platform Admin', passwordHash, role: Role.ADMIN },
    create: {
      email,
      name: 'Platform Admin',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log(`Seeded admin account for ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
