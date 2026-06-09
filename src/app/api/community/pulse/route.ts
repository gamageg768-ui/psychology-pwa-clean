import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const recentLogs = await prisma.moodLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    if (recentLogs.length === 0) return NextResponse.json({ avg: null, count: 0, topEmotions: [] });

    const avg = recentLogs.reduce((s, l) => s + l.mood, 0) / recentLogs.length;

    const emotionFreq: Record<string, number> = {};
    recentLogs.forEach(l => {
      if (l.emotions) {
        try {
          const arr: string[] = JSON.parse(l.emotions);
          arr.forEach(e => { emotionFreq[e] = (emotionFreq[e] || 0) + 1; });
        } catch {}
      }
    });
    const topEmotions = Object.entries(emotionFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([e]) => e);

    const today = new Date().toISOString().slice(0, 10);
    const todayLogs = await prisma.moodLog.count({ where: { createdAt: { gte: new Date(today) } } });

    return NextResponse.json({ avg: Math.round(avg * 10) / 10, count: recentLogs.length, todayCount: todayLogs, topEmotions });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
