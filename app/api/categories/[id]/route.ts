import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  try {
    const { name, description } = await request.json();
    if (!name) return NextResponse.json({ message: 'Nome da categoria é obrigatório.' }, { status: 400 });
    const doc = await prisma.category.update({
      where: { id },
      data: { name, description: description || '' }
    });
    return NextResponse.json(normalizeDocument(doc));
  } catch (error) {
    return NextResponse.json({ message: 'Categoria não encontrada ou erro interno' }, { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.category.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao excluir categoria' }, { status: 500 });
  }
}
