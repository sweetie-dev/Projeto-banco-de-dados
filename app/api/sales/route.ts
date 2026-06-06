import { NextResponse } from 'next/server';
import { getDb, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const db = await getDb();
    const docs = await db.collection('sales')
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .toArray();
    return NextResponse.json(docs.map(normalizeDocument));
  } catch (error) {
    console.error('[Sales GET Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const { food_id, payment_method } = await request.json();
    if (!food_id || !payment_method) return NextResponse.json({ message: 'Dados inválidos da venda.' }, { status: 400 });
    
    const db = await getDb();
    const sale = {
      food_id,
      payment_method,
      user_id: userId,
      created_at: new Date().toISOString()
    };
    
    const result = await db.collection('sales').insertOne(sale);
    const savedDoc = { ...sale, _id: result.insertedId };
    
    return NextResponse.json(normalizeDocument(savedDoc), { status: 201 });
  } catch (error) {
    console.error('[Sales POST Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
