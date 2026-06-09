'use client';

import { useState, useEffect } from 'react';
import { CheckSquare, Plus, Flame, X, Check } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface Habit {
  id: number; title: string; emoji: string;
  done_today: boolean; streak: number;
  last7: { date: string; done: boolean }[];
}

const PRESET_ICONS = [
  { label: 'Meditate', value: '🧘' }, { label: 'Exercise', value: '🏃' },
  { label: 'Read', value: '📚' }, { label: 'Hydrate', value: '💧' },
  { label: 'Eat well', value: '🥗' }, { label: 'Sleep', value: '😴' },
  { label: 'Create', value: '🎨' }, { label: 'Tidy', value: '🧹' },
  { label: 'Medicine', value: '💊' }, { label: 'Gratitude', value: '🙏' },
  { label: 'Journal', value: '📝' }, { label: 'Walk', value: '🚶' },
];

export default function HabitsPage() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('✅');

  const load = () => {
    if (user) axios.get(`/api/habits/${user.id}`).then(r => setHabits(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const addHabit = async () => {
    if (!user || !title.trim()) return;
    await axios.post('/api/habits', { user_id: user.id, title: title.trim(), emoji });
    setTitle(''); setEmoji('✅'); setAdding(false);
    load();
  };

  const toggleHabit = async (habitId: number) => {
    await axios.post('/api/habits/log', { habit_id: habitId });
    load();
  };

  const deleteHabit = async (habitId: number) => {
    if (!user) return;
    await axios.delete(`/api/habits/${user.id}`, { data: { habit_id: habitId } });
    load();
  };

  const doneCount = habits.filter(h => h.done_today).length;
  const completion = habits.length ? Math.round((doneCount / habits.length) * 100) : 0;

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Habit Tracker</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Daily wellness habits</p>
        </div>
        <button onClick={() => setAdding(!adding)} className="btn-primary flex items-center gap-1.5 text-sm px-3 py-2">
          <Plus size={15} />{adding ? 'Cancel' : 'New Habit'}
        </button>
      </div>

      {habits.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Today's Progress</span>
            <span className="text-sm font-bold" style={{ color: completion === 100 ? '#10b981' : '#6366f1' }}>
              {doneCount}/{habits.length}
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--progress-track)' }}>
            <div className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${completion}%`, background: completion === 100 ? '#10b981' : '#6366f1' }} />
          </div>
          {completion === 100 && (
            <div className="flex items-center gap-2 mt-2">
              <Check size={14} className="text-emerald-400" />
              <p className="text-sm font-semibold text-emerald-400">All habits completed for today!</p>
            </div>
          )}
        </div>
      )}

      {adding && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>New Habit</h3>
          <div>
            <label className="section-label mb-2 block">Choose icon</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map(p => (
                <button key={p.value} onClick={() => setEmoji(p.value)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-all"
                  style={emoji === p.value
                    ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', color: 'var(--text-primary)' }
                    : { background: 'var(--subtle-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <span>{p.value}</span>
                  <span className="text-xs">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addHabit()}
            placeholder="e.g. Meditate for 5 minutes" className="input-field" />
          <button onClick={addHabit} disabled={!title.trim()} className="btn-primary w-full">Add Habit</button>
        </div>
      )}

      <div className="space-y-3">
        {habits.map(h => (
          <div key={h.id} className="card space-y-3">
            <div className="flex items-center gap-3">
              <button onClick={() => toggleHabit(h.id)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-base transition-all ${h.done_today ? 'bg-indigo-500' : ''}`}
                style={!h.done_today ? { background: 'var(--subtle-bg)', border: '1px solid var(--border)' } : {}}>
                {h.done_today
                  ? <Check size={16} className="text-white" />
                  : <span>{h.emoji}</span>}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm ${h.done_today ? 'line-through' : ''}`}
                  style={{ color: h.done_today ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                  {h.title}
                </div>
                {h.streak > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Flame size={11} className="text-orange-400" />
                    <span className="text-xs text-orange-400">{h.streak}-day streak</span>
                  </div>
                )}
              </div>
              <button onClick={() => deleteHabit(h.id)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                <X size={13} />
              </button>
            </div>
            <div className="flex gap-1">
              {h.last7.map((d, i) => (
                <div key={i} title={d.date}
                  className={`flex-1 h-1.5 rounded-full transition-colors ${d.done ? 'bg-indigo-500' : ''}`}
                  style={!d.done ? { background: 'var(--progress-track)' } : {}} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {habits.length === 0 && !adding && (
        <div className="card text-center py-12">
          <div className="w-12 h-12 mx-auto rounded-full mb-3 flex items-center justify-center"
            style={{ background: 'var(--subtle-bg)' }}>
            <CheckSquare size={22} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No habits yet</p>
          <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>Start building daily wellness habits.</p>
          <button onClick={() => setAdding(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={15} /> Add First Habit
          </button>
        </div>
      )}
    </div>
  );
}
