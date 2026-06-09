'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, Shield, Heart, Brain, Activity, BookOpen, TrendingUp, BarChart2,
         Star, Flame, Zap, Moon, Trophy, Award, AlertTriangle, CheckCircle } from 'lucide-react';
import { moodApi } from '@/services/api';
import { MoodLog } from '@/types';
import { format } from 'date-fns';

const BADGES = [
  { id: 'first',  label: 'First Step',     icon: <Star size={16} />,   color: '#10b981', desc: 'Logged your first mood',    threshold: 1  },
  { id: '3day',   label: '3-Day Streak',   icon: <Flame size={16} />,  color: '#f97316', desc: '3 consecutive days',         threshold: 3  },
  { id: '7day',   label: 'Week Warrior',   icon: <Zap size={16} />,    color: '#f59e0b', desc: '7 consecutive days',         threshold: 7  },
  { id: '14day',  label: 'Fortnight',      icon: <Moon size={16} />,   color: '#6366f1', desc: '14 consecutive days',        threshold: 14 },
  { id: '30day',  label: 'Monthly Master', icon: <Trophy size={16} />, color: '#8b5cf6', desc: '30 consecutive days',        threshold: 30 },
  { id: '50day',  label: 'Dedicated',      icon: <Award size={16} />,  color: '#06b6d4', desc: '50 consecutive days',        threshold: 50 },
];

const PRIVACY_ITEMS = [
  'All data is stored locally on this server',
  'AI conversations processed locally via Ollama',
  'No data sent to third-party AI servers',
  'You can delete your account at any time',
];

function calcStreak(moods: MoodLog[]) {
  if (!moods.length) return 0;
  const dates = new Set(moods.map(m => format(new Date(m.created_at), 'yyyy-MM-dd')));
  let streak = 0;
  const d = new Date(); d.setHours(0, 0, 0, 0);
  while (dates.has(format(d, 'yyyy-MM-dd'))) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [moods, setMoods] = useState<MoodLog[]>([]);

  useEffect(() => {
    if (user) moodApi.list(user.id).then(r => setMoods(r.data)).catch(() => {});
  }, []);

  const streak = calcStreak(moods);
  const handleLogout = () => { logout(); router.push('/'); };

  return (
    <div className="space-y-5 pb-8">
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Profile</h2>

      {/* User Card */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-500 rounded-xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name}</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>
          {streak > 0 && (
            <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg flex-shrink-0"
              style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)' }}>
              <Flame size={13} className="text-orange-400" />
              <span className="text-sm font-semibold text-orange-400">{streak}d</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Sessions',  value: user?.stats?.sessions ?? 0,  icon: <Brain size={14} className="text-indigo-400" /> },
            { label: 'Mood Logs', value: user?.stats?.mood_logs ?? 0, icon: <Activity size={14} className="text-pink-400" /> },
            { label: 'Journals',  value: user?.stats?.journals ?? 0,  icon: <BookOpen size={14} className="text-emerald-400" /> },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Avg Mood */}
      {user?.stats?.avg_mood ? (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-emerald-400" />
              <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Average Mood (7 days)</span>
            </div>
            <span className="text-xl font-bold text-emerald-400">{user.stats.avg_mood}/10</span>
          </div>
          <div className="w-full rounded-full h-1.5" style={{ background: 'var(--progress-track)' }}>
            <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${user.stats.avg_mood * 10}%` }} />
          </div>
        </div>
      ) : null}

      {/* Streak Badges */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Award size={15} className="text-indigo-400" />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Achievements</h3>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {BADGES.map(b => {
            const earned = streak >= b.threshold || (user?.stats?.mood_logs ?? 0) >= b.threshold;
            return (
              <div key={b.id}
                className={`rounded-lg p-3 text-center transition-all ${earned ? '' : 'opacity-35'}`}
                style={earned
                  ? { background: b.color + '12', border: `1px solid ${b.color}35` }
                  : { background: 'var(--subtle-bg)', border: '1px solid var(--border)' }}>
                <div className="flex justify-center mb-1.5" style={{ color: earned ? b.color : 'var(--text-muted)' }}>
                  {b.icon}
                </div>
                <div className="text-xs font-semibold" style={{ color: earned ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {b.label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{b.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => router.push('/analytics')} className="card flex items-center gap-3 glass-hover text-left" style={{ padding: '1rem' }}>
          <BarChart2 size={18} className="text-indigo-400 flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Analytics</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>View insights</div>
          </div>
        </button>
        <button onClick={() => router.push('/report')} className="card flex items-center gap-3 glass-hover text-left" style={{ padding: '1rem' }}>
          <Brain size={18} className="text-purple-400 flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Weekly Report</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>AI summary</div>
          </div>
        </button>
      </div>

      {/* Privacy */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={15} className="text-emerald-400" />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Privacy & Security</h3>
        </div>
        <div className="space-y-2.5">
          {PRIVACY_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Heart size={15} className="text-red-400" />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>About MindSpace</h3>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          MindSpace is an AI-powered mental wellness platform using local AI (Ollama) for complete privacy.
          It provides therapy-style conversations, mood tracking, journaling, and mental health assessments.
        </p>
        <div className="mt-3 flex items-start gap-2 p-3 rounded-lg"
          style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <AlertTriangle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            MindSpace is a wellness tool and not a substitute for professional mental health care.
            If you are experiencing a mental health crisis, please contact a licensed professional.
          </p>
        </div>
      </div>

      {/* Sign Out */}
      <button onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-medium text-sm transition-all"
        style={{ color: '#f87171', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}>
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
}
