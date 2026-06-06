import { NextResponse } from 'next/server';
import { getDb, normalizeDocument, toObjectId } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const { id } = await params;
  try {
    const { pixKey, merchantName } = await request.json();
    if (!pixKey || !merchantName) return NextResponse.json({ message: 'Dados inválidos do PIX.' }, { status: 400 });
    
    const db = await getDb();
    const result = await db.collection('pix_config').findOneAndUpdate(
      { _id: toObjectId(id), user_id: userId }, // Verifica se a config pertence ao usuário
      { $set: { pix_key: pixKey, merchant_name: merchantName, updated_at: new Date().toISOString() } },
      { returnDocument: 'after' }
    );
    if (!result) return NextResponse.json({ message: 'Configuração PIX não encontrada ou acesso negado.' }, { status: 404 });
    return NextResponse.json(normalizeDocument(result));
  } catch (error) { return NextResponse.json({ message: 'Erro interno' }, { status: 500 }); }
}
