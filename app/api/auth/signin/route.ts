import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma, normalizeDocument } from '@/lib/db';
import { createToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ message: 'Email e senha são obrigatórios.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    const token = createToken(user);
    return NextResponse.json({ token, user: normalizeDocument(user) });
  } catch (error) {
    console.error('[Signin Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
