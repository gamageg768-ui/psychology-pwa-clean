'use client';

import { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle, Circle, Sparkles, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { goalsApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Goal } from '@/types';

const CATEGORIES = [
  { value: 'mental', label: 'Mental Health', emoji: '🧠', color: '#6366f1' },
  { value: 'sleep', label: 'Sleep', emoji: '😴', color: '#06b6d4' },
  { value: 'exercise', label: 'Exercise', emoji: '💪', color: '#10b981' },
  { value: 'social', label: 'Social', emoji: '🤝', color: '#f59e0b' },
  { value: 'mindfulness', label: 'Mindfulness', emoji: '🧘', color: '#8b5cf6' },
  { value: 'general', label: 'General', emoji: '⭐', color: '#84cc16' },
];

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'mental', target_date: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    if (!user) return;
    const res = await goalsApi.list(user.id);
    setGoals(res.data);
  };

  const createGoal = async () => {
    if (!user || !form.title.trim()) return;
    setCreating(true);
    try {
      await goalsApi.create(user.id, form.title, form.description, form.category, form.target_date);
      setForm({ title: '', description: '', category: 'mental', target_date: '' });
      setShowForm(false);
      loadGoals();
    } catch { /* ignore */ }
    setCreating(false);
  };

  const completeMilestone = async (goalId: number, milestoneId: number) => {
    setLoading(true);
    await goalsApi.completeMilestone(goalId, milestoneId);
    loadGoals();
    setLoading(false);
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const getCategoryConfig = (cat: string) =>
    CATEGORIES.find(c => c.value === cat) ?? CATEGORIES[CATEGORIES.length - 1];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Wellness Goals</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>AI-powered milestones to keep you on track</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm px-3 py-2">
          <Plus size={15} /> New Goal
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Create a New Goal</h3>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Meditate 10 minutes daily for 30 days" className="input-field" />
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Why does this goal matter to you? (optional)" rows={2} className="input-field resize-none" />
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                className="p-2 rounded-xl text-xs font-medium text-center transition-all"
                style={{
                  background: form.category === cat.value ? `${cat.color}25` : 'var(--subtle-bg)',
                  border: `1px solid ${form.category === cat.value ? cat.color : 'var(--border)'}`,
                  color: form.category === cat.value ? cat.color : 'var(--text-secondary)',
                }}>
                <div className="text-base mb-0.5">{cat.emoji}</div>
                {cat.label}
              </button>
            ))}
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Target date (optional)</div>
            <input type="date" value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
              className="input-field" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl text-sm font-medium"
              style={{ background: 'var(--subtle-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Cancel
            </button>
            <button onClick={createGoal} disabled={creating || !form.title.trim()}
              className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm">
              {creating
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                : <><Sparkles size={14} /> Create with AI Milestones</>}
            </button>
          </div>
        </div>
      )}

      {activeGoals.length === 0 && !showForm && (
        <div className="card text-center py-10">
          <Target size={36} className="mx-auto mb-3 text-indigo-400" />
          <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No active goals yet</div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Set your first wellness goal and AI will create milestones for you.</p>
        </div>
      )}

      {activeGoals.length > 0 && (
        <div className="space-y-3">
          {activeGoals.map(goal => {
            const cat = getCategoryConfig(goal.category);
            const done = goal.milestones.filter(m => m.completed).length;
            const total = goal.milestones.length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            const isExpanded = expanded === goal.id;

            return (
              <div key={goal.id} className="card">
                <button className="w-full text-left" onClick={() => setExpanded(isExpanded ? null : goal.id)}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: `${cat.color}20` }}>
                      {cat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{goal.title}</span>
                        {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--progress-track)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cat.color }} />
                        </div>
                        <span className="text-xs font-medium flex-shrink-0" style={{ color: cat.color }}>{done}/{total}</span>
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 space-y-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                    {goal.milestones.map(m => (
                      <div key={m.id} className="flex items-center gap-3">
                        <button onClick={() => !m.completed && completeMilestone(goal.id, m.id)} disabled={m.completed || loading}>
                          {m.completed
                            ? <CheckCircle size={18} style={{ color: cat.color }} />
                            : <Circle size={18} style={{ color: 'var(--text-muted)' }} />}
                        </button>
                        <span className="text-sm" style={{
                          color: m.completed ? 'var(--text-muted)' : 'var(--text-secondary)',
                          textDecoration: m.completed ? 'line-through' : 'none',
                        }}>{m.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {completedGoals.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={15} style={{ color: '#f59e0b' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Completed Goals</span>
          </div>
          <div className="space-y-2">
            {completedGoals.map(goal => {
              const cat = getCategoryConfig(goal.category);
              return (
                <div key={goal.id} className="card flex items-center gap-3" style={{ padding: '0.75rem 1rem' }}>
                  <span>{cat.emoji}</span>
                  <span className="text-sm flex-1" style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>{goal.title}</span>
                  <Trophy size={14} style={{ color: '#f59e0b' }} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
