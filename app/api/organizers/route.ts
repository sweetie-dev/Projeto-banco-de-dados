import { NextResponse } from 'next/server';
import { getDb, normalizeDocument, toObjectId } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const db = await getDb();
    const docs = await db.collection('organizers').find().toArray();
    return NextResponse.json(docs.map(normalizeDocument));
  } catch (error) {
    console.error('[Organizers GET Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const { user_id, organization_name, bio, website } = await request.json();
    const targetUserId = user_id || userId;
    
    if (!targetUserId) return NextResponse.json({ message: 'user_id do organizador é obrigatório.' }, { status: 400 });
    
    const db = await getDb();
    
    const userObjectId = toObjectId(targetUserId);
    if (!userObjectId) return NextResponse.json({ message: 'ID de usuário inválido.' }, { status: 400 });
    
    const user = await db.collection('users').findOne({ _id: userObjectId });
    if (!user) return NextResponse.json({ message: 'Usuário não encontrado para organizador.' }, { status: 404 });
    
    const organizer = {
      userId: targetUserId,
      organization_name: organization_name || '',
      bio: bio || '',
      website: website || '',
      created_at: new Date().toISOString()
    };
    
    const result = await db.collection('organizers').insertOne(organizer);
    const savedDoc = { ...organizer, _id: result.insertedId };
    
    return NextResponse.json(normalizeDocument(savedDoc), { status: 201 });
  } catch (error) {
    console.error('[Organizers POST Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
