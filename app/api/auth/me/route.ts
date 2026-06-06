import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const userId = authenticate(request);
    if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ user: normalizeDocument(user) });
  } catch (error) {
    console.error('[API Auth Me Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
