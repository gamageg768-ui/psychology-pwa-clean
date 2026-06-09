'use client';

import { useState } from 'react';
import { Sparkles, TrendingUp, BookOpen, ClipboardList } from 'lucide-react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

interface Report {
  avg_mood: string | null; mood_count: number; mood_data: { date: string; mood: number }[];
  journal_count: number; top_themes: string[];
  assessments: { type: string; score: number | null; interpretation: string | null }[];
  reflection: string; generated_at: string;
}

export default function ReportPage() {
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/report/${user.id}`);
      setReport(res.data);
    } catch { /* silent */ }
    setLoading(false);
  };

  const moodChartData = report?.mood_data.map(d => ({
    date: format(new Date(d.date), 'MM/dd'), mood: d.mood,
  })) ?? [];

  const tooltipStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12 };

  const getScoreColor = (s: number | null) => !s ? '' : s < 4 ? 'text-calm-400' : s < 7 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Weekly Progress Report</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>AI-generated summary of your past 7 days</p>
      </div>

      {!report ? (
        <div className="card text-center py-12 space-y-4">
          <div className="text-5xl">📊</div>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Generate your weekly report</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Dr. Aria will analyze your mood logs, journal entries, and assessments from the last 7 days.</p>
          <button onClick={generate} disabled={loading} className="btn-primary inline-flex items-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing your week...</>
              : <><Sparkles size={16} />Generate Report</>}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>Generated {format(new Date(report.generated_at), 'MMM d, h:mm a')}</div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Mood Logs', value: report.mood_count, icon: <TrendingUp size={16} className="text-primary-400" />, sub: report.avg_mood ? `Avg ${report.avg_mood}/10` : 'No logs' },
              { label: 'Journals', value: report.journal_count, icon: <BookOpen size={16} className="text-accent-400" />, sub: report.top_themes[0] || 'No entries' },
              { label: 'Assessments', value: report.assessments.length, icon: <ClipboardList size={16} className="text-calm-400" />, sub: 'this week' },
            ].map((s, i) => (
              <div key={i} className="card text-center p-3">
                <div className="flex justify-center mb-1">{s.icon}</div>
                <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Mood sparkline */}
          {moodChartData.length > 1 && (
            <div className="card">
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <TrendingUp size={16} className="text-primary-400" /> Mood This Week
                {report.avg_mood && <span className="ml-auto font-bold text-primary-400">{report.avg_mood}/10 avg</span>}
              </h3>
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={moodChartData}>
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="mood" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top themes */}
          {report.top_themes.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                <BookOpen size={16} className="inline mr-2 text-accent-400" />Journal Themes This Week
              </h3>
              <div className="flex flex-wrap gap-2">
                {report.top_themes.map(t => (
                  <span key={t} className="px-3 py-1 rounded-full text-sm text-accent-300" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Assessment highlights */}
          {report.assessments.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                <ClipboardList size={16} className="inline mr-2 text-calm-400" />Assessment Highlights
              </h3>
              <div className="space-y-2">
                {report.assessments.map((a, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{a.type}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${getScoreColor(a.score)}`}>{a.score?.toFixed(1)}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Reflection */}
          <div className="glass rounded-2xl p-5 border border-primary-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-primary-400" />
              <span className="font-semibold text-primary-300">Dr. Aria's Weekly Reflection</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{report.reflection}</p>
          </div>

          <button onClick={generate} disabled={loading} className="btn-ghost w-full flex items-center justify-center gap-2 text-sm">
            {loading ? <><div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />Regenerating...</> : '🔄 Regenerate Report'}
          </button>
        </div>
      )}
    </div>
  );
}
