import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = parseInt(id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [moodCount, sessionCount, journalCount, recentMoods] = await Promise.all([
    prisma.moodLog.count({ where: { userId } }),
    prisma.therapySession.count({ where: { userId } }),
    prisma.journalEntry.count({ where: { userId } }),
    prisma.moodLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 7 }),
  ]);

  const avgMood = recentMoods.length
    ? recentMoods.reduce((s, m) => s + m.mood, 0) / recentMoods.length
    : 0;

  return NextResponse.json({
    id: user.id, name: user.name, email: user.email,
    stats: {
      mood_logs: moodCount, sessions: sessionCount, journals: journalCount,
      avg_mood: Math.round(avgMood * 10) / 10,
    },
  });
}
