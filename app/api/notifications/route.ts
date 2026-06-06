import { NextResponse } from 'next/server';
import { getDb, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const db = await getDb();
    const docs = await db.collection('notifications')
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .toArray();
    
    return NextResponse.json(docs.map(normalizeDocument));
  } catch (error) {
    console.error('[Notifications GET Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const { user_id, title, message } = await request.json();
    if (!user_id || !title || !message) {
      return NextResponse.json({ message: 'Dados de notificação são obrigatórios.' }, { status: 400 });
    }
    
    const db = await getDb();
    const notification = {
      user_id,
      title,
      message,
      read: false,
      created_at: new Date().toISOString()
    };
    
    const result = await db.collection('notifications').insertOne(notification);
    const savedDoc = { ...notification, _id: result.insertedId };
    
    return NextResponse.json(normalizeDocument(savedDoc), { status: 201 });
  } catch (error) {
    console.error('[Notifications POST Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
