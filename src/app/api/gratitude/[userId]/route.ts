import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const entries = await prisma.gratitudeEntry.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(entries.map(e => ({
    id: e.id,
    items: JSON.parse(e.items) as string[],
    reflection: e.reflection,
    created_at: e.createdAt,
  })));
}
