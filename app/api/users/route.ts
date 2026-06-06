import { NextResponse } from 'next/server';
import { getDb, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const db = await getDb();
    const docs = await db.collection('users').find().toArray();
    return NextResponse.json(docs.map(normalizeDocument));
  } catch (error) {
    console.error('[Users GET Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
