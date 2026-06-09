'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, TrendingUp, BookOpen, Activity, ChevronRight, Sparkles, Moon, Sun,
         Flame, RefreshCw, Heart, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { userApi, moodApi, toolsApi } from '@/services/api';
import { MoodLog } from '@/types';
import { format } from 'date-fns';

const AFFIRMATIONS = [
  "You are worthy of love, rest, and peace.", "Every small step forward is progress.",
  "Your feelings are valid, and they will pass.", "You have survived 100% of your difficult days.",
  "Healing is not linear — and that's okay.", "You don't have to earn rest.",
  "You are doing the best you can with what you have.", "It's okay to ask for help.",
  "Your mental health matters just as much as your physical health.", "You are allowed to take up space.",
  "Progress, not perfection.", "You are stronger than you think.",
  "Every day is a new chance to start again.", "You deserve kindness — from yourself too.",
  "Being gentle with yourself is a strength, not a weakness.", "Your story isn't over.",
  "You matter to the people around you.", "Brave doesn't mean fearless.",
  "One breath at a time is enough.", "Your worth is not measured by your productivity.",
  "Rest is productive.", "You are not alone in how you feel.",
  "Emotions are information, not commands.", "You are growing, even when you can't see it.",
  "Small acts of self-care are acts of self-respect.", "You are more than your worst day.",
  "It's okay to feel multiple things at once.", "Your needs are important.",
  "This moment will pass.", "You are enough, exactly as you are.",
];

const QUOTES = [
  "Every day is a new opportunity to grow and heal.",
  "Your mental health is a priority. Your happiness is essential.",
  "Recovery is not linear. Every step forward counts.",
  "You are worthy of rest, joy, and peace.",
  "The bravest thing you can do is ask for help.",
];

const MOOD_COLORS = ['', '#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#10b981','#06b6d4','#6366f1','#8b5cf6'];
const MOOD_LABELS = ['', 'Very Low', 'Low', 'Poor', 'Below Avg', 'Average', 'Fair', 'Good', 'Great', 'Excellent', 'Amazing'];

function calcStreak(moods: MoodLog[]) {
  if (!moods.length) return 0;
  const dates = new Set(moods.map(m => format(new Date(m.created_at), 'yyyy-MM-dd')));
  let streak = 0;
  const d = new Date(); d.setHours(0, 0, 0, 0);
  while (dates.has(format(d, 'yyyy-MM-dd'))) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}

