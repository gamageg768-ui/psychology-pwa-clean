import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { name, email } = await req.json();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
  const user = await prisma.user.create({ data: { name, email } });
  return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
}
