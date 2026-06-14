import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const messages = await prisma.buddyMessage.findMany({
    where: { matchId: Number(matchId) },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(messages.map(m => ({
    id: m.id, match_id: m.matchId, sender_id: m.senderId, content: m.content, created_at: m.createdAt,
  })));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const { sender_id, content } = await req.json();
  const message = await prisma.buddyMessage.create({
    data: { matchId: Number(matchId), senderId: sender_id, content },
  });
  return NextResponse.json({ id: message.id, created_at: message.createdAt });
}
