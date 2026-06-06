import { PrismaClient } from '@prisma/client';

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!mongoUri) {
  throw new Error('MONGODB_URI está faltando no ambiente.');
}

// Concatena o nome do banco à URI para o Prisma, se fornecido
const getFullUri = () => {
  if (!dbName) return mongoUri;
  const base = mongoUri.endsWith('/') ? mongoUri.slice(0, -1) : mongoUri;
  return `${base}/${dbName}?authSource=admin&directConnection=true&retryWrites=false`;
};

const createPrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: getFullUri(),
      },
    },
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Force fresh build to ensure Prisma Client matches schema String change
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper to normalize Prisma objects to match existing frontend expectations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeDocument(doc: any) {
  if (!doc) return null;
  const { password, ...rest } = doc;
  return { ...rest };
}
