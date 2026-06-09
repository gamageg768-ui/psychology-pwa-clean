import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ollamaGenerate } from '@/lib/ollama';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const uid = parseInt(userId);
  const since = new Date(); since.setDate(since.getDate() - 7);

  const [moods, journals, assessments] = await Promise.all([
    prisma.moodLog.findMany({ where: { userId: uid, createdAt: { gte: since } }, orderBy: { createdAt: 'asc' } }),
    prisma.journalEntry.findMany({ where: { userId: uid, createdAt: { gte: since } }, orderBy: { createdAt: 'desc' }, take: 7 }),
    prisma.assessment.findMany({ where: { userId: uid, createdAt: { gte: since } }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ]);

  const avgMood = moods.length ? (moods.reduce((s, m) => s + m.mood, 0) / moods.length).toFixed(1) : null;
  const allThemes = journals.flatMap(j => (j.themes ? j.themes.split(',').map(t => t.trim()) : []));
  const themeCounts: Record<string, number> = {};
  allThemes.forEach(t => { if (t) themeCounts[t] = (themeCounts[t] || 0) + 1; });
  const topThemes = Object.entries(themeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);

  const assessmentSummary = assessments.slice(0, 3).map(a => `${a.assessmentType}: ${a.score?.toFixed(1)}/10`).join(', ');
  const moodSummary = moods.map(m => m.mood).join(', ');

  const prompt = `Weekly mental wellness summary for a MindSpace user:
- Mood logs this week: ${moods.length} entries, scores: [${moodSummary}], average: ${avgMood ?? 'none'}/10
- Journal entries: ${journals.length}, top themes: ${topThemes.join(', ') || 'none'}
- Assessments: ${assessmentSummary || 'none this week'}

Write a warm, clinical yet compassionate weekly reflection (3-4 sentences, under 100 words) as Dr. Aria. Acknowledge patterns, celebrate consistency, and offer one gentle suggestion for next week. Do not use bullet points.`;

  const reflection = await ollamaGenerate(prompt);

  return NextResponse.json({
    avg_mood: avgMood,
    mood_count: moods.length,
    mood_data: moods.map(m => ({ date: m.createdAt, mood: m.mood })),
    journal_count: journals.length,
    top_themes: topThemes,
    assessments: assessments.slice(0, 3).map(a => ({ type: a.assessmentType, score: a.score, interpretation: a.interpretation })),
    reflection,
    generated_at: new Date().toISOString(),
  });
}
