import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateAnonName } from '@/lib/anonName';

export async function POST(req: NextRequest) {
  try {
    const { user_id, prompt_id, content } = await req.json();
    const existing = await prisma.promptResponse.findUnique({ where: { userId_promptId: { userId: user_id, promptId: prompt_id } } });
    if (existing) return NextResponse.json({ error: 'Already answered today' }, { status: 409 });

    const response = await prisma.promptResponse.create({ data: { userId: user_id, promptId: prompt_id, content } });
    const anonName = await getOrCreateAnonName(user_id);
    return NextResponse.json({ ...response, anonName, reactions: {} });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
