import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb, normalizeDocument } from '@/lib/db';
import { createToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json();
    if (!email || !password || !username) {
      return NextResponse.json({ message: 'Email, senha e nome são obrigatórios.' }, { status: 400 });
    }

    const db = await getDb();
    const existing = await db.collection('users').findOne({ email });

    if (existing) {
      return NextResponse.json({ message: 'Email já cadastrado.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      email,
      username,
      password: hashedPassword,
      role: 'user',
      created_at: new Date().toISOString()
    };

    const result = await db.collection('users').insertOne(user);
    const savedUser = { ...user, _id: result.insertedId };

    const token = createToken(savedUser);

    return NextResponse.json({ token, user: normalizeDocument(savedUser) }, { status: 201 });
  } catch (error) {
    console.error('[Signup Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
