import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateAnonName } from '@/lib/anonName';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'feed';
    const page = parseInt(searchParams.get('page') || '0');
    const sort = searchParams.get('sort') || 'recent';

    const posts = await prisma.communityPost.findMany({
      where: { postType: type, isMuted: false },
      orderBy: sort === 'recent' ? { createdAt: 'desc' } : { createdAt: 'desc' },
      skip: page * 20,
      take: 20,
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

export async function POST(req: NextRequest) {
  try {
    const { user_id, content, post_type, mood, content_warn, url } = await req.json();
    const post = await prisma.communityPost.create({
      data: { userId: user_id, content, postType: post_type || 'feed', mood, contentWarn: content_warn, url },
    });
    const anonName = await getOrCreateAnonName(user_id);
    return NextResponse.json({ ...post, anonName, reactions: {} });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
