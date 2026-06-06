import { NextResponse } from 'next/server';
import { getDb, normalizeDocument, toObjectId } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const { id } = await params;
  try {
    const { name, price, image_url } = await request.json();
    if (!name || typeof price !== 'number') return NextResponse.json({ message: 'Dados inválidos do produto.' }, { status: 400 });
    
    const db = await getDb();
    const result = await db.collection('foods').findOneAndUpdate(
      { _id: toObjectId(id), user_id: userId },
      { $set: { name, price, image_url: image_url || null } },
      { returnDocument: 'after' }
    );

    if (!result) return NextResponse.json({ message: 'Produto não encontrado ou acesso negado.' }, { status: 404 });
    return NextResponse.json(normalizeDocument(result));
  } catch (error) { 
    console.error('[Food PUT Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 }); 
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const { id } = await params;
  try {
    const db = await getDb();
    
    const result = await db.collection('foods').deleteOne({ _id: toObjectId(id), user_id: userId });
    
    if (result.deletedCount > 0) {
      await db.collection('sales').deleteMany({ food_id: id, user_id: userId });
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ message: 'Produto não encontrado ou acesso negado.' }, { status: 404 });
  } catch (error) {
    console.error('[Food DELETE Error]:', error);
    return NextResponse.json({ message: 'Erro ao excluir evento' }, { status: 500 });
  }
}
