import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ollamaGenerate } from '@/lib/ollama';

export async function POST(req: NextRequest) {
  const { user_id, mood, emotions, note } = await req.json();
  const prompt = `A person rated their mood ${mood}/10 and is feeling: ${emotions ?? []}.
Note: ${note ?? 'No additional notes'}
Provide a brief, empathetic insight (2-3 sentences) acknowledging their feelings and one supportive suggestion.`;

  const aiInsight = await ollamaGenerate(prompt);
  const log = await prisma.moodLog.create({
    data: {
      userId: user_id, mood, note: note ?? '',
      emotions: JSON.stringify(emotions ?? []),
      aiInsight,
    },
  });
  return NextResponse.json({ id: log.id, ai_insight: aiInsight });
}
