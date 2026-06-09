'use client';

import { useState, useEffect, useRef } from 'react';
import { Wind, Star, Phone, Sparkles, Timer, Shield, Play, Pause, Square, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toolsApi, moodApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

type Tool = 'breathing' | 'affirmations' | 'crisis' | 'meditation' | null;

const BREATHING_TECHNIQUES = [
  { id: 'box breathing', label: '4-4-4-4 Box', desc: 'Calm & focus' },
  { id: '4-7-8 breathing', label: '4-7-8 Relaxing', desc: 'Sleep & anxiety' },
  { id: 'diaphragmatic breathing', label: 'Belly Breathing', desc: 'Deep calm' },
  { id: 'alternate nostril breathing', label: 'Alternate Nostril', desc: 'Balance & clarity' },
];

const BOX = [
  { label: 'Inhale', duration: 4000 },
  { label: 'Hold', duration: 4000 },
  { label: 'Exhale', duration: 4000 },
  { label: 'Hold', duration: 4000 },
];

const DURATIONS = [5, 10, 15, 20];

export default function ToolsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [guide, setGuide] = useState('');
  const [affirmations, setAffirmations] = useState('');
  const [crisis, setCrisis] = useState<{ name: string; contact: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [moodCtx, setMoodCtx] = useState('stressed');
  const [selectedTech, setSelectedTech] = useState('box breathing');
  const [breathPhase, setBreathPhase] = useState<'idle' | 'running'>('idle');
  const [breathStep, setBreathStep] = useState(0);

  const [medDuration, setMedDuration] = useState(10);
  const [medState, setMedState] = useState<'idle' | 'running' | 'paused' | 'done'>('idle');
  const [medSecondsLeft, setMedSecondsLeft] = useState(10 * 60);
  const [preMood, setPreMood] = useState(5);
  const [postMood, setPostMood] = useState(5);
  const [showPostMood, setShowPostMood] = useState(false);
  const medIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startMed = () => {
    setMedSecondsLeft(medDuration * 60);
    setMedState('running'); setShowPostMood(false);
    medIntervalRef.current = setInterval(() => {
      setMedSecondsLeft(s => {
        if (s <= 1) { clearInterval(medIntervalRef.current!); setMedState('done'); setShowPostMood(true); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const pauseMed = () => { if (medIntervalRef.current) clearInterval(medIntervalRef.current); setMedState('paused'); };

  const resumeMed = () => {
    setMedState('running');
    medIntervalRef.current = setInterval(() => {
      setMedSecondsLeft(s => {
        if (s <= 1) { clearInterval(medIntervalRef.current!); setMedState('done'); setShowPostMood(true); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const resetMed = () => {
    if (medIntervalRef.current) clearInterval(medIntervalRef.current);
    setMedState('idle'); setMedSecondsLeft(medDuration * 60); setShowPostMood(false);
  };

  const logPostMood = async () => {
    if (user) await moodApi.log(user.id, postMood, [], 'After meditation session').catch(() => {});
    resetMed();
  };

  useEffect(() => () => { if (medIntervalRef.current) clearInterval(medIntervalRef.current); }, []);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const medProgress = medDuration > 0 ? ((medDuration * 60 - medSecondsLeft) / (medDuration * 60)) * 100 : 0;

  const getBreathGuide = async () => {
    setLoading(true);
    const res = await toolsApi.breathingGuide(selectedTech);
    setGuide(res.data.guide);
    setLoading(false);
  };

  const getAffirmations = async () => {
    setLoading(true);
    const res = await toolsApi.affirmations(moodCtx);
    setAffirmations(res.data.affirmations);
    setLoading(false);
  };

  const getCrisis = async () => {
    setLoading(true);
    const res = await toolsApi.crisisResources();
    setCrisis(res.data.resources);
    setLoading(false);
  };

  const startBreathing = () => {
    setBreathPhase('running'); setBreathStep(0);
    let step = 0;
    breathIntervalRef.current = setInterval(() => {
      step = (step + 1) % BOX.length;
      setBreathStep(step);
    }, 4000);
    setTimeout(() => { clearInterval(breathIntervalRef.current!); setBreathPhase('idle'); setBreathStep(0); }, 64000);
  };

  const TOOL_COLORS: Record<string, string> = {
    breathing: '#06b6d4',
    meditation: '#8b5cf6',
    affirmations: '#f59e0b',
    crisis: '#ef4444',
  };

  const tools = [
    { id: 'breathing', label: 'Breathing', icon: <Wind size={18} />, desc: 'Calm your nervous system' },
    { id: 'meditation', label: 'Meditation', icon: <Timer size={18} />, desc: 'Timed mindfulness session' },
    { id: 'affirmations', label: 'Affirmations', icon: <Star size={18} />, desc: 'Personalized positive statements' },
    { id: 'crisis', label: 'Crisis Resources', icon: <Phone size={18} />, desc: 'Immediate help when needed' },
  ];

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Wellness Tools</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Practical tools for mental wellbeing</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tools.map(t => (
          <button key={t.id}
            onClick={() => setActiveTool(activeTool === t.id as Tool ? null : t.id as Tool)}
            className="card text-left glass-hover flex flex-col gap-2.5 transition-all"
            style={activeTool === t.id ? { borderColor: TOOL_COLORS[t.id] + '60', background: TOOL_COLORS[t.id] + '08' } : {}}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0"
              style={{ background: TOOL_COLORS[t.id] + '20', color: TOOL_COLORS[t.id] }}>
              {t.icon}
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.label}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Breathing */}
      {activeTool === 'breathing' && (
        <div className="card space-y-4">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Breathing Exercises</h3>
          <div className="grid grid-cols-2 gap-2">
            {BREATHING_TECHNIQUES.map(t => (
              <button key={t.id} onClick={() => setSelectedTech(t.id)}
                className="p-3 rounded-lg text-left transition-all"
                style={selectedTech === t.id
                  ? { background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.4)' }
                  : { background: 'var(--subtle-bg)', border: '1px solid var(--border)' }}>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.label}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.desc}</div>
              </button>
            ))}
          </div>
          {breathPhase === 'idle' ? (
            <button onClick={startBreathing} className="btn-primary w-full flex items-center justify-center gap-2">
              <Play size={14} /> Start Visual Guide (4 cycles)
            </button>
          ) : (
            <div className="text-center py-6">
              <div className="relative w-28 h-28 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
                <div className="absolute inset-0 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.3)' }}>
                  <div>
                    <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{BOX[breathStep].label}</div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{BOX[breathStep].duration / 1000}s</div>
                  </div>
                </div>
              </div>
              <p className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>Follow the rhythm...</p>
            </div>
          )}
          <button onClick={getBreathGuide} disabled={loading} className="btn-ghost w-full flex items-center justify-center gap-2 text-sm">
            {loading
              ? <><div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /> Loading...</>
              : <><Sparkles size={13} /> Get AI Script</>}
          </button>
          {guide && (
            <div className="card" style={{ background: 'var(--subtle-bg)' }}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{guide}</p>
            </div>
          )}
        </div>
      )}

      {/* Meditation Timer */}
      {activeTool === 'meditation' && (
        <div className="card space-y-5">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Meditation Timer</h3>
          {medState === 'idle' && (
            <>
              <div>
                <label className="text-sm mb-2 block" style={{ color: 'var(--text-muted)' }}>Session duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {DURATIONS.map(d => (
                    <button key={d} onClick={() => { setMedDuration(d); setMedSecondsLeft(d * 60); }}
                      className={`py-2 rounded-lg text-sm font-semibold transition-all ${medDuration === d ? 'bg-indigo-500 text-white' : ''}`}
                      style={medDuration !== d ? { background: 'var(--subtle-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' } : {}}>
                      {d}m
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm mb-2 block" style={{ color: 'var(--text-muted)' }}>Pre-session mood ({preMood}/10)</label>
                <input type="range" min={1} max={10} value={preMood} onChange={e => setPreMood(Number(e.target.value))} className="w-full accent-indigo-500" />
              </div>
              <button onClick={startMed} className="btn-primary w-full flex items-center justify-center gap-2">
                <Play size={14} /> Begin {medDuration}-Minute Session
              </button>
            </>
          )}
          {(medState === 'running' || medState === 'paused') && (
            <div className="text-center space-y-5">
              <div className="relative w-36 h-36 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="var(--progress-track)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#6366f1" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - medProgress / 100)}`}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatTime(medSecondsLeft)}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>remaining</div>
                </div>
              </div>
              <div className={`w-14 h-14 mx-auto rounded-full border-2 border-indigo-500/30 transition-all duration-[4000ms] ease-in-out ${medState === 'running' ? 'scale-110' : 'scale-90'}`}
                style={{ background: 'rgba(99,102,241,0.1)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {medState === 'running' ? 'Breathe gently. Let thoughts pass.' : 'Paused'}
              </p>
              <div className="flex gap-3 justify-center">
                {medState === 'running'
                  ? <button onClick={pauseMed} className="btn-ghost flex items-center gap-2 px-6"><Pause size={14} /> Pause</button>
                  : <button onClick={resumeMed} className="btn-primary flex items-center gap-2 px-6"><Play size={14} /> Resume</button>}
                <button onClick={resetMed} className="btn-ghost flex items-center gap-2 px-6"><Square size={14} /> End</button>
              </div>
            </div>
          )}
          {medState === 'done' && showPostMood && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle size={24} className="text-emerald-400" />
              </div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Session complete. Well done.</p>
              <div>
                <label className="text-sm mb-2 block" style={{ color: 'var(--text-muted)' }}>Post-session mood ({postMood}/10)</label>
                <input type="range" min={1} max={10} value={postMood} onChange={e => setPostMood(Number(e.target.value))} className="w-full accent-indigo-500" />
              </div>
              <div className="flex gap-3">
                <button onClick={logPostMood} className="btn-primary flex-1">Log Mood & Finish</button>
                <button onClick={resetMed} className="btn-ghost flex-1">Skip</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Affirmations */}
      {activeTool === 'affirmations' && (
        <div className="card space-y-4">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>AI-Generated Affirmations</h3>
          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--text-muted)' }}>Current feeling</label>
            <select value={moodCtx} onChange={e => setMoodCtx(e.target.value)} className="input-field">
              {['stressed', 'anxious', 'sad', 'tired', 'overwhelmed', 'unmotivated', 'hopeful', 'healing', 'grieving', 'confused'].map(m => (
                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
          </div>
          <button onClick={getAffirmations} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
              : <><Star size={14} /> Generate Affirmations</>}
          </button>
          {affirmations && (
            <div className="space-y-2">
              {affirmations.split('\n').filter(l => l.trim()).map((line, i) => (
                <div key={i} className="card" style={{ background: 'var(--subtle-bg)', padding: '0.875rem', borderColor: 'rgba(245,158,11,0.2)' }}>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{line}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Crisis */}
      {activeTool === 'crisis' && (
        <div className="card space-y-4">
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-red-400" />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Crisis Resources</h3>
          </div>
          <div className="card" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)', padding: '0.875rem' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              If you are in immediate danger, please call <strong style={{ color: 'var(--text-primary)' }}>911</strong> or go to your nearest emergency room.
            </p>
          </div>
          <button onClick={getCrisis} disabled={loading} className="btn-primary w-full text-sm">Load Resources</button>
          {crisis.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--border)' }}>
              <div className="w-8 h-8 bg-red-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone size={13} className="text-red-400" />
              </div>
              <div>
                <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{r.name}</div>
                <div className="font-bold text-sm text-indigo-400">{r.contact}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Safety Plan link */}
      <button onClick={() => router.push('/safety-plan')}
        className="w-full card flex items-center gap-4 glass-hover text-left" style={{ padding: '1rem' }}>
        <div className="w-9 h-9 bg-indigo-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield size={18} className="text-indigo-400" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Crisis Safety Plan</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Build your personal safety plan</div>
        </div>
      </button>
    </div>
  );
}
