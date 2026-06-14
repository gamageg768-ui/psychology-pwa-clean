import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { user_id, type, duration, completed } = await req.json();
  const session = await prisma.meditationSession.create({
    data: { userId: user_id, type, duration, completed },
  });
  return NextResponse.json({ id: session.id });
}

export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get('user_id'));
  const sessions = await prisma.meditationSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  return NextResponse.json(sessions.map(s => ({
    id: s.id, type: s.type, duration: s.duration, completed: s.completed, created_at: s.createdAt,
  })));
}
