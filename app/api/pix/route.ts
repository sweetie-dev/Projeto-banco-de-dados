import { NextResponse } from 'next/server';
import { getDb, normalizeDocument, toObjectId } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const db = await getDb();
    const doc = await db.collection('pix_config')
      .find({ user_id: userId })
      .sort({ updated_at: -1 })
      .limit(1)
      .toArray();
    return NextResponse.json(doc.length > 0 ? normalizeDocument(doc[0]) : null);
  } catch (error) {
    console.error('[PIX GET Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const { pixKey, merchantName } = await request.json();
    if (!pixKey || !merchantName) return NextResponse.json({ message: 'Dados inválidos do PIX.' }, { status: 400 });
    
    const db = await getDb();
    const pix = {
      pix_key: pixKey,
      merchant_name: merchantName,
      user_id: userId,
      updated_at: new Date().toISOString()
    };
    
    const result = await db.collection('pix_config').insertOne(pix);
    const savedDoc = { ...pix, _id: result.insertedId };
    
    return NextResponse.json(normalizeDocument(savedDoc), { status: 201 });
  } catch (error) {
    console.error('[PIX POST Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
