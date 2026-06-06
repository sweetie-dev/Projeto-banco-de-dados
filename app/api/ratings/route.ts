import { NextResponse } from 'next/server';
import { getDb, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const url = new URL(request.url);
  const eventId = url.searchParams.get('event_id');
  
  try {
    const db = await getDb();
    const query: any = {};
    if (eventId) query.event_id = eventId;

    const docs = await db.collection('ratings')
      .find(query)
      .sort({ created_at: -1 })
      .toArray();
      
    return NextResponse.json(docs.map(normalizeDocument));
  } catch (error) {
    console.error('[Ratings GET Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const { event_id, score, comment } = await request.json();
    if (!event_id || typeof score !== 'number') {
      return NextResponse.json({ message: 'Dados de avaliação são obrigatórios.' }, { status: 400 });
    }
    
    const db = await getDb();
    const rating = {
      event_id,
      user_id: userId,
      score,
      comment: comment || '',
      created_at: new Date().toISOString()
    };
    
    const result = await db.collection('ratings').insertOne(rating);
    const savedDoc = { ...rating, _id: result.insertedId };
    
    return NextResponse.json(normalizeDocument(savedDoc), { status: 201 });
  } catch (error) {
    console.error('[Ratings POST Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
