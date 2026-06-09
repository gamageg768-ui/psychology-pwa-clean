import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const SEED_GROUPS = [
  { name: 'Anxiety & Worry', emoji: '😰', description: 'A safe space to share and manage anxiety together', category: 'anxiety' },
  { name: 'Depression & Low Mood', emoji: '💙', description: 'Support for navigating depression and difficult days', category: 'depression' },
  { name: 'Grief & Loss', emoji: '🕊️', description: 'Gentle space for processing grief and loss', category: 'grief' },
  { name: 'Sleep Struggles', emoji: '😴', description: 'For those dealing with insomnia and sleep issues', category: 'sleep' },
  { name: 'Relationships & Loneliness', emoji: '💑', description: 'Navigating relationships and feelings of isolation', category: 'relationships' },
  { name: 'Recovery & Healing', emoji: '🌱', description: 'Celebrating and supporting recovery journeys', category: 'recovery' },
  { name: 'PTSD & Trauma', emoji: '🧠', description: 'Trauma-informed support and shared experiences', category: 'ptsd' },
  { name: 'General Support', emoji: '💬', description: 'Open space for any wellness conversation', category: 'general' },
];

export async function GET() {
  try {
    const count = await prisma.supportGroup.count();
    if (count === 0) {
      await prisma.supportGroup.createMany({ data: SEED_GROUPS });
    }

    const groups = await prisma.supportGroup.findMany({
      include: { _count: { select: { memberships: true, posts: true } } },
    });

    return NextResponse.json(groups);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
