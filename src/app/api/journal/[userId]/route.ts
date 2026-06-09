import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const entries = await prisma.journalEntry.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(entries.map(e => ({
    id: e.id, content: e.content, ai_analysis: e.aiAnalysis, themes: e.themes,
    created_at: e.createdAt.toISOString(),
  })));
}
