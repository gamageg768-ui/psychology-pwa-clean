'use client';

import { useState, useEffect } from 'react';
import { Activity, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { symptomsApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { SymptomLog } from '@/types';
import { format } from 'date-fns';

const SYMPTOM_METRICS = [
  { key: 'energy', label: 'Energy', emoji: '⚡', color: '#f59e0b', low: 'Drained', high: 'Energised' },
  { key: 'appetite', label: 'Appetite', emoji: '🍽️', color: '#10b981', low: 'No appetite', high: 'Normal' },
  { key: 'focus', label: 'Focus', emoji: '🎯', color: '#6366f1', low: 'Scattered', high: 'Sharp' },
  { key: 'social_withdraw', label: 'Social Withdrawal', emoji: '🤝', color: '#06b6d4', low: 'Very social', high: 'Withdrawn' },
];

interface Correlation { label: string; value: string; color: string; }

export default function SymptomsPage() {
  const { user } = useAuth();
  const [values, setValues] = useState<Record<string, number>>({ energy: 5, appetite: 5, focus: 5, social_withdraw: 5 });
  const [physical, setPhysical] = useState('');
  const [note, setNote] = useState('');
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [insight, setInsight] = useState('');
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  const [corrInsight, setCorrInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loadingCorr, setLoadingCorr] = useState(false);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    if (!user) return;
    const res = await symptomsApi.list(user.id);
    setLogs(res.data);
  };

  const submit = async () => {
    if (!user) return;
    setLoading(true); setSubmitted(false);
    try {
      const res = await symptomsApi.log(user.id, { ...values, physical_symptoms: physical, note });
      setInsight(res.data.ai_insight);
      setSubmitted(true);
      setPhysical(''); setNote('');
      loadLogs();
    } catch {
      setInsight('Could not get AI insight.');
      setSubmitted(true);
    }
    setLoading(false);
  };

  const loadCorrelations = async () => {
    if (!user) return;
    setLoadingCorr(true);
    try {
      const res = await symptomsApi.correlations(user.id);
      setCorrInsight(res.data.insight);
      setCorrelations(res.data.correlations ?? []);
    } catch { /* ignore */ }
    setLoadingCorr(false);
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Symptom Tracker</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Daily check-in to discover patterns in your wellbeing</p>
      </div>

      <div className="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0">
        <div className="space-y-4">
          <div className="card space-y-5">
            {SYMPTOM_METRICS.map(({ key, label, emoji, color, low, high }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{emoji}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  </div>
                  <span className="text-base font-bold" style={{ color }}>{values[key]}</span>
                </div>
                <input type="range" min={1} max={10} value={values[key]}
                  onChange={e => setValues(v => ({ ...v, [key]: Number(e.target.value) }))}
                  className="w-full" style={{ accentColor: color }} />
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  <span>{low}</span><span>{high}</span>
                </div>
              </div>
            ))}

            <div>
              <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Physical Symptoms</div>
              <input value={physical} onChange={e => setPhysical(e.target.value)}
                placeholder="e.g. headache, fatigue, muscle tension..." className="input-field" />
            </div>

            <div>
              <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Note <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
              </div>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="Anything else affecting you today..." rows={2} className="input-field resize-none" />
            </div>

            <button onClick={submit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                : <><Sparkles size={15} /> Log Symptoms & Get Insight</>}
            </button>
          </div>

          {submitted && insight && (
            <div className="card" style={{ borderLeft: '3px solid #6366f1' }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Pattern Insight</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{insight}</p>
            </div>
          )}

          {logs.length >= 3 && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-indigo-400" />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Correlation Analysis</span>
                </div>
                <button onClick={loadCorrelations} disabled={loadingCorr}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                  style={{ background: 'var(--subtle-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  <RefreshCw size={11} className={loadingCorr ? 'animate-spin' : ''} />
                  {correlations.length ? 'Refresh' : 'Analyze'}
                </button>
              </div>
              {correlations.length > 0 && (
                <div className="space-y-2 mb-3">
                  {correlations.map(c => (
                    <div key={c.label} className="flex items-center gap-3">
                      <span className="text-xs w-24 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{c.label}</span>
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--progress-track)' }}>
                        <div className="h-full rounded-full" style={{ width: `${Number(c.value) * 10}%`, background: c.color }} />
                      </div>
                      <span className="text-xs font-semibold w-8 text-right" style={{ color: c.color }}>{c.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {corrInsight && (
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{corrInsight}</p>
              )}
            </div>
          )}
        </div>

        {logs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity size={15} className="text-indigo-400" />
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>History</h3>
            </div>
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="card" style={{ padding: '0.875rem' }}>
                  <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                    {format(new Date(log.created_at), 'MMM d, h:mm a')}
                  </div>
                  <div className="grid grid-cols-4 gap-1 mb-2">
                    {SYMPTOM_METRICS.map(({ key, label, color, emoji }) => (
                      <div key={key} className="text-center">
                        <div className="text-xs font-bold" style={{ color }}>{(log as unknown as Record<string, number>)[key]}</div>
                        <div className="text-xs">{emoji}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>{label.split(' ')[0]}</div>
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
