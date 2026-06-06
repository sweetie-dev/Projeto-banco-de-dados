import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const { id } = await params;
  try {
    const { name, price, image_url } = await request.json();
    if (!name || typeof price !== 'number') return NextResponse.json({ message: 'Dados inválidos do produto.' }, { status: 400 });
    
    // O Prisma permite filtrar por id e userId simultaneamente para garantir isolamento
    const doc = await prisma.food.update({
      where: { 
        id,
        userId // Garante que o produto pertence ao usuário
      },
      data: { name, price, image_url: image_url || null }
    });

    return NextResponse.json(normalizeDocument(doc));
  } catch (error) { 
    console.error('[Food PUT Error]:', error);
    // Se não encontrar ou não pertencer ao usuário, o Prisma lança erro
    return NextResponse.json({ message: 'Produto não encontrado ou acesso negado.' }, { status: 404 }); 
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const { id } = await params;
  
  try {
    // No Prisma, precisamos deletar as vendas primeiro se não houver cascade manual no schema
    // Atualmente as vendas dependem de Food.
    await prisma.sale.deleteMany({
      where: { food_id: id, userId }
    });

    const result = await prisma.food.delete({
      where: { 
        id,
        userId 
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Food DELETE Error]:', error);
    return NextResponse.json({ message: 'Produto não encontrado ou acesso negado.' }, { status: 404 });
  }
}
