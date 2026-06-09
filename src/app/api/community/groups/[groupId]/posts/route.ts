import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateAnonName } from '@/lib/anonName';

export async function GET(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params;
    const gid = parseInt(groupId);

    const posts = await prisma.groupPost.findMany({
      where: { groupId: gid, isMuted: false },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { _count: { select: { replies: true } } },
    });

    const withNames = await Promise.all(posts.map(async p => ({
      ...p,
      anonName: await getOrCreateAnonName(p.userId),
      reactions: JSON.parse(p.reactions),
    })));

    return NextResponse.json(withNames);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params;
    const { user_id, content, content_warn } = await req.json();
    const gid = parseInt(groupId);

    const post = await prisma.groupPost.create({
      data: { userId: user_id, groupId: gid, content, contentWarn: content_warn },
    });
    const anonName = await getOrCreateAnonName(user_id);
    return NextResponse.json({ ...post, anonName, reactions: {}, _count: { replies: 0 } });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
