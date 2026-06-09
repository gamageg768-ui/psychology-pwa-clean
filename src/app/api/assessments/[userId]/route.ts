import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const assessments = await prisma.assessment.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(assessments.map(a => ({
    id: a.id, assessment_type: a.assessmentType, score: a.score,
    interpretation: a.interpretation, ai_report: a.aiReport,
    created_at: a.createdAt.toISOString(),
  })));
}
