import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const url = new URL(request.url);
  const category_id = url.searchParams.get('category_id');
  const organizer_id = url.searchParams.get('organizer_id');
  const tag_id = url.searchParams.get('tag_id');

  const where: any = {};
  if (category_id) where.category_id = category_id;
  if (organizer_id) where.organizer_id = organizer_id;
  if (tag_id) where.tag_ids = { has: tag_id };

  const docs = await prisma.event.findMany({
    where,
    orderBy: { start_date: 'asc' }
  });
  return NextResponse.json(docs.map(normalizeDocument));
}

export async function POST(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  try {
    const { title, description, organizer_id, location_id, category_id, tag_ids, start_date, end_date, price, capacity } = await request.json();
    if (!title || !description || !organizer_id || !location_id || !category_id || !Array.isArray(tag_ids) || !start_date || !end_date || typeof price !== 'number' || typeof capacity !== 'number') {
      return NextResponse.json({ message: 'Dados completos do evento são obrigatórios.' }, { status: 400 });
    }
    const doc = await prisma.event.create({
      data: {
        title,
        description,
        organizer_id,
        location_id,
        category_id,
        tag_ids,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        price,
        capacity
      }
    });
    return NextResponse.json(normalizeDocument(doc), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
