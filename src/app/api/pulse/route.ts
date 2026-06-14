import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ollamaGenerate } from '@/lib/ollama';

export async function POST(req: NextRequest) {
  const { user_id, focus, energy, stress, note } = await req.json();

  const prompt = `A person's daily cognitive pulse: Focus ${focus}/10, Energy ${energy}/10, Stress ${stress}/10. Note: ${note ?? 'none'}.
Give a brief 2-sentence insight about their cognitive state and one concrete recovery suggestion for the rest of the day.`;

  const aiInsight = await ollamaGenerate(prompt);

  const log = await prisma.pulseLog.create({
    data: { userId: user_id, focus, energy, stress, note: note ?? '', aiInsight },
  });

  return NextResponse.json({ id: log.id, ai_insight: aiInsight });
}
