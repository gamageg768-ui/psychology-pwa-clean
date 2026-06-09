import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateAnonName } from '@/lib/anonName';

export async function GET() {
  try {
    const achievements = await prisma.sharedAchievement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const withNames = await Promise.all(achievements.map(async a => ({
      ...a,
      anonName: await getOrCreateAnonName(a.userId),
      reactions: JSON.parse(a.reactions),
    })));

    return NextResponse.json(withNames);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user_id, achievement, emoji } = await req.json();
    const a = await prisma.sharedAchievement.create({ data: { userId: user_id, achievement, emoji } });
    const anonName = await getOrCreateAnonName(user_id);
    return NextResponse.json({ ...a, anonName, reactions: {} });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
