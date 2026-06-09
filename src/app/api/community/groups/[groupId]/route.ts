import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateAnonName } from '@/lib/anonName';

export async function GET(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params;
    const gid = parseInt(groupId);
    const userId = parseInt(req.nextUrl.searchParams.get('user_id') || '0');

    const group = await prisma.supportGroup.findUnique({ where: { id: gid } });
    if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const posts = await prisma.groupPost.findMany({
      where: { groupId: gid, isMuted: false },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { _count: { select: { replies: true } } },
    });

    const postsWithNames = await Promise.all(posts.map(async p => ({
      ...p,
      anonName: await getOrCreateAnonName(p.userId),
      reactions: JSON.parse(p.reactions),
    })));

    const isMember = userId ? !!(await prisma.groupMembership.findUnique({
      where: { userId_groupId: { userId, groupId: gid } },
    })) : false;

    return NextResponse.json({ group, posts: postsWithNames, isMember });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
