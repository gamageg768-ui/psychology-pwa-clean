import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const routines = await prisma.routine.findMany({
    where: { userId: Number(userId) },
    include: { steps: { orderBy: { stepOrder: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(routines.map(r => ({
    id: r.id, name: r.name, type: r.type, emoji: r.emoji, created_at: r.createdAt,
    steps: r.steps.map(s => ({ id: s.id, step_order: s.stepOrder, activity: s.activity, duration: s.duration })),
  })));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { routine_id } = await req.json();
  await prisma.routineStep.deleteMany({ where: { routineId: routine_id } });
  await prisma.routine.deleteMany({ where: { id: routine_id, userId: Number(userId) } });
  return NextResponse.json({ ok: true });
}
