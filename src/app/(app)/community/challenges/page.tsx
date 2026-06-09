'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ChallengeEntry { id: number; userId: number; dayNumber: number; }
interface Challenge { id: number; title: string; description: string; emoji: string; durationDays: number; entries: ChallengeEntry[]; }

export default function ChallengesPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch('/api/community/challenges').then(r => r.json()).then(setChallenges).catch(() => {});
  }, []);

  const myEntries = (c: Challenge) => c.entries.filter(e => e.userId === user?.id && e.dayNumber > 0);
  const isJoined = (c: Challenge) => c.entries.some(e => e.userId === user?.id);
  const totalParticipants = (c: Challenge) => new Set(c.entries.map(e => e.userId)).size;
  const todayCheckedIn = (c: Challenge) => {
    const my = myEntries(c);
    if (my.length === 0) return false;
    const lastDay = Math.max(...my.map(e => e.dayNumber));
    return lastDay === my.length;
  };
  const communityProgress = (c: Challenge) => {
    const participants = totalParticipants(c);
    if (participants === 0) return 0;
    const todayCheckins = c.entries.filter(e => {
      const my = c.entries.filter(x => x.userId === e.userId && x.dayNumber > 0);
      return my.length > 0 && e.dayNumber === my.length;
    }).length;
    return Math.round((todayCheckins / participants) * 100);
  };

  const join = async (challengeId: number) => {
    if (!user) return;
    setLoading(l => ({ ...l, [challengeId]: true }));
    try {
      const r = await fetch(`/api/community/challenges/${challengeId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await r.json();
      setChallenges(prev => prev.map(c => {
        if (c.id !== challengeId) return c;
        if (data.joined) return { ...c, entries: [...c.entries, { id: Date.now(), userId: user.id, dayNumber: 0 }] };
        return { ...c, entries: c.entries.filter(e => e.userId !== user.id) };
      }));
    } finally { setLoading(l => ({ ...l, [challengeId]: false })); }
  };

  const checkin = async (challengeId: number) => {
    if (!user) return;
    setLoading(l => ({ ...l, [challengeId]: true }));
    try {
      const r = await fetch(`/api/community/challenges/${challengeId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      if (r.ok) {
        const entry = await r.json();
        setChallenges(prev => prev.map(c =>
          c.id === challengeId ? { ...c, entries: [...c.entries, entry] } : c
        ));
      }
    } finally { setLoading(l => ({ ...l, [challengeId]: false })); }
  };

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Community Challenges</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Join wellness goals with the community</p>
      </div>

      {challenges.map(c => {
        const my = myEntries(c);
        const joined = isJoined(c);
        const streak = my.length;
        const done = streak >= c.durationDays;
        const checkedToday = todayCheckedIn(c);
        const progress = communityProgress(c);
        const participants = totalParticipants(c);

        return (
          <div key={c.id} className="card">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{c.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{c.description}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {c.durationDays} days · {participants} participants
                </p>
              </div>
            </div>

            {joined && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  <span>Your progress: Day {streak}/{c.durationDays}</span>
                  <span>{done ? '🎉 Complete!' : `${c.durationDays - streak} days left`}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--progress-track)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${(streak / c.durationDays) * 100}%`, background: '#6366f1' }} />
                </div>
                {participants > 1 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                      <span>Community today</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--progress-track)' }}>
                      <div className="h-full rounded-full" style={{ width: `${progress}%`, background: '#10b981' }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              {!joined ? (
                <button onClick={() => join(c.id)} disabled={loading[c.id]} className="btn-primary text-sm py-2 px-4">
                  {loading[c.id] ? '...' : 'Join Challenge'}
                </button>
              ) : done ? (
                <span className="text-sm font-medium" style={{ color: '#10b981' }}>🎉 Challenge Complete!</span>
              ) : (
                <button onClick={() => checkin(c.id)} disabled={loading[c.id] || checkedToday} className="btn-primary text-sm py-2 px-4">
                  {loading[c.id] ? '...' : checkedToday ? '✓ Checked In Today' : 'Check In Today'}
                </button>
              )}
              {joined && !done && (
                <button onClick={() => join(c.id)} disabled={loading[c.id]}
                  className="text-sm px-3 py-2 rounded-xl border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'transparent' }}>
                  Leave
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
