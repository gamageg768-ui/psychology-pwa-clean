import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { user_id, title, emoji } = await req.json();
  const habit = await prisma.habit.create({
    data: { userId: user_id, title, emoji: emoji || '✅' },
  });
  return NextResponse.json({ id: habit.id, title: habit.title, emoji: habit.emoji });
}
