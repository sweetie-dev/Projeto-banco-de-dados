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
    const { name } = await request.json();
    if (!name) return NextResponse.json({ message: 'Nome da tag é obrigatório.' }, { status: 400 });
    
    const db = await getDb();
    const result = await db.collection('tags').updateOne(
      { _id: objectId },
      { $set: { name } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Tag não encontrada.' }, { status: 404 });
    }

    const doc = await db.collection('tags').findOne({ _id: objectId });
    return NextResponse.json(normalizeDocument(doc));
  } catch (error) {
    console.error('[Tags PUT Error]:', error);
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
    await db.collection('tags').deleteOne({ _id: objectId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Tags DELETE Error]:', error);
    return NextResponse.json({ success: true });
  }
}
