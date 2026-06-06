import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const docs = await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(docs.map(normalizeDocument));
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const { name } = await request.json();
    if (!name) return NextResponse.json({ message: 'Nome da tag é obrigatório.' }, { status: 400 });
    
    const result = await prisma.tag.create({
      data: {
        name,
        created_at: new Date()
      }
    });
    
    return NextResponse.json(normalizeDocument(result), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