export default function DashboardPage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [recentMoods, setRecentMoods] = useState<MoodLog[]>([]);
  const [quote, setQuote] = useState('');
  const [affirmation, setAffirmation] = useState('');
  const [affLoading, setAffLoading] = useState(false);
  const [savedAff, setSavedAff] = useState(false);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setAffirmation(AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length]);
    if (user) {
      userApi.get(user.id).then(res => setUser({ ...user, stats: res.data.stats })).catch(() => {});
      moodApi.list(user.id).then(res => setRecentMoods(res.data.slice(0, 30))).catch(() => {});
    }
  }, []);

  const refreshAffirmation = async () => {
    setAffLoading(true);
    try {
      const res = await toolsApi.affirmations('hopeful');
      const lines = res.data.affirmations.split('\n').filter((l: string) => l.trim());
      if (lines[0]) setAffirmation(lines[0].replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, ''));
    } catch { /* silent */ }
    setAffLoading(false);
  };

  const saveAffirmation = () => {
    const favs: string[] = JSON.parse(localStorage.getItem('favAffirmations') || '[]');
    if (!favs.includes(affirmation) && favs.length < 5)
      localStorage.setItem('favAffirmations', JSON.stringify([...favs, affirmation]));
    setSavedAff(true);
    setTimeout(() => setSavedAff(false), 2000);
  };

  const moodChartData = [...recentMoods].reverse().slice(-7).map(m => ({
    date: format(new Date(m.created_at), 'MM/dd'), mood: m.mood,
  }));

  const streak = calcStreak(recentMoods);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Good morning', icon: <Sun size={15} className="text-amber-400" /> };
    if (h < 17) return { text: 'Good afternoon', icon: <Sun size={15} className="text-orange-400" /> };
    return { text: 'Good evening', icon: <Moon size={15} className="text-indigo-400" /> };
  };
  const greeting = getGreeting();

  const quickActions = [
    { label: 'AI Therapy', sub: 'Talk to Dr. Aria', icon: <Brain size={18} />, color: '#6366f1', href: '/therapy' },
    { label: 'Log Mood', sub: 'Track how you feel', icon: <Activity size={18} />, color: '#ec4899', href: '/mood' },
    { label: 'Journal', sub: 'Write your thoughts', icon: <BookOpen size={18} />, color: '#10b981', href: '/journal' },
    { label: 'Assessment', sub: 'Mental health check', icon: <TrendingUp size={18} />, color: '#f59e0b', href: '/assessment' },
  ];

  const chartTickStyle = { fill: 'var(--text-muted)', fontSize: 11 };

  return (
    <div className="space-y-5 pb-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            {greeting.icon}
            <span>{greeting.text}</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm mt-0.5 italic" style={{ color: 'var(--text-muted)' }}>"{quote}"</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg flex-shrink-0 ml-3"
            style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)' }}>
            <Flame size={13} className="text-orange-400" />
            <span className="text-sm font-semibold text-orange-400">{streak}d streak</span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sessions', value: user?.stats?.sessions ?? '—' },
          { label: 'Mood Logs', value: user?.stats?.mood_logs ?? '—' },
          { label: 'Avg Mood', value: user?.stats?.avg_mood ? `${user.stats.avg_mood}/10` : '—' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Daily Affirmation */}
      {affirmation && (
        <div className="card" style={{ borderLeft: '3px solid #6366f1', borderRadius: '0.75rem' }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={13} className="text-indigo-400" />
            <span className="section-label">Daily Affirmation</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>"{affirmation}"</p>
          <div className="flex items-center gap-2 mt-3">
            <button onClick={refreshAffirmation} disabled={affLoading}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-all"
              style={{ background: 'var(--subtle-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              {affLoading
                ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                : <RefreshCw size={11} />}
              Refresh
            </button>
            <button onClick={saveAffirmation}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-all"
              style={{
                background: savedAff ? 'rgba(239,68,68,0.08)' : 'var(--subtle-bg)',
                color: savedAff ? '#f87171' : 'var(--text-muted)',
                border: `1px solid ${savedAff ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
              }}>
              <Heart size={11} />
              {savedAff ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <p className="section-label mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((a, i) => (
            <button key={i} onClick={() => router.push(a.href)}
              className="card text-left glass-hover group flex items-center gap-3 md:flex-col md:items-start"
              style={{ padding: '1rem' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-white transition-transform group-hover:scale-105"
                style={{ background: a.color + '22', color: a.color, border: `1px solid ${a.color}22` }}>
                {a.icon}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{a.label}</div>
                <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{a.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Row */}
      <div className="md:grid md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0">
        {moodChartData.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-indigo-400" />
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Mood Trend</h3>
              <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>Last 7 entries</span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={moodChartData}>
                <XAxis dataKey="date" tick={chartTickStyle} axisLine={false} tickLine={false} />
                <YAxis domain={[1, 10]} tick={chartTickStyle} axisLine={false} tickLine={false} width={22} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12 }}
                />
                <Line type="monotone" dataKey="mood" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {recentMoods.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={15} className="text-indigo-400" />
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Check-ins</h3>
            </div>
            <div className="space-y-2">
              {recentMoods.slice(0, 3).map(log => (
                <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'var(--subtle-bg)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: MOOD_COLORS[log.mood] }}>
                    {log.mood}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{MOOD_LABELS[log.mood]}</span>
                      <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{format(new Date(log.created_at), 'MMM d')}</span>
                    </div>
                    {log.ai_insight && (
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{log.ai_insight}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => router.push('/mood')}
              className="flex items-center gap-1 text-sm mt-3" style={{ color: '#818cf8' }}>
              View all <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Crisis Banner */}
      <div className="card flex items-start gap-3" style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
        <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>In crisis? You are not alone.</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Suicide & Crisis Lifeline: <strong style={{ color: 'var(--text-primary)' }}>988</strong>
            &nbsp;&nbsp;·&nbsp;&nbsp;
            Crisis Text: Text HOME to <strong style={{ color: 'var(--text-primary)' }}>741741</strong>
          </p>
        </div>
      </div>

    </div>
  );
}
