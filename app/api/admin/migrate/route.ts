import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

  const db = await getDb();
  
  // 1. Migrar Produtos sem user_id
  const foodResult = await db.collection('foods').updateMany(
    { user_id: { $exists: false } },
    { $set: { user_id: userId } }
  );

  // 2. Migrar Vendas sem user_id
  const salesResult = await db.collection('sales').updateMany(
    { user_id: { $exists: false } },
    { $set: { user_id: userId } }
  );
  
  // 3. Migrar Configurações PIX sem user_id
  const pixResult = await db.collection('pix_config').updateMany(
    { user_id: { $exists: false } },
    { $set: { user_id: userId } }
  );

  return NextResponse.json({
    message: 'Migração concluída com sucesso!',
    details: {
      foods_updated: foodResult.modifiedCount,
      sales_updated: salesResult.modifiedCount,
      pix_updated: pixResult.modifiedCount,
      assigned_to: userId
    }
  });
}
