import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const docs = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
  return NextResponse.json(docs.map(normalizeDocument));
}

export async function POST(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  try {
    const { name, description } = await request.json();
    if (!name) return NextResponse.json({ message: 'Nome da categoria é obrigatório.' }, { status: 400 });
    const doc = await prisma.category.create({
      data: { name, description: description || '' }
    });
    return NextResponse.json(normalizeDocument(doc), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
