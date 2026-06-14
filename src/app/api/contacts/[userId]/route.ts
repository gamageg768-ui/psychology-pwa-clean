import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const contacts = await prisma.trustedContact.findMany({
    where: { userId: Number(userId) },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(contacts.map(c => ({
    id: c.id, name: c.name, phone: c.phone, relation: c.relation, created_at: c.createdAt,
  })));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { contact_id } = await req.json();
  await prisma.trustedContact.deleteMany({ where: { id: contact_id, userId: Number(userId) } });
  return NextResponse.json({ ok: true });
}
