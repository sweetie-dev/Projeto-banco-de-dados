import { PrismaClient } from '@prisma/client';

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!mongoUri) {
  throw new Error('MONGODB_URI está faltando no ambiente.');
}

// Concatena o nome do banco à URI para o Prisma, se fornecido
const getFullUri = () => {
  if (!dbName) return mongoUri;
  // Verifica se a URI já termina com / para evitar duplicação
  const base = mongoUri.endsWith('/') ? mongoUri.slice(0, -1) : mongoUri;
  return `${base}/${dbName}?authSource=admin`;
};

const createPrismaClient = () => {
  return new PrismaClient({
    datasourceUrl: getFullUri(),
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Export getDb for backward compatibility during migration if needed
export async function getDb() {
  const { MongoClient } = await import('mongodb');
  const mongoClient = new MongoClient(mongoUri!);
  await mongoClient.connect();
  return mongoClient.db(process.env.MONGODB_DB ?? 'controle_vendas');
}

// Helper to normalize Prisma objects to match existing frontend expectations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeDocument(doc: any) {
  if (!doc) return null;
  const { password, ...rest } = doc;
  return { ...rest };
}
