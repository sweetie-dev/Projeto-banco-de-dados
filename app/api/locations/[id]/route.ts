import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  try {
    const { name, address, city, state, zip_code } = await request.json();
    if (!name || !address || !city || !state || !zip_code) {
      return NextResponse.json({ message: 'Dados completos do local são obrigatórios.' }, { status: 400 });
    }
    const doc = await prisma.location.update({
      where: { id },
      data: { name, address, city, state, zip_code }
    });
    return NextResponse.json(normalizeDocument(doc));
  } catch (error) {
    return NextResponse.json({ message: 'Local não encontrado ou erro interno' }, { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.location.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao excluir local' }, { status: 500 });
  }
}
