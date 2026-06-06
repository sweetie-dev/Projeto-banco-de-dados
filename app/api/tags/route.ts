import { NextResponse } from 'next/server';
import { getDb, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const db = await getDb();
    const docs = await db.collection('tags')
      .find()
      .sort({ name: 1 })
      .toArray();
      
    return NextResponse.json(docs.map(normalizeDocument));
  } catch (error) {
    console.error('[Tags GET Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const { name } = await request.json();
    if (!name) return NextResponse.json({ message: 'Nome da tag é obrigatório.' }, { status: 400 });
    
    const db = await getDb();
    const tag = {
      name,
      created_at: new Date().toISOString()
    };
    
    const result = await db.collection('tags').insertOne(tag);
    const savedDoc = { ...tag, _id: result.insertedId };
    
    return NextResponse.json(normalizeDocument(savedDoc), { status: 201 });
  } catch (error) {
    console.error('[Tags POST Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
