import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  try {
    const { title, description, organizer_id, location_id, category_id, tag_ids, start_date, end_date, price, capacity } = await request.json();
    if (!title || !description || !organizer_id || !location_id || !category_id || !Array.isArray(tag_ids) || !start_date || !end_date || typeof price !== 'number' || typeof capacity !== 'number') {
      return NextResponse.json({ message: 'Dados completos do evento são obrigatórios.' }, { status: 400 });
    }
    const doc = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        organizer_id,
        location_id,
        category_id,
        tag_ids,
        start_date: String(start_date),
        end_date: String(end_date),
        price,
        capacity
      }
    });
    return NextResponse.json(normalizeDocument(doc));
  } catch (error) {
    return NextResponse.json({ message: 'Evento não encontrado ou erro interno' }, { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.comment.deleteMany({ where: { event_id: id } });
    await prisma.participation.deleteMany({ where: { event_id: id } });
    await prisma.rating.deleteMany({ where: { event_id: id } });
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao excluir evento' }, { status: 500 });
  }
}
