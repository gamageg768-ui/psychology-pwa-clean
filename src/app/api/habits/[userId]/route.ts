import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const today = new Date().toISOString().slice(0, 10);
  const habits = await prisma.habit.findMany({
    where: { userId: parseInt(userId) },
    include: { logs: { orderBy: { date: 'desc' }, take: 30 } },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(habits.map(h => {
    const doneDates = h.logs.map(l => l.date);
    const doneToday = doneDates.includes(today);
    let streak = 0;
    const d = new Date(); d.setHours(0, 0, 0, 0);
    while (true) {
      const ds = d.toISOString().slice(0, 10);
      if (!doneDates.includes(ds)) break;
      streak++; d.setDate(d.getDate() - 1);
    }
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(); day.setDate(day.getDate() - (6 - i));
      return { date: day.toISOString().slice(0, 10), done: doneDates.includes(day.toISOString().slice(0, 10)) };
    });
    return { id: h.id, title: h.title, emoji: h.emoji, done_today: doneToday, streak, last7, created_at: h.createdAt };
  }));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { habit_id } = await req.json();
  await prisma.habitLog.deleteMany({ where: { habitId: habit_id } });
  await prisma.habit.deleteMany({ where: { id: habit_id, userId: parseInt(userId) } });
  return NextResponse.json({ ok: true });
}
