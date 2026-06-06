import { NextResponse } from 'next/server';
import { getDb, normalizeDocument, toObjectId } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const { id } = await params;
  const objectId = toObjectId(id);
  if (!objectId) return NextResponse.json({ message: 'ID inválido.' }, { status: 400 });

  try {
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: objectId });
    
    if (!user) return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    return NextResponse.json(normalizeDocument(user));
  } catch (error) {
    console.error('[User GET Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
