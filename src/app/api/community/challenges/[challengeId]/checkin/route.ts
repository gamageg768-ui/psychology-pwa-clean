import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ challengeId: string }> }) {
  try {
    const { challengeId } = await params;
    const { user_id, note } = await req.json();
    const cid = parseInt(challengeId);

    const entries = await prisma.challengeEntry.findMany({
      where: { userId: user_id, challengeId: cid },
      orderBy: { dayNumber: 'desc' },
    });

    const lastDay = entries.filter(e => e.dayNumber > 0).length;
    const dayNumber = lastDay + 1;

    const existing = await prisma.challengeEntry.findUnique({
      where: { userId_challengeId_dayNumber: { userId: user_id, challengeId: cid, dayNumber } },
    });
    if (existing) return NextResponse.json({ error: 'Already checked in today' }, { status: 409 });

    const entry = await prisma.challengeEntry.create({
      data: { userId: user_id, challengeId: cid, dayNumber, note },
    });
    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
