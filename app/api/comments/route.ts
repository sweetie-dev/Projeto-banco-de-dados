import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const url = new URL(request.url);
  const event_id = url.searchParams.get('event_id');
  
  const docs = await prisma.comment.findMany({
    where: event_id ? { event_id } : {},
    orderBy: { created_at: 'desc' }
  });
  return NextResponse.json(docs.map(normalizeDocument));
}

export async function POST(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  try {
    const { event_id, content } = await request.json();
    if (!event_id || !content) return NextResponse.json({ message: 'Dados do comentário são obrigatórios.' }, { status: 400 });
    const doc = await prisma.comment.create({
      data: {
        event_id,
        user_id: userId,
        content
      }
    });
    return NextResponse.json(normalizeDocument(doc), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
