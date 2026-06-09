import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const records = await prisma.thoughtRecord.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(records.map(r => ({
    id: r.id, situation: r.situation, automatic_thought: r.automaticThought,
    emotion: r.emotion, evidence_for: r.evidenceFor, evidence_against: r.evidenceAgainst,
    balanced_thought: r.balancedThought, ai_reframe: r.aiReframe, created_at: r.createdAt,
  })));
}
