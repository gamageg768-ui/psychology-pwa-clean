import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ challengeId: string }> }) {
  try {
    const { challengeId } = await params;
    const { user_id } = await req.json();
    const cid = parseInt(challengeId);

    const existing = await prisma.challengeEntry.findFirst({
      where: { userId: user_id, challengeId: cid },
    });

    if (existing) {
      await prisma.challengeEntry.deleteMany({ where: { userId: user_id, challengeId: cid } });
      return NextResponse.json({ joined: false });
    }

    await prisma.challengeEntry.create({
      data: { userId: user_id, challengeId: cid, dayNumber: 0 },
    });
    return NextResponse.json({ joined: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
