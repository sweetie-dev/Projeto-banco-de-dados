import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const { id } = await params;
  try {
    const { status } = await request.json();
    if (!status) return NextResponse.json({ message: 'Status é obrigatório para atualizar participação.' }, { status: 400 });
    
    const result = await prisma.participation.update({
      where: { id },
      data: { status }
    });
    
    return NextResponse.json(normalizeDocument(result));
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Participação não encontrada.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const { id } = await params;
  try {
    await prisma.participation.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: true });
  }
}
