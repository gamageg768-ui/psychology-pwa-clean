import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params;
    const { user_id } = await req.json();
    const gid = parseInt(groupId);

    const existing = await prisma.groupMembership.findUnique({
      where: { userId_groupId: { userId: user_id, groupId: gid } },
    });

    if (existing) {
      await prisma.groupMembership.delete({ where: { userId_groupId: { userId: user_id, groupId: gid } } });
      await prisma.supportGroup.update({ where: { id: gid }, data: { memberCount: { decrement: 1 } } });
      return NextResponse.json({ joined: false });
    }

    await prisma.groupMembership.create({ data: { userId: user_id, groupId: gid } });
    await prisma.supportGroup.update({ where: { id: gid }, data: { memberCount: { increment: 1 } } });
    return NextResponse.json({ joined: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
