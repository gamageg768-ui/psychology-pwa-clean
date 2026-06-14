import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const goals = await prisma.goal.findMany({
    where: { userId: Number(userId) },
    include: { milestones: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(goals.map(g => ({
    id: g.id, title: g.title, description: g.description, category: g.category,
    target_date: g.targetDate, status: g.status, ai_plan: g.aiPlan, created_at: g.createdAt,
    milestones: g.milestones.map(m => ({
      id: m.id, title: m.title, completed: m.completed, completed_at: m.completedAt,
    })),
  })));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const body = await req.json();

  if (body.milestone_id) {
    const milestone = await prisma.goalMilestone.update({
      where: { id: body.milestone_id },
      data: { completed: true, completedAt: new Date() },
    });
    const allMilestones = await prisma.goalMilestone.findMany({ where: { goalId: milestone.goalId } });
    if (allMilestones.every(m => m.completed)) {
      await prisma.goal.update({ where: { id: milestone.goalId }, data: { status: 'completed' } });
    }
    return NextResponse.json({ ok: true });
  }

  if (body.goal_id && body.status) {
    await prisma.goal.update({ where: { id: body.goal_id, userId: Number(userId) }, data: { status: body.status } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
