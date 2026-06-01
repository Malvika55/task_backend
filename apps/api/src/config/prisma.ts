import { PrismaClient } from '@prisma/client';
import path from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Export a non-optional PrismaClient for ease of use in the codebase.
export let prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient();

export async function initPrisma(): Promise<PrismaClient> {
  // Try connecting with existing client first
  try {
    await prisma.$connect();
    const url = process.env.DATABASE_URL ?? 'unknown';
    if (url.startsWith('file:')) {
      console.log('Prisma connected to SQLite database:', url);
    } else {
      console.log('Prisma connected to database URL:', url.split('?')[0]);
    }
    return prisma;
  } catch (err) {
    // Fallback to SQLite file-based DB for local dev
    const sqliteFile = `file:${path.join(process.cwd(), 'apps', 'api', 'prisma', 'dev.db')}`;
    process.env.DATABASE_URL = process.env.DATABASE_URL || sqliteFile;
    prisma = new PrismaClient();
    await prisma.$connect();
    console.log('Prisma fallback: using SQLite at', process.env.DATABASE_URL);
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma;
    }
    return prisma;
  }
}
