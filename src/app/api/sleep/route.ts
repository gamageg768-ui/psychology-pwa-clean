import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ollamaGenerate } from '@/lib/ollama';

export async function POST(req: NextRequest) {
  const { user_id, hours, quality, bedtime, wake_time, note } = await req.json();
  const qualityLabel = ['', 'Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'][quality] ?? 'Fair';
  const prompt = `Someone slept ${hours} hours last night with ${qualityLabel} sleep quality${note ? ` and noted: "${note}"` : ''}. Give one practical, evidence-based tip (2 sentences max) to improve their sleep tonight. Be specific and actionable.`;
  const aiTip = await ollamaGenerate(prompt);
  const log = await prisma.sleepLog.create({
    data: { userId: user_id, hours, quality, bedtime: bedtime || null, wakeTime: wake_time || null, note: note || null, aiTip },
  });
  return NextResponse.json({ id: log.id, ai_tip: aiTip });
}
