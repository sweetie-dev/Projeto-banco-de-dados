import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma, normalizeDocument } from '@/lib/db';
import { createToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json();
    if (!email || !password || !username) {
      return NextResponse.json({ message: 'Email, senha e nome são obrigatórios.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return NextResponse.json({ message: 'Email já cadastrado.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      }
    });

    const token = createToken(user);

    return NextResponse.json({ token, user: normalizeDocument(user) }, { status: 201 });
  } catch (error) {
    console.error('[Signup Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
