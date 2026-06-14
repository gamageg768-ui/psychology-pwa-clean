import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const userId = Number(req.nextUrl.searchParams.get('user_id'));
  const progress = await prisma.courseProgress.findUnique({ where: { userId_courseId: { userId, courseId } } });
  if (!progress) return NextResponse.json({ course_id: courseId, steps_done: [], completed: false });
  return NextResponse.json({
    course_id: courseId,
    steps_done: JSON.parse(progress.stepsDone),
    completed: progress.completed,
    quiz_score: progress.quizScore,
    completed_at: progress.completedAt,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const { user_id, steps_done, completed, quiz_score } = await req.json();
  const progress = await prisma.courseProgress.upsert({
    where: { userId_courseId: { userId: user_id, courseId } },
    update: {
      stepsDone: JSON.stringify(steps_done),
      completed,
      quizScore: quiz_score,
      completedAt: completed ? new Date() : undefined,
    },
    create: {
      userId: user_id, courseId,
      stepsDone: JSON.stringify(steps_done),
      completed,
      quizScore: quiz_score,
      completedAt: completed ? new Date() : undefined,
    },
  });
  return NextResponse.json({ ok: true, completed: progress.completed });
}
