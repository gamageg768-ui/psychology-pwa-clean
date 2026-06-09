'use client';

import { useState, useEffect } from 'react';
import { Heart, Sparkles, Flame } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

interface GratitudeEntry { id: number; items: string[]; reflection: string | null; created_at: string; }

function calcStreak(entries: GratitudeEntry[]) {
  if (!entries.length) return 0;
  const dates = new Set(entries.map(e => format(new Date(e.created_at), 'yyyy-MM-dd')));
  let streak = 0;
  const d = new Date(); d.setHours(0, 0, 0, 0);
  while (dates.has(format(d, 'yyyy-MM-dd'))) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}

export default function GratitudePage() {
  const { user } = useAuth();
  const [items, setItems] = useState(['', '', '']);
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [reflection, setReflection] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) axios.get(`/api/gratitude/${user.id}`).then(r => setEntries(r.data)).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!user || items.filter(Boolean).length < 1) return;
    setLoading(true); setSaved(false);
    try {
      const res = await axios.post('/api/gratitude', { user_id: user.id, items });
      setReflection(res.data.reflection);
      setSaved(true);
      const updated = await axios.get(`/api/gratitude/${user.id}`);
      setEntries(updated.data);
      setItems(['', '', '']);
    } catch { setReflection('Could not generate reflection.'); }
    setLoading(false);
  };

  const streak = calcStreak(entries);

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Gratitude Journal</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>3 things you're grateful for today</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)' }}>
            <Flame size={13} className="text-orange-400" />
            <span className="text-sm font-semibold text-orange-400">{streak}d streak</span>
          </div>
        )}
      </div>

      <div className="card space-y-4">
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Today I'm grateful for...</h3>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-400 flex-shrink-0">{i + 1}</div>
            <input
              type="text"
              value={item}
              onChange={e => { const n = [...items]; n[i] = e.target.value; setItems(n); }}
              placeholder={['Something or someone who helped me', 'A small moment that made me smile', 'Something I usually take for granted'][i]}
              className="input-field"
            />
          </div>
        ))}
        <button onClick={handleSave} disabled={loading || items.filter(Boolean).length < 1} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Reflecting...</>
            : <><Heart size={16} />Save & Reflect</>}
        </button>
      </div>

      {saved && reflection && (
        <div className="glass rounded-2xl p-5 border border-primary-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-primary-400" />
            <span className="font-semibold text-primary-300">Dr. Aria's Reflection</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{reflection}</p>
        </div>
      )}

      {entries.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Past Entries</h3>
          <div className="space-y-3">
            {entries.map(e => (
              <div key={e.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{format(new Date(e.created_at), 'EEEE, MMM d')}</span>
                  <Heart size={14} className="text-pink-400" />
                </div>
                <ul className="space-y-1 mb-2">
                  {e.items.filter(Boolean).map((item, i) => (
                    <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-primary)' }}>
                      <span className="text-primary-400 mt-0.5">•</span>{item}
                    </li>
                  ))}
                </ul>
                {e.reflection && <p className="text-xs italic mt-2 pt-2 border-t" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>{e.reflection}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
