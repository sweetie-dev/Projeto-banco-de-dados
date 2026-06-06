import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const docs = await prisma.sale.findMany({
      where: { userId },
      orderBy: { created_at: 'desc' },
      include: { food: true } // Opcional: já traz os dados do produto junto
    });
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
    
    const doc = await prisma.sale.create({
      data: {
        food_id,
        payment_method,
        userId
      }
    });
    
    return NextResponse.json(normalizeDocument(doc), { status: 201 });
  } catch (error) {
    console.error('[Sales POST Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
