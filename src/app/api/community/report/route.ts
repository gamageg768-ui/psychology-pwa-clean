import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const AUTO_MUTE_THRESHOLD = 5;

async function incrementReports(targetType: string, targetId: number) {
  switch (targetType) {
    case 'community_post': {
      const r = await prisma.communityPost.update({ where: { id: targetId }, data: { reports: { increment: 1 } } });
      if (r.reports >= AUTO_MUTE_THRESHOLD) await prisma.communityPost.update({ where: { id: targetId }, data: { isMuted: true } });
      break;
    }
    case 'group_post': {
      const r = await prisma.groupPost.update({ where: { id: targetId }, data: { reports: { increment: 1 } } });
      if (r.reports >= AUTO_MUTE_THRESHOLD) await prisma.groupPost.update({ where: { id: targetId }, data: { isMuted: true } });
      break;
    }
    case 'group_reply': {
      const r = await prisma.groupReply.update({ where: { id: targetId }, data: { reports: { increment: 1 } } });
      if (r.reports >= AUTO_MUTE_THRESHOLD) await prisma.groupReply.update({ where: { id: targetId }, data: { isMuted: true } });
      break;
    }
    case 'prompt_response': {
      const r = await prisma.promptResponse.update({ where: { id: targetId }, data: { reports: { increment: 1 } } });
      if (r.reports >= AUTO_MUTE_THRESHOLD) await prisma.promptResponse.update({ where: { id: targetId }, data: { isMuted: true } });
      break;
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { reporter_id, target_type, target_id, reason } = await req.json();
    await prisma.contentReport.create({ data: { reporterId: reporter_id, targetType: target_type, targetId: target_id, reason } });
    await incrementReports(target_type, target_id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
