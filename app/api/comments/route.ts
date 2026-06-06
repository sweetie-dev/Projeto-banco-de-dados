import { NextResponse } from 'next/server';
import { getDb, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const url = new URL(request.url);
  const event_id = url.searchParams.get('event_id');
  
  const db = await getDb();
  const filter = event_id ? { event_id } : {};
  const docs = await db.collection('comments').find(filter).sort({ created_at: -1 }).toArray();
  
  return NextResponse.json(docs.map(normalizeDocument));
}

export async function POST(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  try {
    const { event_id, content } = await request.json();
    if (!event_id || !content) return NextResponse.json({ message: 'Dados do comentário são obrigatórios.' }, { status: 400 });
    
    const db = await getDb();
    const doc = {
      event_id,
      user_id: userId,
      content,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db.collection('comments').insertOne(doc);
    return NextResponse.json(normalizeDocument({ ...doc, _id: result.insertedId }), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
