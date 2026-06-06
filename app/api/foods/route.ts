import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  console.log(`[Prisma] Listando produtos para o usuário: ${userId}`);
  
  try {
    const docs = await prisma.food.findMany({
      where: { userId },
      orderBy: { display_order: 'asc' }
    });
    
    console.log(`[Prisma] Encontrados ${docs.length} produtos.`);
    
    return NextResponse.json(docs.map(normalizeDocument));
  } catch (error) {
    console.error('[Foods GET Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  try {
    const { name, price, image_url, display_order } = await request.json();
    if (!name || typeof price !== 'number' || display_order === undefined) {
      return NextResponse.json({ message: 'Dados inválidos do produto.' }, { status: 400 });
    }
    
    console.log(`[Prisma] Criando produto "${name}" para o usuário: ${userId}`);
    
    const doc = await prisma.food.create({
      data: {
        name,
        price,
        image_url: image_url || null,
        display_order,
        userId,
        created_at: new Date().toISOString()
      }
    });
    
    return NextResponse.json(normalizeDocument(doc), { status: 201 });
  } catch (error) {
    console.error('[Foods POST Error]:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
