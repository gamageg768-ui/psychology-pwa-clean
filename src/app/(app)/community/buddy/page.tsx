'use client';

import { useState, useEffect } from 'react';
import { Users, Search, MessageCircle, Clock, ArrowRight } from 'lucide-react';
import { buddyApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { BuddyMatch } from '@/types';
import { useRouter } from 'next/navigation';

const STRUGGLE_AREAS = [
  { value: 'anxiety', label: 'Anxiety', emoji: '😰', color: '#f59e0b' },
  { value: 'depression', label: 'Depression', emoji: '💙', color: '#6366f1' },
  { value: 'grief', label: 'Grief & Loss', emoji: '🕊️', color: '#8b5cf6' },
  { value: 'stress', label: 'Stress', emoji: '😤', color: '#ef4444' },
  { value: 'sleep', label: 'Sleep Issues', emoji: '😴', color: '#06b6d4' },
  { value: 'social', label: 'Social Anxiety', emoji: '🤝', color: '#10b981' },
  { value: 'trauma', label: 'Trauma / PTSD', emoji: '🌱', color: '#ec4899' },
  { value: 'general', label: 'General Support', emoji: '💛', color: '#84cc16' },
];

export default function BuddyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<BuddyMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedArea, setSelectedArea] = useState('');
  const [result, setResult] = useState<{ matched: boolean; message?: string; id?: number } | null>(null);

  useEffect(() => { loadMatches(); }, []);

  const loadMatches = async () => {
    if (!user) return;
    const res = await buddyApi.getMatch(user.id);
    setMatches(res.data);
  };

  const findBuddy = async () => {
    if (!user || !selectedArea) return;
    setSearching(true);
    try {
      const res = await buddyApi.findMatch(user.id, selectedArea);
      setResult(res.data);
      loadMatches();
    } catch { /* ignore */ }
    setSearching(false);
  };

  const activeMatches = matches.filter(m => m.status === 'active');

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Peer Buddy</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Anonymous 1-on-1 peer support matching</p>
      </div>

      <div className="card" style={{ borderLeft: '3px solid #6366f1' }}>
        <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>How it works</div>
        <div className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <div>1. Choose your shared struggle area below</div>
          <div>2. We match you with someone who understands</div>
          <div>3. Send messages — fully anonymous, fully supportive</div>
        </div>
      </div>

      {activeMatches.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={15} className="text-indigo-400" />
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Your Buddy Connections</h3>
          </div>
          <div className="space-y-2">
            {activeMatches.map(match => {
              const area = STRUGGLE_AREAS.find(a => a.value === match.area) ?? STRUGGLE_AREAS[STRUGGLE_AREAS.length - 1];
              return (
                <button key={match.id} onClick={() => router.push(`/community/buddy/${match.id}`)}
                  className="card w-full text-left flex items-center gap-3 transition-all hover:scale-[1.01]">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${area.color}20` }}>
                    {area.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{match.partner_name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${area.color}15`, color: area.color }}>
                        {area.label}
                      </span>
                      {match.last_message && (
                        <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{match.last_message}</span>
                      )}
                    </div>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Search size={15} className="text-indigo-400" />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Find a New Buddy</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {STRUGGLE_AREAS.map(area => (
            <button key={area.value} onClick={() => setSelectedArea(area.value)}
              className="p-3 rounded-xl text-sm font-medium text-left transition-all"
              style={{
                background: selectedArea === area.value ? `${area.color}20` : 'var(--subtle-bg)',
                border: `1px solid ${selectedArea === area.value ? area.color : 'var(--border)'}`,
                color: selectedArea === area.value ? area.color : 'var(--text-secondary)',
              }}>
              <span className="mr-2">{area.emoji}</span>{area.label}
            </button>
          ))}
        </div>

        {result && (
          <div className="p-3 rounded-xl" style={{
            background: result.matched ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
            border: `1px solid ${result.matched ? '#10b981' : '#f59e0b'}30`,
          }}>
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: result.matched ? '#10b981' : '#f59e0b' }}>
              {result.matched ? '🎉 Buddy found!' : <><Clock size={13} /> Searching...</>}
            </div>
            {result.message && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{result.message}</p>}
            {result.matched && result.id && (
              <button onClick={() => router.push(`/community/buddy/${result.id}`)} className="btn-primary text-xs mt-2 flex items-center gap-1">
                Open Chat <ArrowRight size={12} />
              </button>
            )}
          </div>
        )}

        <button onClick={findBuddy} disabled={!selectedArea || searching}
          className="btn-primary w-full flex items-center justify-center gap-2">
          {searching
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Searching...</>
            : <><Users size={15} /> Find a Buddy</>}
        </button>
      </div>
    </div>
  );
}
