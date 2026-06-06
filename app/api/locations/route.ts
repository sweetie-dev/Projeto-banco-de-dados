import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const docs = await prisma.location.findMany({
    orderBy: { name: 'asc' }
  });
  return NextResponse.json(docs.map(normalizeDocument));
}

export async function POST(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  try {
    const { name, address, city, state, zip_code } = await request.json();
    if (!name || !address || !city || !state || !zip_code) {
      return NextResponse.json({ message: 'Dados completos do local são obrigatórios.' }, { status: 400 });
    }
    const doc = await prisma.location.create({
      data: { name, address, city, state, zip_code }
    });
    return NextResponse.json(normalizeDocument(doc), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
