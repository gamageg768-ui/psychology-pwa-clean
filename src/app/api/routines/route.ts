import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { user_id, name, type, emoji, steps } = await req.json();
  const routine = await prisma.routine.create({
    data: {
      userId: user_id, name, type, emoji,
      steps: {
        create: steps.map((s: { activity: string; duration: number }, i: number) => ({
          stepOrder: i, activity: s.activity, duration: s.duration,
        })),
      },
    },
    include: { steps: { orderBy: { stepOrder: 'asc' } } },
  });
  return NextResponse.json({
    id: routine.id, name: routine.name, type: routine.type, emoji: routine.emoji,
    created_at: routine.createdAt,
    steps: routine.steps.map(s => ({ id: s.id, step_order: s.stepOrder, activity: s.activity, duration: s.duration })),
  });
}
