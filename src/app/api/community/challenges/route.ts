import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const SEED_CHALLENGES = [
  { title: '7-Day Gratitude Challenge', description: 'Write 3 things you\'re grateful for each day', emoji: '🌅', durationDays: 7, startDate: '2026-01-01' },
  { title: '14-Day Mindfulness Challenge', description: 'Practice breathing or meditation every day', emoji: '🧘', durationDays: 14, startDate: '2026-01-01' },
  { title: '7-Day Sleep Challenge', description: 'Log your sleep quality every day', emoji: '💤', durationDays: 7, startDate: '2026-01-01' },
  { title: '30-Day Journal Challenge', description: 'Write at least one journal entry per day', emoji: '📓', durationDays: 30, startDate: '2026-01-01' },
  { title: '7-Day Mood Tracking Challenge', description: 'Log your mood every single day', emoji: '😊', durationDays: 7, startDate: '2026-01-01' },
];

export async function GET() {
  try {
    const count = await prisma.challenge.count();
    if (count === 0) {
      await prisma.challenge.createMany({ data: SEED_CHALLENGES });
    }

    const challenges = await prisma.challenge.findMany({
      include: { entries: true },
    });

    return NextResponse.json(challenges);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
