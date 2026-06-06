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
    const { status } = await request.json();
    if (!status) return NextResponse.json({ message: 'Status é obrigatório para atualizar participação.' }, { status: 400 });
    
    const db = await getDb();
    const result = await db.collection('participations').updateOne(
      { _id: objectId, user_id: userId },
      { $set: { status } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Participação não encontrada.' }, { status: 404 });
    }

    const doc = await db.collection('participations').findOne({ _id: objectId });
    return NextResponse.json(normalizeDocument(doc));
  } catch (error) {
    console.error('[Participations PUT Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const { id } = await params;
  const objectId = toObjectId(id);
  if (!objectId) return NextResponse.json({ success: true });

  try {
    const db = await getDb();
    await db.collection('participations').deleteOne({ _id: objectId, user_id: userId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Participations DELETE Error]:', error);
    return NextResponse.json({ success: true });
  }
}
