import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ollamaGenerate } from '@/lib/ollama';

export async function POST(req: NextRequest) {
  const { user_id, energy, appetite, focus, social_withdraw, physical_symptoms, note } = await req.json();

  const recentMood = await prisma.moodLog.findFirst({ where: { userId: user_id }, orderBy: { createdAt: 'desc' } });
  const recentSleep = await prisma.sleepLog.findFirst({ where: { userId: user_id }, orderBy: { createdAt: 'desc' } });

  const prompt = `Today's symptom check: Energy ${energy}/10, Appetite ${appetite}/10, Focus ${focus}/10, Social withdrawal ${social_withdraw}/10. Physical: ${physical_symptoms ?? 'none'}. Note: ${note ?? 'none'}.
Recent mood: ${recentMood?.mood ?? 'N/A'}/10. Recent sleep: ${recentSleep?.hours ?? 'N/A'} hours.
Provide a brief 2-sentence pattern insight and one actionable suggestion based on these symptoms.`;

  const aiInsight = await ollamaGenerate(prompt);

  const log = await prisma.symptomLog.create({
    data: {
      userId: user_id, energy, appetite, focus, socialWithdraw: social_withdraw,
      physicalSymptoms: physical_symptoms ?? '', note: note ?? '', aiInsight,
    },
  });

  return NextResponse.json({ id: log.id, ai_insight: aiInsight });
}
