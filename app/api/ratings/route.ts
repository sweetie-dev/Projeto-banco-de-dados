import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const url = new URL(request.url);
  const eventId = url.searchParams.get('event_id');
  
  try {
    const where: any = {};
    if (eventId) where.event_id = eventId;

    const docs = await prisma.rating.findMany({
      where,
      orderBy: { created_at: 'desc' }
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
    const { event_id, score, comment } = await request.json();
    if (!event_id || typeof score !== 'number') return NextResponse.json({ message: 'Dados de avaliação são obrigatórios.' }, { status: 400 });
    
    const result = await prisma.rating.create({
      data: {
        event_id,
        user_id: userId,
        score,
        comment: comment || '',
        created_at: new Date()
      }
    });
    
    return NextResponse.json(normalizeDocument(result), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
