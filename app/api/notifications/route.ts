import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const docs = await prisma.notification.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' }
  });
  return NextResponse.json(docs.map(normalizeDocument));
}

export async function POST(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  try {
    const { user_id, title, message } = await request.json();
    if (!user_id || !title || !message) return NextResponse.json({ message: 'Dados de notificação são obrigatórios.' }, { status: 400 });
    const doc = await prisma.notification.create({
      data: {
        user_id,
        title,
        message,
        read: false
      }
    });
    return NextResponse.json(normalizeDocument(doc), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
