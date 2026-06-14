'use client';

import { useState, useEffect } from 'react';
import { Zap, Brain, Wind, Sparkles, TrendingUp } from 'lucide-react';
import { pulseApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { PulseLog } from '@/types';
import { format } from 'date-fns';

const METRIC_CONFIG = [
  { key: 'focus', label: 'Focus', icon: <Brain size={16} />, color: '#6366f1', desc: 'Mental clarity & concentration' },
  { key: 'energy', label: 'Energy', icon: <Zap size={16} />, color: '#f59e0b', desc: 'Physical & mental drive' },
  { key: 'stress', label: 'Stress', icon: <Wind size={16} />, color: '#ef4444', desc: 'Tension & pressure level' },
];

export default function PulsePage() {
  const { user } = useAuth();
  const [focus, setFocus] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState(5);
  const [note, setNote] = useState('');
  const [logs, setLogs] = useState<PulseLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    if (!user) return;
    const res = await pulseApi.list(user.id);
    setLogs(res.data);
  };

  const submit = async () => {
    if (!user) return;
    setLoading(true); setSubmitted(false);
    try {
      const res = await pulseApi.log(user.id, focus, energy, stress, note);
      setInsight(res.data.ai_insight);
      setSubmitted(true);
      setNote('');
      loadLogs();
    } catch {
      setInsight('Could not get AI insight.');
      setSubmitted(true);
    }
    setLoading(false);
  };

  const values: Record<string, number> = { focus, energy, stress };
  const setters: Record<string, (v: number) => void> = {
    focus: setFocus, energy: setEnergy, stress: setStress,
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Daily Pulse</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Track your focus, energy & stress levels</p>
      </div>

      <div className="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0">
        <div className="space-y-4">
          <div className="card space-y-5">
            {METRIC_CONFIG.map(({ key, label, icon, color, desc }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2" style={{ color }}>
                    {icon}
                    <span className="text-sm font-semibold">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</span>
                    <span className="text-lg font-bold w-6 text-right" style={{ color }}>{values[key]}</span>
                  </div>
                </div>
                <input type="range" min={1} max={10} value={values[key]}
                  onChange={e => setters[key](Number(e.target.value))}
                  className="w-full" style={{ accentColor: color }} />
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  <span>Low</span><span>High</span>
                </div>
              </div>
            ))}

            <div>
              <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Note <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
              </div>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="What's affecting your cognitive state today..." rows={2}
                className="input-field resize-none" />
            </div>

            <button onClick={submit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                : <><Sparkles size={15} /> Log Pulse & Get Insight</>}
            </button>
          </div>

          {submitted && insight && (
            <div className="card" style={{ borderLeft: '3px solid #6366f1' }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Cognitive Insight</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{insight}</p>
            </div>
          )}
        </div>

        {logs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={15} className="text-indigo-400" />
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Pulse History</h3>
            </div>
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="card" style={{ padding: '0.875rem' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {format(new Date(log.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {METRIC_CONFIG.map(({ key, label, color }) => (
                      <div key={key} className="text-center p-2 rounded-lg" style={{ background: `${color}15` }}>
                        <div className="text-lg font-bold" style={{ color }}>{(log as unknown as Record<string, number>)[key]}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  {log.ai_insight && (
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{log.ai_insight}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
