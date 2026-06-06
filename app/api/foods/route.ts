import { NextResponse } from 'next/server';
import { getDb, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  console.log(`[API] Listando produtos para o usuário: ${userId}`);
  
  const db = await getDb();
  const docs = await db.collection('foods').find({ user_id: userId }).sort({ display_order: 1 }).toArray();
  
  console.log(`[API] Encontrados ${docs.length} produtos.`);
  
  return NextResponse.json(docs.map(normalizeDocument));
}

export async function POST(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const { name, price, image_url, display_order } = await request.json();
    if (!name || typeof price !== 'number' || display_order === undefined) {
      return NextResponse.json({ message: 'Dados inválidos do produto.' }, { status: 400 });
    }
    
    console.log(`[API] Criando produto "${name}" para o usuário: ${userId}`);
    
    const db = await getDb();
    const result = await db.collection('foods').insertOne({
      name, 
      price, 
      image_url: image_url || null, 
      display_order, 
      user_id: userId,
      created_at: new Date().toISOString()
    });
    const doc = await db.collection('foods').findOne({ _id: result.insertedId });
    return NextResponse.json(normalizeDocument(doc), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
