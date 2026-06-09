import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateAnonName } from '@/lib/anonName';

export async function GET(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const pid = parseInt(postId);

    const replies = await prisma.groupReply.findMany({
      where: { postId: pid, isMuted: false },
      orderBy: { createdAt: 'asc' },
    });

    const withNames = await Promise.all(replies.map(async r => ({
      ...r,
      anonName: await getOrCreateAnonName(r.userId),
    })));

    return NextResponse.json(withNames);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const { user_id, content } = await req.json();
    const pid = parseInt(postId);

    const reply = await prisma.groupReply.create({
      data: { userId: user_id, postId: pid, content },
    });
    const anonName = await getOrCreateAnonName(user_id);
    return NextResponse.json({ ...reply, anonName });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
