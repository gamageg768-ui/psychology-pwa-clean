import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const logs = await prisma.sleepLog.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
  return NextResponse.json(logs.map(l => ({
    id: l.id, hours: l.hours, quality: l.quality,
    bedtime: l.bedtime, wake_time: l.wakeTime,
    note: l.note, ai_tip: l.aiTip, created_at: l.createdAt,
  })));
}
