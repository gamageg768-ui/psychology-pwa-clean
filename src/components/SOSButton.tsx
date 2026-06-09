'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Phone, AlertTriangle } from 'lucide-react';

const GROUNDING_STEPS = [
  { count: 5, sense: 'SEE', prompt: 'Name 5 things you can see right now', color: 'text-blue-400' },
  { count: 4, sense: 'HEAR', prompt: 'Name 4 sounds you can hear', color: 'text-purple-400' },
  { count: 3, sense: 'TOUCH', prompt: 'Name 3 things you can physically feel', color: 'text-green-400' },
  { count: 2, sense: 'SMELL', prompt: 'Name 2 things you can smell', color: 'text-yellow-400' },
  { count: 1, sense: 'TASTE', prompt: 'Name 1 thing you can taste', color: 'text-orange-400' },
];

const CRISIS_LINES = [
  { name: 'Suicide & Crisis Lifeline', contact: '988', type: 'Call or Text' },
  { name: 'Crisis Text Line', contact: 'Text HOME to 741741', type: 'Text' },
  { name: 'SAMHSA Helpline', contact: '1-800-662-4357', type: 'Call' },
];

type Tab = 'ground' | 'breathe' | 'crisis';

export default function SOSButton() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('ground');
  const [groundStep, setGroundStep] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'idle'>('idle');
  const [breathCount, setBreathCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => { if (timerRef.current) clearTimeout(timerRef.current); };

  const runBreathCycle = () => {
    setBreathPhase('inhale');
    timerRef.current = setTimeout(() => {
      setBreathPhase('hold');
      timerRef.current = setTimeout(() => {
        setBreathPhase('exhale');
        timerRef.current = setTimeout(() => {
          setBreathCount(c => c + 1);
          runBreathCycle();
        }, 4000);
      }, 4000);
    }, 4000);
  };

  useEffect(() => {
    if (tab === 'breathe' && breathPhase === 'idle') runBreathCycle();
    return clearTimer;
  }, [tab]);

  useEffect(() => {
    if (!open) { clearTimer(); setBreathPhase('idle'); setBreathCount(0); setGroundStep(0); setTab('ground'); }
  }, [open]);

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="fixed bottom-24 right-4 z-50 md:bottom-6 w-12 h-12 rounded-full bg-red-500 text-white font-bold text-xs shadow-lg hover:bg-red-600 active:scale-95 transition-all animate-pulse-slow flex items-center justify-center"
      aria-label="SOS — Open grounding tools"
    >
      SOS
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: 'var(--bg)', backdropFilter: 'blur(4px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-400" />
          <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>You're safe. Let's breathe.</span>
        </div>
        <button onClick={() => setOpen(false)} className="theme-toggle p-1.5"><X size={18} /></button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 pt-4">
        {(['ground', 'breathe', 'crisis'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${tab === t ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'}`}
            style={tab !== t ? { background: 'var(--subtle-bg)' } : {}}>
            {t === 'ground' ? '5-4-3-2-1' : t === 'breathe' ? 'Breathe' : 'Hotlines'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6">

        {tab === 'ground' && (
          <div className="space-y-6 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Grounding brings you back to the present moment.</p>
            {groundStep < GROUNDING_STEPS.length ? (
              <div className="card text-center space-y-4">
                <div className={`text-6xl font-black ${GROUNDING_STEPS[groundStep].color}`}>{GROUNDING_STEPS[groundStep].count}</div>
                <div className={`text-xl font-bold ${GROUNDING_STEPS[groundStep].color}`}>{GROUNDING_STEPS[groundStep].sense}</div>
                <p className="text-lg" style={{ color: 'var(--text-primary)' }}>{GROUNDING_STEPS[groundStep].prompt}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Take your time. When ready, tap next.</p>
                <button onClick={() => setGroundStep(s => s + 1)} className="btn-primary w-full">
                  {groundStep < GROUNDING_STEPS.length - 1 ? 'Next →' : 'Complete ✓'}
                </button>
              </div>
            ) : (
              <div className="card text-center space-y-3">
                <div className="text-5xl">🌿</div>
                <p className="font-bold text-lg text-calm-400">Well done.</p>
                <p style={{ color: 'var(--text-secondary)' }}>You just completed a full grounding exercise. Notice how you feel right now.</p>
                <button onClick={() => setGroundStep(0)} className="btn-ghost w-full">Start again</button>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              {GROUNDING_STEPS.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i <= groundStep - 1 ? 'bg-primary-500' : 'bg-slate-700'}`} />
              ))}
            </div>
          </div>
        )}

        {tab === 'breathe' && (
          <div className="text-center space-y-8">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Box breathing: 4 seconds each phase</p>
            <div className="relative flex items-center justify-center">
              <div className={`w-48 h-48 rounded-full border-4 border-primary-500/30 flex items-center justify-center transition-all duration-[4000ms] ease-in-out ${
                breathPhase === 'inhale' ? 'scale-110 border-primary-400' :
                breathPhase === 'hold' ? 'scale-110 border-accent-400' :
                breathPhase === 'exhale' ? 'scale-90 border-calm-400' : 'scale-100'
              }`}>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {breathPhase === 'inhale' ? 'Inhale' : breathPhase === 'hold' ? 'Hold' : breathPhase === 'exhale' ? 'Exhale' : 'Ready?'}
                  </div>
                  {breathCount > 0 && <div className="text-xs mt-1 text-slate-400">{breathCount} cycles</div>}
                </div>
              </div>
            </div>
            {breathPhase === 'idle' && (
              <button onClick={() => runBreathCycle()} className="btn-primary">Start Breathing</button>
            )}
            {breathPhase !== 'idle' && (
              <button onClick={() => { clearTimer(); setBreathPhase('idle'); setBreathCount(0); }} className="btn-ghost">Stop</button>
            )}
          </div>
        )}

        {tab === 'crisis' && (
          <div className="space-y-4">
            <div className="card border-red-500/40 bg-red-500/5 text-center space-y-1">
              <p className="font-bold text-red-400">Immediate danger?</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Call <strong>911</strong> or go to your nearest emergency room.</p>
            </div>
            {CRISIS_LINES.map(l => (
              <div key={l.name} className="card flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{l.name}</div>
                  <div className="text-primary-400 font-bold">{l.contact}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.type}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
