import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  try {
    const { read } = await request.json();
    
    // Using updateMany to ensure data isolation (filtering by user_id)
    const result = await prisma.notification.updateMany({
      where: { id, user_id: userId },
      data: { read: Boolean(read) }
    });

    if (result.count === 0) {
      return NextResponse.json({ message: 'Notificação não encontrada.' }, { status: 404 });
    }

    const doc = await prisma.notification.findUnique({
      where: { id }
    });

    return NextResponse.json(normalizeDocument(doc));
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
