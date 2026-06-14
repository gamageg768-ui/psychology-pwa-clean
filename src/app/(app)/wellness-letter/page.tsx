'use client';

import { useState } from 'react';
import { Mail, Sparkles, TrendingUp, Moon, Brain, CheckSquare, BookOpen, Activity } from 'lucide-react';
import { wellnessLetterApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface LetterData {
  week_start: string;
  week_end: string;
  stats: {
    avg_mood: string; avg_sleep: string; avg_focus: string;
    habit_rate: number; journal_count: number; mood_count: number;
  };
  letter: string;
}

const STATS_CONFIG = [
  { key: 'avg_mood', label: 'Avg Mood', icon: <Activity size={14} />, color: '#6366f1', suffix: '/10' },
  { key: 'avg_sleep', label: 'Avg Sleep', icon: <Moon size={14} />, color: '#06b6d4', suffix: 'hrs' },
  { key: 'avg_focus', label: 'Avg Focus', icon: <Brain size={14} />, color: '#8b5cf6', suffix: '/10' },
  { key: 'habit_rate', label: 'Habits Done', icon: <CheckSquare size={14} />, color: '#10b981', suffix: '%' },
  { key: 'journal_count', label: 'Journals', icon: <BookOpen size={14} />, color: '#f59e0b', suffix: '' },
  { key: 'mood_count', label: 'Mood Logs', icon: <TrendingUp size={14} />, color: '#ec4899', suffix: '' },
];

export default function WellnessLetterPage() {
  const { user } = useAuth();
  const [data, setData] = useState<LetterData | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await wellnessLetterApi.get(user.id);
      setData(res.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Weekly Wellness Letter</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your personalized AI digest of last week</p>
      </div>

      {!data && (
        <div className="card text-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto">
            <Mail size={32} className="text-indigo-400" />
          </div>
          <div>
            <div className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Your Weekly Letter Awaits</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              AI analyzes your mood, sleep, habits, and journal from last week to craft a personal wellness digest.
            </p>
          </div>
          <button onClick={generate} disabled={loading} className="btn-primary mx-auto flex items-center gap-2 px-6">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating your letter...</>
              : <><Sparkles size={15} /> Generate This Week's Letter</>}
          </button>
        </div>
      )}

      {data && (
        <div className="space-y-5">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Mail size={16} className="text-indigo-400" />
              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Week of {data.week_start} – {data.week_end}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {STATS_CONFIG.map(({ key, label, icon, color, suffix }) => (
                <div key={key} className="rounded-xl p-2.5 text-center" style={{ background: `${color}12` }}>
                  <div className="flex items-center justify-center mb-1" style={{ color }}>{icon}</div>
                  <div className="text-base font-bold" style={{ color }}>
                    {(data.stats as unknown as Record<string, string | number>)[key]}{suffix}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ borderLeft: '3px solid #6366f1' }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-indigo-400" />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Letter from Dr. Aria</span>
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
              {data.letter}
            </div>
          </div>

          <button onClick={() => { setData(null); generate(); }} className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            style={{ background: 'var(--subtle-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            <Sparkles size={14} /> Regenerate Letter
          </button>
        </div>
      )}
    </div>
  );
}
