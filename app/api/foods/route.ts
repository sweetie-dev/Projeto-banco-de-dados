import { NextResponse } from 'next/server';
import { getDb, normalizeDocument, toObjectId } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const db = await getDb();
    const docs = await db.collection('foods')
      .find({ user_id: userId })
      .sort({ display_order: 1 })
      .toArray();
    
    return NextResponse.json(docs.map(normalizeDocument));
  } catch (error) {
    console.error('[Foods GET Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const { name, price, image_url, display_order } = await request.json();
    if (!name || typeof price !== 'number' || display_order === undefined) {
      return NextResponse.json({ message: 'Dados inválidos do produto.' }, { status: 400 });
    }
    
    const db = await getDb();
    const food = {
      name,
      price,
      image_url: image_url || null,
      display_order,
      user_id: userId,
      created_at: new Date().toISOString()
    };
    
    const result = await db.collection('foods').insertOne(food);
    const savedDoc = { ...food, _id: result.insertedId };
    
    return NextResponse.json(normalizeDocument(savedDoc), { status: 201 });
  } catch (error) {
    console.error('[Foods POST Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
