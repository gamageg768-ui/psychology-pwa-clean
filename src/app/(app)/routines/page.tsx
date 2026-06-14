'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Play, Trash2, Check, ChevronRight, X, Clock } from 'lucide-react';
import { routinesApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Routine } from '@/types';
import { useRouter } from 'next/navigation';

const ROUTINE_TYPES = [
  { value: 'morning', label: 'Morning', emoji: '☀️', color: '#f59e0b' },
  { value: 'evening', label: 'Evening', emoji: '🌙', color: '#6366f1' },
  { value: 'stress', label: 'Stress Reset', emoji: '🌊', color: '#06b6d4' },
  { value: 'focus', label: 'Focus Prep', emoji: '🎯', color: '#10b981' },
];

const PRESET_ACTIVITIES = [
  '🫁 Box Breathing (4 min)', '📝 Gratitude Journal (5 min)', '✨ Daily Affirmation (2 min)',
  '🧘 Quick Meditation (5 min)', '💭 Mood Check-In (2 min)', '🏃 Stretch / Movement (5 min)',
  '📖 Read Something Positive (5 min)', '🌿 Mindful Tea / Coffee (5 min)',
  '💤 Wind-Down Breathing (5 min)', '📔 Journal Entry (10 min)', '😴 Sleep Scan (5 min)',
];

interface Step { activity: string; duration: number; }

