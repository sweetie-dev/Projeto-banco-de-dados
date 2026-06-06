import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const doc = await prisma.pixConfig.findFirst({
      where: { userId },
      orderBy: { updated_at: 'desc' }
    });
    return NextResponse.json(doc ? normalizeDocument(doc) : null);
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
    
    const doc = await prisma.pixConfig.create({
      data: {
        pix_key: pixKey,
        merchant_name: merchantName,
        userId
      }
    });
    
    return NextResponse.json(normalizeDocument(doc), { status: 201 });
  } catch (error) {
    console.error('[PIX POST Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
