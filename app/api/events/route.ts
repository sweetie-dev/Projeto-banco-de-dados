import { NextResponse } from 'next/server';
import { getDb, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  
  const url = new URL(request.url);
  const category_id = url.searchParams.get('category_id');
  const organizer_id = url.searchParams.get('organizer_id');
  const tag_id = url.searchParams.get('tag_id');

  const filter: any = {};
  if (category_id) filter.category_id = category_id;
  if (organizer_id) filter.organizer_id = organizer_id;
  if (tag_id) filter.tag_ids = tag_id; // In MongoDB, if tag_ids is an array, this matches if tag_id is in it

  const db = await getDb();
  const docs = await db.collection('events').find(filter).sort({ start_date: 1 }).toArray();
  
  return NextResponse.json(docs.map(normalizeDocument));
}

export async function POST(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  try {
    const { title, description, organizer_id, location_id, category_id, tag_ids, start_date, end_date, price, capacity } = await request.json();
    if (!title || !description || !organizer_id || !location_id || !category_id || !Array.isArray(tag_ids) || !start_date || !end_date || typeof price !== 'number' || typeof capacity !== 'number') {
      return NextResponse.json({ message: 'Dados completos do evento são obrigatórios.' }, { status: 400 });
    }
    
    const db = await getDb();
    const doc = {
      title,
      description,
      organizer_id,
      location_id,
      category_id,
      tag_ids,
      start_date: String(start_date),
      end_date: String(end_date),
      price,
      capacity,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db.collection('events').insertOne(doc);
    return NextResponse.json(normalizeDocument({ ...doc, _id: result.insertedId }), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
