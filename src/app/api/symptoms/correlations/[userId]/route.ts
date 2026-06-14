import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ollamaGenerate } from '@/lib/ollama';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const uid = Number(userId);

  const [symptoms, moods, sleep] = await Promise.all([
    prisma.symptomLog.findMany({ where: { userId: uid }, orderBy: { createdAt: 'desc' }, take: 14 }),
    prisma.moodLog.findMany({ where: { userId: uid }, orderBy: { createdAt: 'desc' }, take: 14 }),
    prisma.sleepLog.findMany({ where: { userId: uid }, orderBy: { createdAt: 'desc' }, take: 14 }),
  ]);

  if (symptoms.length < 3) {
    return NextResponse.json({ insight: 'Log at least 3 symptom check-ins to see correlations.', correlations: [] });
  }

  const avgEnergy = (symptoms.reduce((s, l) => s + l.energy, 0) / symptoms.length).toFixed(1);
  const avgAppetite = (symptoms.reduce((s, l) => s + l.appetite, 0) / symptoms.length).toFixed(1);
  const avgFocus = (symptoms.reduce((s, l) => s + l.focus, 0) / symptoms.length).toFixed(1);
  const avgWithdraw = (symptoms.reduce((s, l) => s + l.socialWithdraw, 0) / symptoms.length).toFixed(1);
  const avgMood = moods.length ? (moods.reduce((s, m) => s + m.mood, 0) / moods.length).toFixed(1) : 'N/A';
  const avgSleep = sleep.length ? (sleep.reduce((s, l) => s + l.hours, 0) / sleep.length).toFixed(1) : 'N/A';

  const prompt = `Based on ${symptoms.length} symptom logs:
Avg energy: ${avgEnergy}/10, Avg appetite: ${avgAppetite}/10, Avg focus: ${avgFocus}/10, Avg social withdrawal: ${avgWithdraw}/10
Average mood: ${avgMood}/10, Average sleep: ${avgSleep} hours.

Identify 2-3 specific patterns or correlations (e.g., "Low sleep correlates with low focus", "High social withdrawal days tend to have lower mood"). Be specific and data-driven. 2-3 sentences.`;

  const insight = await ollamaGenerate(prompt);

  const correlations = [
    { label: 'Avg Energy', value: avgEnergy, color: '#f59e0b' },
    { label: 'Avg Appetite', value: avgAppetite, color: '#10b981' },
    { label: 'Avg Focus', value: avgFocus, color: '#6366f1' },
    { label: 'Avg Social', value: (10 - Number(avgWithdraw)).toFixed(1), color: '#06b6d4' },
  ];

  return NextResponse.json({ insight, correlations, avg_mood: avgMood, avg_sleep: avgSleep });
}
