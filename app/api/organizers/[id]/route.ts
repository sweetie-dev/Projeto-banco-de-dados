import { NextResponse } from 'next/server';
import { prisma, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const { id } = await params;
  try {
    const { organization_name, bio, website } = await request.json();
    
    // In Prisma, update throws if not found. Let's use updateMany to include userId filter if we want isolation,
    // or just update if we allow any authenticated user to update (though that's unlikely).
    // The original code didn't filter by userId.
    
    const result = await prisma.organizer.update({
      where: { id },
      data: {
        organization_name: organization_name || '',
        bio: bio || '',
        website: website || '',
      },
    });

    return NextResponse.json(normalizeDocument(result));
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Organizador não encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const { id } = await params;
  try {
    await prisma.organizer.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    // If it doesn't exist, we still return success: true to match original behavior
    return NextResponse.json({ success: true });
  }
}
