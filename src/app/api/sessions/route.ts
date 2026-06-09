import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { user_id, session_type, title } = await req.json();
  const session = await prisma.therapySession.create({
    data: { userId: user_id, sessionType: session_type ?? 'general', title: title ?? 'New Session' },
  });
  return NextResponse.json({ id: session.id, title: session.title, session_type: session.sessionType });
}
