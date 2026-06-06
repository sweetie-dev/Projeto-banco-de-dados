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
    const { organization_name, bio, website } = await request.json();
    const db = await getDb();
    
    const result = await db.collection('organizers').updateOne(
      { _id: objectId },
      {
        $set: {
          organization_name: organization_name || '',
          bio: bio || '',
          website: website || '',
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Organizador não encontrado.' }, { status: 404 });
    }

    const doc = await db.collection('organizers').findOne({ _id: objectId });
    return NextResponse.json(normalizeDocument(doc));
  } catch (error) {
    console.error('[Organizers PUT Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const { id } = await params;
  const objectId = toObjectId(id);
  if (!objectId) return NextResponse.json({ success: true }); // Same behavior as original

  try {
    const db = await getDb();
    await db.collection('organizers').deleteOne({ _id: objectId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Organizers DELETE Error]:', error);
    return NextResponse.json({ success: true });
  }
}
