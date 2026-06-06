import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const docs = await prisma.organizer.findMany();
    return NextResponse.json(docs.map(normalizeDocument));
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const { user_id, organization_name, bio, website } = await request.json();
    const targetUserId = user_id || userId; // Use user_id from body or fallback to authenticated userId
    
    if (!targetUserId) return NextResponse.json({ message: 'user_id do organizador é obrigatório.' }, { status: 400 });
    
    const user = await prisma.user.findUnique({
      where: { id: targetUserId }
    });
    
    if (!user) return NextResponse.json({ message: 'Usuário não encontrado para organizador.' }, { status: 404 });
    
    const result = await prisma.organizer.create({
      data: {
        userId: targetUserId,
        organization_name: organization_name || '',
        bio: bio || '',
        website: website || '',
      },
    });
    
    return NextResponse.json(normalizeDocument(result), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
