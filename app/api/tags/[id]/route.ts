import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const { id } = await params;
  try {
    const { name } = await request.json();
    if (!name) return NextResponse.json({ message: 'Nome da tag é obrigatório.' }, { status: 400 });
    
    const result = await prisma.tag.update({
      where: { id },
      data: { name }
    });
    
    return NextResponse.json(normalizeDocument(result));
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Tag não encontrada.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const { id } = await params;
  try {
    await prisma.tag.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: true });
  }
}
