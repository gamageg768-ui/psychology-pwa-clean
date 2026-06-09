import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { habit_id, date } = await req.json();
  const today = date || new Date().toISOString().slice(0, 10);
  const existing = await prisma.habitLog.findFirst({ where: { habitId: habit_id, date: today } });
  if (existing) {
    await prisma.habitLog.delete({ where: { id: existing.id } });
    return NextResponse.json({ done: false });
  }
  await prisma.habitLog.create({ data: { habitId: habit_id, date: today } });
  return NextResponse.json({ done: true });
}
