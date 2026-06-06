import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const { id } = await params;
  try {
    const { pixKey, merchantName } = await request.json();
    if (!pixKey || !merchantName) return NextResponse.json({ message: 'Dados inválidos do PIX.' }, { status: 400 });
    
    const doc = await prisma.pixConfig.update({
      where: { 
        id,
        userId // Garante isolamento
      },
      data: {
        pix_key: pixKey,
        merchant_name: merchantName,
        updated_at: new Date().toISOString()
      }
    });
    
    return NextResponse.json(normalizeDocument(doc));
  } catch (error) { 
    console.error('[PIX PUT Error]:', error);
    return NextResponse.json({ message: 'Configuração PIX não encontrada ou acesso negado.' }, { status: 404 }); 
  }
}
