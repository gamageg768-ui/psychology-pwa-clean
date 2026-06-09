import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const sessions = await prisma.therapySession.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json(sessions.map(s => ({
    id: s.id, title: s.title, session_type: s.sessionType,
    created_at: s.createdAt.toISOString(),
  })));
}
