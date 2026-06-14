import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { user_id, name, phone, relation } = await req.json();
  const existing = await prisma.trustedContact.count({ where: { userId: user_id } });
  if (existing >= 5) return NextResponse.json({ error: 'Maximum 5 trusted contacts allowed' }, { status: 400 });
  const contact = await prisma.trustedContact.create({
    data: { userId: user_id, name, phone, relation: relation ?? '' },
  });
  return NextResponse.json({ id: contact.id, name: contact.name, phone: contact.phone, relation: contact.relation, created_at: contact.createdAt });
}