export default function RoutinesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState<Routine | null>(null);
  const [runStep, setRunStep] = useState(0);
  const [stepDone, setStepDone] = useState<boolean[]>([]);
  const [form, setForm] = useState({ name: '', type: 'morning', emoji: '☀️', steps: [] as Step[] });
  const [newActivity, setNewActivity] = useState('');
  const [newDuration, setNewDuration] = useState(5);

  useEffect(() => { load(); }, []);

  const load = async () => {
    if (!user) return;
    const res = await routinesApi.list(user.id);
    setRoutines(res.data);
  };

  const addStep = (activity?: string) => {
    const act = activity ?? newActivity.trim();
    if (!act) return;
    setForm(f => ({ ...f, steps: [...f.steps, { activity: act, duration: newDuration }] }));
    setNewActivity('');
  };

  const removeStep = (i: number) => setForm(f => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));

  const save = async () => {
    if (!user || !form.name.trim() || form.steps.length === 0) return;
    setSaving(true);
    await routinesApi.create(user.id, form.name, form.type, form.emoji, form.steps);
    setForm({ name: '', type: 'morning', emoji: '☀️', steps: [] });
    setShowForm(false);
    load();
    setSaving(false);
  };

  const deleteRoutine = async (id: number) => {
    if (!user) return;
    await routinesApi.delete(user.id, id);
    load();
  };

  const startRun = (routine: Routine) => {
    setRunning(routine);
    setRunStep(0);
    setStepDone(new Array(routine.steps.length).fill(false));
  };

  const completeStep = (i: number) => {
    const next = [...stepDone];
    next[i] = true;
    setStepDone(next);
    if (i + 1 < (running?.steps.length ?? 0)) setRunStep(i + 1);
  };

  if (running) {
    const allDone = stepDone.every(Boolean);
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => setRunning(null)} className="p-2 rounded-xl"
            style={{ background: 'var(--subtle-bg)', border: '1px solid var(--border)' }}>
            <X size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{running.emoji} {running.name}</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{stepDone.filter(Boolean).length} / {running.steps.length} steps done</p>
          </div>
        </div>

        {allDone ? (
          <div className="card text-center py-10 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
              <Check size={32} className="text-emerald-400" />
            </div>
            <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Routine Complete! 🎉</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>You've completed your {running.name} routine. Great work!</p>
            <button onClick={() => setRunning(null)} className="btn-primary mx-auto mt-2">Back to Routines</button>
          </div>
        ) : (
          <div className="space-y-3">
            {running.steps.map((step, i) => {
              const isActive = i === runStep;
              const isDone = stepDone[i];
              return (
                <div key={step.id} className="card transition-all"
                  style={isActive ? { borderLeft: '3px solid #6366f1', background: 'rgba(99,102,241,0.05)' } : {}}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-indigo-500 text-white' : ''
                    }`}
                      style={!isDone && !isActive ? { background: 'var(--subtle-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' } : {}}>
                      {isDone ? <Check size={14} /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{ color: isDone ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>
                        {step.activity}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={10} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{step.duration} min</span>
                      </div>
                    </div>
                    {isActive && !isDone && (
                      <button onClick={() => completeStep(i)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                        <Check size={12} /> Done
                      </button>
                    )}
                    {isDone && <Check size={16} className="text-emerald-400 flex-shrink-0" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Daily Routines</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Build wellness habits as guided sequences</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm px-3 py-2">
          <Plus size={15} /> New
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Create a Routine</h3>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Routine name (e.g. Morning Reset)" className="input-field" />
          <div className="grid grid-cols-2 gap-2">
            {ROUTINE_TYPES.map(rt => (
              <button key={rt.value} onClick={() => setForm(f => ({ ...f, type: rt.value, emoji: rt.emoji }))}
                className="p-2.5 rounded-xl text-sm font-medium text-left transition-all"
                style={{
                  background: form.type === rt.value ? `${rt.color}20` : 'var(--subtle-bg)',
                  border: `1px solid ${form.type === rt.value ? rt.color : 'var(--border)'}`,
                  color: form.type === rt.value ? rt.color : 'var(--text-secondary)',
                }}>
                {rt.emoji} {rt.label}
              </button>
            ))}
          </div>

          <div>
            <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Quick Add Activities</div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {PRESET_ACTIVITIES.map(act => (
                <button key={act} onClick={() => addStep(act)}
                  className="text-xs px-2.5 py-1 rounded-full transition-all"
                  style={{ background: 'var(--subtle-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  {act}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newActivity} onChange={e => setNewActivity(e.target.value)}
                placeholder="Custom activity..." className="input-field flex-1 text-sm" />
              <input type="number" min={1} max={60} value={newDuration}
                onChange={e => setNewDuration(Number(e.target.value))}
                className="input-field w-20 text-sm" placeholder="min" />
              <button onClick={() => addStep()} className="btn-primary px-3 text-sm">Add</button>
            </div>
          </div>

          {form.steps.length > 0 && (
            <div className="space-y-1.5">
              {form.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg"
                  style={{ background: 'var(--subtle-bg)', border: '1px solid var(--border)' }}>
                  <span className="text-xs font-medium w-5 text-center" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                  <span className="text-xs flex-1" style={{ color: 'var(--text-secondary)' }}>{step.activity}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{step.duration}m</span>
                  <button onClick={() => removeStep(i)}><X size={12} style={{ color: 'var(--text-muted)' }} /></button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl text-sm font-medium"
              style={{ background: 'var(--subtle-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Cancel
            </button>
            <button onClick={save} disabled={saving || !form.name.trim() || form.steps.length === 0}
              className="flex-1 btn-primary text-sm">
              {saving ? 'Saving...' : 'Save Routine'}
            </button>
          </div>
        </div>
      )}

      {routines.length === 0 && !showForm && (
        <div className="card text-center py-10">
          <div className="text-4xl mb-3">☀️</div>
          <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No routines yet</div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Build a morning, evening, or stress-reset routine.</p>
        </div>
      )}

      <div className="space-y-3">
        {routines.map(routine => {
          const typeConfig = ROUTINE_TYPES.find(t => t.value === routine.type) ?? ROUTINE_TYPES[0];
          const totalMin = routine.steps.reduce((s, st) => s + st.duration, 0);
          return (
            <div key={routine.id} className="card">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${typeConfig.color}20` }}>
                  {routine.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{routine.name}</span>
                    <button onClick={() => deleteRoutine(routine.id)} className="opacity-40 hover:opacity-100 transition-opacity">
                      <Trash2 size={13} style={{ color: '#ef4444' }} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${typeConfig.color}15`, color: typeConfig.color }}>
                      {typeConfig.label}
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <Clock size={10} /> {totalMin} min
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{routine.steps.length} steps</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {routine.steps.slice(0, 3).map((s, i) => (
                      <span key={i} className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--subtle-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        {s.activity.length > 20 ? s.activity.slice(0, 20) + '…' : s.activity}
                      </span>
                    ))}
                    {routine.steps.length > 3 && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ color: 'var(--text-muted)' }}>
                        +{routine.steps.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => startRun(routine)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: `${typeConfig.color}15`, color: typeConfig.color, border: `1px solid ${typeConfig.color}30` }}>
                <Play size={14} /> Start Routine
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
