import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const logs = await prisma.symptomLog.findMany({
    where: { userId: Number(userId) },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
  return NextResponse.json(logs.map(l => ({
    id: l.id, energy: l.energy, appetite: l.appetite, focus: l.focus,
    social_withdraw: l.socialWithdraw, physical_symptoms: l.physicalSymptoms,
    note: l.note, ai_insight: l.aiInsight, created_at: l.createdAt,
  })));
}
