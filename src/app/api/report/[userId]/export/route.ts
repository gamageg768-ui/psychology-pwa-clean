import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { format, subDays } from 'date-fns';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const uid = Number(userId);
  const since = subDays(new Date(), 30);

  const [user, moods, journals, sleep, habits, assessments, symptoms] = await Promise.all([
    prisma.user.findUnique({ where: { id: uid } }),
    prisma.moodLog.findMany({ where: { userId: uid, createdAt: { gte: since } }, orderBy: { createdAt: 'asc' } }),
    prisma.journalEntry.findMany({ where: { userId: uid, createdAt: { gte: since } }, orderBy: { createdAt: 'desc' }, take: 30 }),
    prisma.sleepLog.findMany({ where: { userId: uid, createdAt: { gte: since } }, orderBy: { createdAt: 'asc' } }),
    prisma.habit.findMany({ where: { userId: uid }, include: { logs: { where: { date: { gte: format(since, 'yyyy-MM-dd') } } } } }),
    prisma.assessment.findMany({ where: { userId: uid }, orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.symptomLog.findMany({ where: { userId: uid, createdAt: { gte: since } }, orderBy: { createdAt: 'asc' } }),
  ]);

  const avgMood = moods.length ? (moods.reduce((s, m) => s + m.mood, 0) / moods.length).toFixed(1) : 'N/A';
  const avgSleep = sleep.length ? (sleep.reduce((s, l) => s + l.hours, 0) / sleep.length).toFixed(1) : 'N/A';
  const habitCompletions = habits.reduce((s, h) => s + h.logs.length, 0);
  const totalHabitDays = habits.length * 30;
  const habitRate = totalHabitDays ? Math.round((habitCompletions / totalHabitDays) * 100) : 0;

  const reportDate = format(new Date(), 'MMMM d, yyyy');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>MindSpace Wellness Report — ${reportDate}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; background: #fff; padding: 40px; }
  .header { border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
  .brand { font-size: 24px; font-weight: 800; color: #6366f1; }
  .title { font-size: 16px; color: #64748b; margin-top: 4px; }
  .meta { font-size: 13px; color: #94a3b8; margin-top: 8px; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 14px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 14px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
  .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; text-align: center; }
  .stat-value { font-size: 22px; font-weight: 700; color: #6366f1; }
  .stat-label { font-size: 11px; color: #94a3b8; margin-top: 3px; }
  .mood-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .mood-fill { height: 10px; border-radius: 5px; background: linear-gradient(to right, #ef4444, #f59e0b, #10b981); }
  .assessment-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; background: #ede9fe; color: #6366f1; }
  .habit-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
  .progress-outer { width: 120px; height: 6px; background: #e2e8f0; border-radius: 3px; }
  .progress-inner { height: 100%; border-radius: 3px; background: #10b981; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  .disclaimer { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px 16px; margin-top: 20px; font-size: 12px; color: #92400e; }
</style>
</head>
<body>
<div class="header">
  <div class="brand">🧠 MindSpace</div>
  <div class="title">Wellness Report — ${reportDate}</div>
  <div class="meta">Patient: ${user?.name ?? 'Anonymous'} &nbsp;·&nbsp; Period: ${format(since, 'MMM d')} – ${format(new Date(), 'MMM d, yyyy')} (30 days)</div>
</div>

<div class="section">
  <div class="section-title">Summary Statistics</div>
  <div class="stat-grid">
    <div class="stat"><div class="stat-value">${avgMood}</div><div class="stat-label">Avg Mood /10</div></div>
    <div class="stat"><div class="stat-value">${avgSleep}</div><div class="stat-label">Avg Sleep hrs</div></div>
    <div class="stat"><div class="stat-value">${habitRate}%</div><div class="stat-label">Habit Rate</div></div>
    <div class="stat"><div class="stat-value">${journals.length}</div><div class="stat-label">Journal Entries</div></div>
  </div>
  <div class="stat-grid">
    <div class="stat"><div class="stat-value">${moods.length}</div><div class="stat-label">Mood Logs</div></div>
    <div class="stat"><div class="stat-value">${sleep.length}</div><div class="stat-label">Sleep Logs</div></div>
    <div class="stat"><div class="stat-value">${assessments.length}</div><div class="stat-label">Assessments</div></div>
    <div class="stat"><div class="stat-value">${symptoms.length}</div><div class="stat-label">Symptom Logs</div></div>
  </div>
</div>

${moods.length > 0 ? `
<div class="section">
  <div class="section-title">Mood Trend (Last 30 Days)</div>
  ${moods.slice(-14).map(m => `
    <div class="mood-bar">
      <span style="font-size:11px;color:#94a3b8;width:70px;flex-shrink:0">${format(new Date(m.createdAt), 'MMM d')}</span>
      <div class="mood-fill" style="width:${m.mood * 10}%"></div>
      <span style="font-size:12px;font-weight:600;color:#6366f1;width:20px;flex-shrink:0">${m.mood}</span>
    </div>
  `).join('')}
</div>` : ''}

${assessments.length > 0 ? `
<div class="section">
  <div class="section-title">Assessments</div>
  ${assessments.map(a => `
    <div class="assessment-row">
      <span style="font-size:13px;font-weight:600">${a.assessmentType}</span>
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:13px;color:#64748b">${a.interpretation ?? ''}</span>
        <span class="badge">Score: ${a.score?.toFixed(1) ?? 'N/A'}</span>
      </div>
    </div>
  `).join('')}
</div>` : ''}

${habits.length > 0 ? `
<div class="section">
  <div class="section-title">Habit Tracking</div>
  ${habits.map(h => {
    const rate = Math.min(100, Math.round((h.logs.length / 30) * 100));
    return `
    <div class="habit-row">
      <span style="font-size:13px">${h.emoji} ${h.title}</span>
      <div style="display:flex;align-items:center;gap:8px">
        <div class="progress-outer"><div class="progress-inner" style="width:${rate}%"></div></div>
        <span style="font-size:12px;font-weight:600;color:#10b981">${rate}%</span>
      </div>
    </div>`;
  }).join('')}
</div>` : ''}

<div class="disclaimer">
  ⚠️ This report is generated by MindSpace and is intended to support conversations with your healthcare provider. It does not constitute a clinical diagnosis or medical advice.
</div>

<div class="footer">
  Generated by MindSpace &nbsp;·&nbsp; ${reportDate} &nbsp;·&nbsp; Powered by Ollama AI &nbsp;·&nbsp; Confidential
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="mindspace-report-${format(new Date(), 'yyyy-MM-dd')}.html"`,
    },
  });
}
