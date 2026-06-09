'use client';

import { useState, useEffect } from 'react';
import { Moon, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

interface SleepLog { id: number; hours: number; quality: number; bedtime?: string; wake_time?: string; note?: string; ai_tip?: string; created_at: string; }

const QUALITY_LABELS = ['', 'Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'];
const QUALITY_COLORS = ['', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400', 'text-calm-400'];
const STARS = ['', '★', '★★', '★★★', '★★★★', '★★★★★'];

export default function SleepPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [hours, setHours] = useState(7);
  const [quality, setQuality] = useState(3);
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiTip, setAiTip] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) axios.get(`/api/sleep/${user.id}`).then(r => setLogs(r.data)).catch(() => {});
  }, []);

  const handleLog = async () => {
    if (!user) return;
    setLoading(true); setSaved(false);
    try {
      const res = await axios.post('/api/sleep', { user_id: user.id, hours, quality, bedtime: bedtime || null, wake_time: wakeTime || null, note: note || null });
      setAiTip(res.data.ai_tip); setSaved(true);
      const updated = await axios.get(`/api/sleep/${user.id}`);
      setLogs(updated.data);
      setNote(''); setBedtime(''); setWakeTime('');
    } catch { setAiTip('Could not generate tip.'); }
    setLoading(false);
  };

  const last14 = [...logs].reverse().slice(-14).map(l => ({
    date: format(new Date(l.created_at), 'MM/dd'), hours: l.hours, quality: l.quality,
  }));

  const weekLogs = logs.slice(0, 7);
  const avgHours = weekLogs.length ? (weekLogs.reduce((s, l) => s + l.hours, 0) / weekLogs.length).toFixed(1) : null;
  const avgQuality = weekLogs.length ? Math.round(weekLogs.reduce((s, l) => s + l.quality, 0) / weekLogs.length) : null;

  const tooltipStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12 };

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Sleep Tracker</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Track your sleep for better rest</p>
      </div>

      {avgHours && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center">
            <Moon size={20} className="text-blue-400 mx-auto mb-1" />
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{avgHours}h</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg this week</div>
          </div>
          {avgQuality && (
            <div className="card text-center">
              <div className={`text-lg mb-1 ${QUALITY_COLORS[avgQuality]}`}>{STARS[avgQuality]}</div>
              <div className={`text-lg font-bold ${QUALITY_COLORS[avgQuality]}`}>{QUALITY_LABELS[avgQuality]}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg quality</div>
            </div>
          )}
        </div>
      )}

      <div className="card space-y-4">
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Log Last Night's Sleep</h3>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm" style={{ color: 'var(--text-muted)' }}>Hours slept</label>
            <span className="font-bold text-primary-400">{hours}h</span>
          </div>
          <input type="range" min={0} max={12} step={0.5} value={hours} onChange={e => setHours(Number(e.target.value))}
            className="w-full accent-primary-500" />
        </div>
        <div>
          <label className="text-sm mb-2 block" style={{ color: 'var(--text-muted)' }}>Sleep quality</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(q => (
              <button key={q} onClick={() => setQuality(q)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${quality === q ? 'bg-primary-500 text-white' : 'text-slate-400'}`}
                style={quality !== q ? { background: 'var(--subtle-bg)' } : {}}>
                {QUALITY_LABELS[q]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Bedtime (optional)</label>
            <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)} className="input-field text-sm" />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Wake time (optional)</label>
            <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className="input-field text-sm" />
          </div>
        </div>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Any notes about your sleep? (optional)"
          className="input-field text-sm resize-none" rows={2} />
        <button onClick={handleLog} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Logging...</>
            : <><Moon size={16} />Log Sleep</>}
        </button>
      </div>

      {saved && aiTip && (
        <div className="glass rounded-2xl p-5 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-blue-400" />
            <span className="font-semibold text-blue-300">Tonight's Tip</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{aiTip}</p>
        </div>
      )}

      {last14.length > 1 && (
        <div className="card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Sleep (Last 14 nights)</h3>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={last14}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 12]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: '#6366f1' }} name="Hours" />
              <Line type="monotone" dataKey="quality" stroke="#10b981" strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: '#10b981' }} name="Quality (1-5)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {logs.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>History</h3>
          <div className="space-y-2">
            {logs.slice(0, 10).map(l => (
              <div key={l.id} className="glass rounded-xl p-3 flex items-center gap-4">
                <Moon size={18} className="text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{l.hours}h</span>
                    <span className={`text-xs ${QUALITY_COLORS[l.quality]}`}>{QUALITY_LABELS[l.quality]}</span>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{format(new Date(l.created_at), 'MMM d, yyyy')}</div>
                </div>
                {l.ai_tip && <p className="text-xs line-clamp-2 max-w-[40%]" style={{ color: 'var(--text-muted)' }}>{l.ai_tip}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
