import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type TargetType = 'community_post' | 'group_post' | 'group_reply' | 'prompt_response';

async function getRecord(targetType: TargetType, targetId: number) {
  switch (targetType) {
    case 'community_post': return prisma.communityPost.findUnique({ where: { id: targetId } });
    case 'group_post': return prisma.groupPost.findUnique({ where: { id: targetId } });
    case 'group_reply': return prisma.groupReply.findUnique({ where: { id: targetId } });
    case 'prompt_response': return prisma.promptResponse.findUnique({ where: { id: targetId } });
  }
}

async function updateReactions(targetType: TargetType, targetId: number, reactions: string) {
  switch (targetType) {
    case 'community_post': return prisma.communityPost.update({ where: { id: targetId }, data: { reactions } });
    case 'group_post': return prisma.groupPost.update({ where: { id: targetId }, data: { reactions } });
    case 'group_reply': return prisma.groupReply.update({ where: { id: targetId }, data: { reactions } });
    case 'prompt_response': return prisma.promptResponse.update({ where: { id: targetId }, data: { reactions } });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { target_type, target_id, reaction } = await req.json();
    const record = await getRecord(target_type, target_id);
    if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const reactions = JSON.parse((record as { reactions: string }).reactions || '{}');
    reactions[reaction] = Math.max(0, (reactions[reaction] || 0) + 1);
    await updateReactions(target_type, target_id, JSON.stringify(reactions));

    return NextResponse.json({ ok: true, reactions });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
