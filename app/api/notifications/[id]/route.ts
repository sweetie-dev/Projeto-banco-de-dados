import { NextResponse } from 'next/server';
import { getDb, normalizeDocument, toObjectId } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const { id } = await params;
  const objectId = toObjectId(id);
  if (!objectId) return NextResponse.json({ message: 'ID inválido.' }, { status: 400 });

  try {
    const { read } = await request.json();
    const db = await getDb();
    
    const result = await db.collection('notifications').updateOne(
      { _id: objectId, user_id: userId },
      { $set: { read: Boolean(read) } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Notificação não encontrada.' }, { status: 404 });
    }

    const doc = await db.collection('notifications').findOne({ _id: objectId });

    return NextResponse.json(normalizeDocument(doc));
  } catch (error) {
    console.error('[Notifications PUT Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
