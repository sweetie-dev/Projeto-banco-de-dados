import { MongoClient, ObjectId } from 'mongodb';

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'controle_vendas';

if (!mongoUri) {
  throw new Error('MONGODB_URI está faltando no ambiente.');
}

const getFullUri = () => {
  const base = mongoUri.endsWith('/') ? mongoUri.slice(0, -1) : mongoUri;
  return `${base}/${dbName}?authSource=admin`;
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const globalWithMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (process.env.NODE_ENV === 'development') {
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(getFullUri());
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(getFullUri());
  clientPromise = client.connect();
}

export async function getDb() {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

export function toObjectId(id: string) {
  try {
    return new ObjectId(id);
  } catch {
    return undefined;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeDocument(doc: any) {
  if (!doc) return null;
  const { _id, password, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}
