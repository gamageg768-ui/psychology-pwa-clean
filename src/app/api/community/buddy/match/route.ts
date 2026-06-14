import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get('user_id'));
  const matches = await prisma.buddyMatch.findMany({
    where: { OR: [{ user1Id: userId }, { user2Id: userId }], status: 'active' },
    include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });

  const result = await Promise.all(matches.map(async (m) => {
    const partnerId = m.user1Id === userId ? m.user2Id : m.user1Id;
    const partner = await prisma.anonName.findUnique({ where: { userId: partnerId } });
    return {
      id: m.id, area: m.area, status: m.status, created_at: m.createdAt,
      partner_name: partner?.name ?? 'Anonymous Friend',
      last_message: m.messages[0]?.content ?? null,
    };
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const { user_id, area } = await req.json();

  const existingMatch = await prisma.buddyMatch.findFirst({
    where: { OR: [{ user1Id: user_id }, { user2Id: user_id }], area, status: 'active' },
  });
  if (existingMatch) return NextResponse.json({ id: existingMatch.id, matched: true, existing: true });

  const potentialMatch = await prisma.buddyMatch.findFirst({
    where: { user2Id: 0, area, status: 'waiting' },
  });

  if (potentialMatch && potentialMatch.user1Id !== user_id) {
    const match = await prisma.buddyMatch.update({
      where: { id: potentialMatch.id },
      data: { user2Id: user_id, status: 'active' },
    });
    const partner = await prisma.anonName.findUnique({ where: { userId: potentialMatch.user1Id } });
    return NextResponse.json({ id: match.id, matched: true, partner_name: partner?.name ?? 'Anonymous Friend' });
  }

  const pending = await prisma.buddyMatch.create({
    data: { user1Id: user_id, user2Id: 0, area, status: 'waiting' },
  });
  return NextResponse.json({ id: pending.id, matched: false, message: 'Searching for a buddy. Check back soon.' });
}
