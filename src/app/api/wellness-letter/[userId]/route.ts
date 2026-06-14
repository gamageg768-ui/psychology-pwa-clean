import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ollamaGenerate } from '@/lib/ollama';
import { startOfWeek, endOfWeek, subWeeks, format } from 'date-fns';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const uid = Number(userId);

  const weekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });

  const [moods, journals, sleep, habits, assessments, pulse] = await Promise.all([
    prisma.moodLog.findMany({ where: { userId: uid, createdAt: { gte: weekStart, lte: weekEnd } }, orderBy: { createdAt: 'asc' } }),
    prisma.journalEntry.findMany({ where: { userId: uid, createdAt: { gte: weekStart, lte: weekEnd } } }),
    prisma.sleepLog.findMany({ where: { userId: uid, createdAt: { gte: weekStart, lte: weekEnd } } }),
    prisma.habit.findMany({ where: { userId: uid }, include: { logs: { where: { date: { gte: format(weekStart, 'yyyy-MM-dd'), lte: format(weekEnd, 'yyyy-MM-dd') } } } } }),
    prisma.assessment.findMany({ where: { userId: uid, createdAt: { gte: weekStart, lte: weekEnd } } }),
    prisma.pulseLog.findMany({ where: { userId: uid, createdAt: { gte: weekStart, lte: weekEnd } } }),
  ]);

  const avgMood = moods.length ? (moods.reduce((s, m) => s + m.mood, 0) / moods.length).toFixed(1) : 'N/A';
  const avgSleep = sleep.length ? (sleep.reduce((s, l) => s + l.hours, 0) / sleep.length).toFixed(1) : 'N/A';
  const avgFocus = pulse.length ? (pulse.reduce((s, p) => s + p.focus, 0) / pulse.length).toFixed(1) : 'N/A';
  const habitCompletions = habits.reduce((s, h) => s + h.logs.length, 0);
  const totalHabitDays = habits.length * 7;
  const habitRate = totalHabitDays ? Math.round((habitCompletions / totalHabitDays) * 100) : 0;

  const summary = `Week of ${format(weekStart, 'MMM d')}–${format(weekEnd, 'MMM d, yyyy')}:
- Mood logs: ${moods.length}, Average mood: ${avgMood}/10
- Journal entries: ${journals.length}
- Sleep average: ${avgSleep} hours/night
- Habit completion: ${habitRate}%
- Assessments taken: ${assessments.length}
- Cognitive pulse logs: ${pulse.length}, Avg focus: ${avgFocus}/10`;

  const prompt = `You are a supportive wellness coach writing a weekly letter for a mental health app user.
Weekly data: ${summary}

Write a warm, encouraging weekly wellness letter with these 3 sections:
1. What went well this week (highlight positives from the data)
2. What to focus on next week (one or two areas to improve, gently stated)
3. Three specific action items for the coming week

Keep it personal, warm, and under 250 words total. Do not use clinical language.`;

  const letter = await ollamaGenerate(prompt);

  return NextResponse.json({
    week_start: format(weekStart, 'MMM d'),
    week_end: format(weekEnd, 'MMM d, yyyy'),
    stats: { avg_mood: avgMood, avg_sleep: avgSleep, avg_focus: avgFocus, habit_rate: habitRate, journal_count: journals.length, mood_count: moods.length },
    letter,
  });
}
