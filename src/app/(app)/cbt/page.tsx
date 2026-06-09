'use client';

import { useState, useEffect } from 'react';
import { Brain, ChevronLeft, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

interface ThoughtRecord {
  id: number; situation: string; automatic_thought: string; emotion: string;
  evidence_for: string; evidence_against: string; balanced_thought: string;
  ai_reframe: string | null; created_at: string;
}

const STEPS = [
  { key: 'situation', label: 'Situation', prompt: 'Briefly describe the situation that triggered this thought.', placeholder: 'What happened? Where were you? Who was involved?' },
  { key: 'automatic_thought', label: 'Automatic Thought', prompt: 'What thought immediately went through your mind?', placeholder: 'e.g. "I always mess things up" or "Nobody likes me"' },
  { key: 'emotion', label: 'Emotion', prompt: 'What emotion(s) did you feel, and how intense (1-10)?', placeholder: 'e.g. Anxious (8/10), Sad (6/10)' },
  { key: 'evidence_for', label: 'Evidence For', prompt: 'What evidence supports this thought?', placeholder: 'List facts (not feelings) that seem to support the thought' },
  { key: 'evidence_against', label: 'Evidence Against', prompt: 'What evidence challenges or contradicts this thought?', placeholder: 'List facts that suggest the thought might not be 100% true' },
  { key: 'balanced_thought', label: 'Balanced Thought', prompt: 'Based on all evidence, write a more balanced perspective.', placeholder: 'e.g. "I make mistakes sometimes, but I also succeed in many things"' },
];

export default function CBTPage() {
  const { user } = useAuth();
  const [view, setView] = useState<'list' | 'new' | 'result'>('list');
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ai_reframe: string } | null>(null);
  const [records, setRecords] = useState<ThoughtRecord[]>([]);
  const [selected, setSelected] = useState<ThoughtRecord | null>(null);

  useEffect(() => {
    if (user) axios.get(`/api/cbt/${user.id}`).then(r => setRecords(r.data)).catch(() => {});
  }, []);

  const currentKey = STEPS[step].key;
  const canNext = (form[currentKey] || '').trim().length > 3;

  const next = async () => {
    if (step < STEPS.length - 1) { setStep(step + 1); return; }
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/cbt', { user_id: user.id, ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v])), automatic_thought: form.automatic_thought, evidence_for: form.evidence_for, evidence_against: form.evidence_against, balanced_thought: form.balanced_thought });
      setResult(res.data); setView('result');
      axios.get(`/api/cbt/${user.id}`).then(r => setRecords(r.data)).catch(() => {});
    } catch { setResult({ ai_reframe: 'Could not generate reframe.' }); setView('result'); }
    setLoading(false);
  };

  const startNew = () => { setForm({}); setStep(0); setResult(null); setView('new'); };

  if (view === 'result' && result) return (
    <div className="space-y-4 pb-8">
      <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm"><ChevronLeft size={16} />Back</button>
      <div className="card text-center space-y-2">
        <Brain size={32} className="text-primary-400 mx-auto" />
        <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Thought Record Complete</h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>You've challenged and reframed this thought.</p>
      </div>
      <div className="glass rounded-2xl p-5 border border-primary-500/30">
        <div className="flex items-center gap-2 mb-3"><Sparkles size={16} className="text-primary-400" /><span className="font-semibold text-primary-300">Dr. Aria's Reframe</span></div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.ai_reframe}</p>
      </div>
      <div className="card space-y-3">
        <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Your Record Summary</h4>
        {STEPS.map(s => form[s.key] && (
          <div key={s.key}>
            <div className="text-xs font-medium text-primary-400 mb-0.5">{s.label}</div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{form[s.key]}</p>
          </div>
        ))}
      </div>
      <button onClick={startNew} className="btn-primary w-full">Start Another Record</button>
    </div>
  );

  if (view === 'new') return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => setView('list')} className="text-slate-400 hover:text-white"><ChevronLeft size={20} /></button>
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>Step {step + 1} of {STEPS.length}</span><span>{STEPS[step].label}</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: 'var(--progress-track)' }}>
            <div className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: 'var(--text-muted)' }}>Dr. Aria is preparing your reframe...</p>
        </div>
      ) : (
        <div className="card space-y-4">
          <div className="text-xs uppercase tracking-wider font-medium text-primary-400">{STEPS[step].label}</div>
          <p className="font-medium text-lg leading-relaxed" style={{ color: 'var(--text-primary)' }}>{STEPS[step].prompt}</p>
          <textarea
            value={form[currentKey] || ''}
            onChange={e => setForm({ ...form, [currentKey]: e.target.value })}
            placeholder={STEPS[step].placeholder}
            className="input-field resize-none" rows={4} autoFocus />
          <div className="flex gap-3">
            {step > 0 && <button onClick={() => setStep(step - 1)} className="btn-ghost flex-1">← Back</button>}
            <button onClick={next} disabled={!canNext} className="btn-primary flex-1">
              {step < STEPS.length - 1 ? 'Next →' : 'Complete & Get Reframe'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>CBT Thought Record</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Identify and reframe negative thoughts</p>
        </div>
        <button onClick={startNew} className="btn-primary text-sm px-3 py-2">+ New Record</button>
      </div>

      <div className="card border border-primary-500/20 bg-primary-500/5">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <strong className="text-primary-400">Cognitive Behavioral Therapy (CBT)</strong> helps you challenge unhelpful thoughts.
          A thought record guides you through identifying, examining, and reframing distorted thinking patterns.
        </p>
      </div>

      {records.length === 0 ? (
        <div className="card text-center py-10">
          <Brain size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No thought records yet</p>
          <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>Try a CBT thought record next time a negative thought arises.</p>
          <button onClick={startNew} className="btn-primary inline-flex">Start First Record</button>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map(r => (
            <button key={r.id} onClick={() => { setSelected(r); setView('result'); setResult({ ai_reframe: r.ai_reframe || '' }); setForm({ situation: r.situation, automatic_thought: r.automatic_thought, emotion: r.emotion, evidence_for: r.evidence_for, evidence_against: r.evidence_against, balanced_thought: r.balanced_thought }); }}
              className="w-full card text-left glass-hover">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-primary-400">{format(new Date(r.created_at), 'MMM d, yyyy')}</span>
              </div>
              <p className="text-sm font-medium line-clamp-2" style={{ color: 'var(--text-primary)' }}>{r.automatic_thought}</p>
              <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>Situation: {r.situation}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
