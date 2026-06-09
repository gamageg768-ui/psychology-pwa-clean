import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = await prisma.therapySession.findUnique({ where: { id: parseInt(sessionId) } });
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({
    messages: JSON.parse(session.messages),
    session_type: session.sessionType,
    title: session.title,
  });
}
