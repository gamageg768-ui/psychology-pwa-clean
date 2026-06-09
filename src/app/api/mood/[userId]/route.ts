import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const logs = await prisma.moodLog.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
  return NextResponse.json(logs.map(l => ({
    id: l.id, mood: l.mood, note: l.note, ai_insight: l.aiInsight,
    emotions: JSON.parse(l.emotions ?? '[]'),
    created_at: l.createdAt.toISOString(),
  })));
}
