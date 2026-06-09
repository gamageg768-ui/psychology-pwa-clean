'use client';

import { useState, useEffect } from 'react';
import { Activity, Sparkles } from 'lucide-react';
import { moodApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { MoodLog } from '@/types';
import { format } from 'date-fns';

const EMOTIONS = ['Happy', 'Calm', 'Anxious', 'Sad', 'Angry', 'Excited', 'Tired', 'Hopeful', 'Frustrated', 'Grateful', 'Lonely', 'Overwhelmed'];
const MOOD_LABELS = ['', 'Very Low', 'Low', 'Poor', 'Below Avg', 'Average', 'Fair', 'Good', 'Great', 'Excellent', 'Amazing'];
const MOOD_COLORS = ['', '#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#10b981','#06b6d4','#6366f1','#8b5cf6'];

export default function MoodPage() {
  const { user } = useAuth();
  const [mood, setMood] = useState(5);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { loadMoods(); }, []);

  const loadMoods = async () => {
    if (!user) return;
    const res = await moodApi.list(user.id);
    setLogs(res.data);
  };

  const toggleEmotion = (e: string) =>
    setSelectedEmotions(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);

  const submit = async () => {
    if (!user) return;
    setLoading(true); setSubmitted(false);
    try {
      const res = await moodApi.log(user.id, mood, selectedEmotions, note);
      setInsight(res.data.ai_insight);
      setSubmitted(true);
      setNote(''); setSelectedEmotions([]);
      loadMoods();
    } catch {
      setInsight('Could not get AI insight. Check backend connection.');
      setSubmitted(true);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Mood Check-In</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>How are you feeling right now?</p>
      </div>

      <div className="md:grid md:grid-cols-2 md:gap-6 md:items-start space-y-6 md:space-y-0">
        <div className="space-y-4">
          <div className="card space-y-5">

            {/* Score indicator */}
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center mb-3">
                <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
                  <circle cx="44" cy="44" r="36" fill="none" stroke="var(--progress-track)" strokeWidth="7" />
                  <circle cx="44" cy="44" r="36" fill="none" stroke={MOOD_COLORS[mood]} strokeWidth="7"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - mood / 10)}`}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: MOOD_COLORS[mood] }}>{mood}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ 10</span>
                </div>
              </div>
              <div className="font-semibold text-base" style={{ color: MOOD_COLORS[mood] }}>{MOOD_LABELS[mood]}</div>
              <input type="range" min={1} max={10} value={mood} onChange={e => setMood(Number(e.target.value))}
                className="w-full mt-4" style={{ accentColor: MOOD_COLORS[mood] }} />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                <span>Very Low</span><span>Amazing</span>
              </div>
            </div>

            {/* Emotions */}
            <div>
              <div className="text-sm font-medium mb-2.5" style={{ color: 'var(--text-secondary)' }}>Emotions</div>
              <div className="flex flex-wrap gap-2">
                {EMOTIONS.map(e => (
                  <button key={e} onClick={() => toggleEmotion(e)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedEmotions.includes(e)
                        ? 'bg-indigo-500 text-white'
                        : ''
                    }`}
                    style={!selectedEmotions.includes(e)
                      ? { background: 'var(--subtle-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                      : {}}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Note <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></div>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="What's influencing your mood today..." rows={3} className="input-field resize-none" />
            </div>

            <button onClick={submit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Getting Insight...</>
                : <><Sparkles size={15} /> Log Mood & Get AI Insight</>}
            </button>
          </div>

          {submitted && insight && (
            <div className="card" style={{ borderLeft: '3px solid #6366f1' }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Insight from Dr. Aria</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{insight}</p>
            </div>
          )}
        </div>

        {logs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity size={15} className="text-indigo-400" />
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Mood History</h3>
            </div>
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="card" style={{ padding: '0.875rem' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: MOOD_COLORS[log.mood] }}>
                      {log.mood}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold" style={{ color: MOOD_COLORS[log.mood] }}>{MOOD_LABELS[log.mood]}</span>
                        <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                          {format(new Date(log.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                  {log.emotions?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {log.emotions.map(e => (
                        <span key={e} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>{e}</span>
                      ))}
                    </div>
                  )}
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
