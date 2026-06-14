import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get('user_id'));
  const mood = Number(req.nextUrl.searchParams.get('mood'));

  if (!userId || !mood) return NextResponse.json({ interventions: [] });

  const recentMoods = await prisma.moodLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const avgMood = recentMoods.length
    ? recentMoods.reduce((sum, l) => sum + l.mood, 0) / recentMoods.length
    : mood;

  const interventions: { type: string; title: string; description: string; href: string; color: string; emoji: string }[] = [];

  if (mood <= 4) {
    interventions.push({
      type: 'breathing',
      title: 'Box Breathing',
      description: 'A 4-4-4-4 breathing technique to calm your nervous system right now.',
      href: '/tools',
      color: '#06b6d4',
      emoji: '🫁',
    });
    interventions.push({
      type: 'cbt',
      title: 'Reframe a Thought',
      description: 'Challenge an automatic negative thought with a CBT record.',
      href: '/cbt',
      color: '#f59e0b',
      emoji: '💭',
    });
    interventions.push({
      type: 'crisis',
      title: 'Crisis Resources',
      description: 'Access hotlines, safety plan, and trusted contacts instantly.',
      href: '/contacts',
      color: '#ef4444',
      emoji: '🆘',
    });
  }

  if (mood <= 6) {
    interventions.push({
      type: 'journal',
      title: 'Write it Out',
      description: 'Journaling low moods often reveals patterns and brings relief.',
      href: '/journal',
      color: '#8b5cf6',
      emoji: '📝',
    });
    interventions.push({
      type: 'meditation',
      title: 'Quick Meditation',
      description: 'A 5-minute guided session to reset your mental state.',
      href: '/meditation',
      color: '#10b981',
      emoji: '🧘',
    });
  }

  if (avgMood < 5 && recentMoods.length >= 3) {
    interventions.push({
      type: 'therapy',
      title: 'Talk to Dr. Aria',
      description: 'Your mood has been low recently. An AI therapy session might help.',
      href: '/therapy',
      color: '#6366f1',
      emoji: '🤝',
    });
  }

  return NextResponse.json({ interventions, avg_mood: Math.round(avgMood * 10) / 10 });
}
