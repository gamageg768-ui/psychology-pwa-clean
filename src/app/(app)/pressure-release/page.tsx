'use client';

import { useState, useEffect, useRef } from 'react';
import { Flame, Sparkles, RotateCcw, Play, Pause, Check, ArrowLeft, TrendingDown, Send } from 'lucide-react';
import { pressureApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { PressureLog } from '@/types';
import { format } from 'date-fns';

// ─── Pressure gauge helpers ────────────────────────────────────────────────
const PRESSURE_EMOJI = (n: number) =>
  n <= 3 ? '🟢' : n <= 6 ? '🟡' : n <= 8 ? '🟠' : '🔴';

const PRESSURE_LABEL = (n: number) =>
  n <= 2 ? 'Very Low' : n <= 4 ? 'Mild' : n <= 6 ? 'Moderate' : n <= 8 ? 'High' : 'Critical';

const PRESSURE_COLOR = (n: number) =>
  n <= 3 ? '#10b981' : n <= 6 ? '#f59e0b' : n <= 8 ? '#f97316' : '#ef4444';

// ─── Technique definitions ─────────────────────────────────────────────────
const TECHNIQUES = [
  {
    id: 'tension-dump',
    label: 'Tension Dump',
    emoji: '📝',
    color: '#8b5cf6',
    tagline: 'Write it all out, then let it go',
    desc: '3-minute uncensored brain dump. Type everything pressing on you — no editing, no judgment. Then symbolically release it.',
  },
  {
    id: 'pmr',
    label: 'Muscle Release',
    emoji: '💪',
    color: '#06b6d4',
    tagline: 'Tense & release each muscle group',
    desc: 'Progressive muscle relaxation. Systematically tense and release 8 muscle groups to dissolve physical tension.',
  },
  {
    id: 'power-exhale',
    label: 'Power Exhale',
    emoji: '💨',
    color: '#f97316',
    tagline: 'Forceful exhales to expel tension',
    desc: '3 rounds of 10 forceful exhales. Unlike calming breathing — this actively purges built-up tension from your body.',
  },
  {
    id: 'shake-it-out',
    label: 'Shake It Out',
    emoji: '🤲',
    color: '#ec4899',
    tagline: 'Discharge adrenaline through movement',
    desc: '4 guided movements to physically discharge stress hormones. Proven by somatic therapy research.',
  },
  {
    id: 'vent-to-ai',
    label: 'Vent to AI',
    emoji: '💬',
    color: '#10b981',
    tagline: 'Say it all — AI just listens',
    desc: 'Type your unfiltered frustration. AI responds with pure empathy only — no advice, no fixes, just being heard.',
  },
];

// ─── PMR muscle groups ─────────────────────────────────────────────────────
const PMR_GROUPS = [
  { label: 'Hands & Fists', emoji: '✊', tense: 'Clench both fists as hard as you can', release: 'Open your hands wide. Feel the tension drain away.' },
  { label: 'Forearms', emoji: '💪', tense: 'Bend your wrists back, stretching your forearms', release: 'Let your arms fall. Notice the warmth spreading.' },
  { label: 'Biceps', emoji: '🦾', tense: 'Tense your biceps — curl your arms hard', release: 'Drop your arms. Feel them heavy and loose.' },
  { label: 'Shoulders', emoji: '🤷', tense: 'Shrug your shoulders up toward your ears, hard', release: 'Drop them completely. Your shoulders are heavy and relaxed.' },
  { label: 'Face & Jaw', emoji: '😬', tense: 'Scrunch your face — close eyes tight, clench jaw', release: 'Let your face go completely slack. Jaw drops open slightly.' },
  { label: 'Abdomen', emoji: '🫁', tense: 'Tighten your stomach muscles like bracing for a punch', release: 'Release completely. Let your belly soften. Breathe into it.' },
  { label: 'Thighs', emoji: '🦵', tense: 'Tense both thighs — press legs together firmly', release: 'Let your legs fall open. Thighs heavy and warm.' },
  { label: 'Feet', emoji: '🦶', tense: 'Curl your toes downward, tensing your feet', release: 'Uncurl and relax. Feel the tension leave through the tips of your toes.' },
];

// ─── Shake movements ───────────────────────────────────────────────────────
const SHAKE_MOVES = [
  { label: 'Shake Your Hands', emoji: '🤲', instruction: 'Hold your hands out and shake them vigorously — like shaking water off. Really let them flap loose.', seconds: 30 },
  { label: 'Shoulder Rolls', emoji: '🤷', instruction: 'Roll your shoulders forward 5 times slowly, then backward 5 times. Feel each rotation.', seconds: 40 },
  { label: 'Bounce & Jump', emoji: '🦘', instruction: 'Bounce lightly on the balls of your feet, or jump gently in place. Let your whole body loosen up.', seconds: 45 },
  { label: 'Grounding Stance', emoji: '🧍', instruction: 'Stand with feet shoulder-width apart. Breathe deeply. Feel the floor beneath you. You are here, you are safe.', seconds: 30 },
];

type View = 'home' | 'technique' | 'result';

export default function PressureReleasePage() {
  const { user } = useAuth();
  const [pressureBefore, setPressureBefore] = useState(7);
  const [pressureAfter, setPressureAfter] = useState(7);
  const [activeTechnique, setActiveTechnique] = useState<string | null>(null);
  const [view, setView] = useState<View>('home');
  const [logs, setLogs] = useState<PressureLog[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ai_response: string; delta: number } | null>(null);
  const [sessionDone, setSessionDone] = useState(false);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    if (!user) return;
    const res = await pressureApi.list(user.id);
    setLogs(res.data);
  };

  const startTechnique = (id: string) => {
    setActiveTechnique(id);
    setView('technique');
    setSessionDone(false);
    setPressureAfter(pressureBefore);
  };

  const finishSession = async (content?: string) => {
    if (!user || !activeTechnique) return;
    setSubmitting(true);
    try {
      const res = await pressureApi.log(user.id, activeTechnique, pressureBefore, pressureAfter, content);
      setResult(res.data);
      setView('result');
      loadLogs();
    } catch { setResult({ ai_response: 'Well done for taking that step. You showed up for yourself.', delta: pressureBefore - pressureAfter }); setView('result'); }
    setSubmitting(false);
  };

  const reset = () => {
    setView('home');
    setActiveTechnique(null);
    setSessionDone(false);
    setResult(null);
    setPressureBefore(7);
    setPressureAfter(7);
  };

  const technique = TECHNIQUES.find(t => t.id === activeTechnique);

  // ── Result screen ──────────────────────────────────────────────────────
  if (view === 'result' && result) {
    const improved = result.delta > 0;
    return (
      <div className="space-y-6 pb-8">
        <button onClick={reset} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back to Pressure Release
        </button>

        <div className="card text-center py-8 space-y-4">
          <div className="text-4xl">{improved ? '🔥' : '💙'}</div>
          <div className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
            {improved ? 'Pressure Released!' : 'You Showed Up For Yourself'}
          </div>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: PRESSURE_COLOR(pressureBefore) }}>{pressureBefore}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Before</div>
            </div>
            <TrendingDown size={20} style={{ color: improved ? '#10b981' : 'var(--text-muted)' }} />
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: PRESSURE_COLOR(pressureAfter) }}>{pressureAfter}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>After</div>
            </div>
          </div>
          {improved && (
            <div className="text-sm font-semibold" style={{ color: '#f97316' }}>
              -{result.delta} point{result.delta !== 1 ? 's' : ''} of pressure released
            </div>
          )}
        </div>

        <div className="card" style={{ borderLeft: '3px solid #f97316' }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} style={{ color: '#f97316' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>From Dr. Aria</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.ai_response}</p>
        </div>

        <button onClick={reset} className="w-full btn-primary flex items-center justify-center gap-2"
          style={{ background: '#f97316' }}>
          <Flame size={15} /> Release More Pressure
        </button>
      </div>
    );
  }

  // ── Technique sessions ─────────────────────────────────────────────────
  if (view === 'technique' && technique) {
    return (
      <div className="space-y-5 pb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('home')} className="p-2 rounded-xl"
            style={{ background: 'var(--subtle-bg)', border: '1px solid var(--border)' }}>
            <ArrowLeft size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {technique.emoji} {technique.label}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{technique.tagline}</p>
          </div>
        </div>

        {activeTechnique === 'tension-dump' && (
          <TensionDump
            color={technique.color}
            onDone={(content) => { setSessionDone(true); finishSession(content); }}
            submitting={submitting}
            pressureAfter={pressureAfter}
            setPressureAfter={setPressureAfter}
          />
        )}
        {activeTechnique === 'pmr' && (
          <PMRSession
            color={technique.color}
            onDone={() => setSessionDone(true)}
            sessionDone={sessionDone}
            submitting={submitting}
            pressureAfter={pressureAfter}
            setPressureAfter={setPressureAfter}
            onFinish={() => finishSession()}
          />
        )}
        {activeTechnique === 'power-exhale' && (
          <PowerExhale
            color={technique.color}
            onDone={() => setSessionDone(true)}
            sessionDone={sessionDone}
            submitting={submitting}
            pressureAfter={pressureAfter}
            setPressureAfter={setPressureAfter}
            onFinish={() => finishSession()}
          />
        )}
        {activeTechnique === 'shake-it-out' && (
          <ShakeItOut
            color={technique.color}
            onDone={() => setSessionDone(true)}
            sessionDone={sessionDone}
            submitting={submitting}
            pressureAfter={pressureAfter}
            setPressureAfter={setPressureAfter}
            onFinish={() => finishSession()}
          />
        )}
        {activeTechnique === 'vent-to-ai' && (
          <VentToAI
            color={technique.color}
            onDone={(content) => { setSessionDone(true); finishSession(content); }}
            submitting={submitting}
            pressureAfter={pressureAfter}
            setPressureAfter={setPressureAfter}
          />
        )}
      </div>
    );
  }

  // ── Home screen ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Pressure Release</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Active cathartic techniques to discharge built-up pressure</p>
      </div>

      {/* Pressure gauge */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>How much pressure are you under right now?</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xl">{PRESSURE_EMOJI(pressureBefore)}</span>
            <span className="text-xl font-bold" style={{ color: PRESSURE_COLOR(pressureBefore) }}>{pressureBefore}</span>
            <span className="text-sm font-medium" style={{ color: PRESSURE_COLOR(pressureBefore) }}>{PRESSURE_LABEL(pressureBefore)}</span>
          </div>
        </div>
        <input type="range" min={1} max={10} value={pressureBefore}
          onChange={e => setPressureBefore(Number(e.target.value))}
          className="w-full" style={{ accentColor: PRESSURE_COLOR(pressureBefore) }} />
        <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>🟢 Very Low</span><span>🔴 Critical</span>
        </div>
      </div>

      {/* Technique cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TECHNIQUES.map(t => (
          <button key={t.id} onClick={() => startTechnique(t.id)}
            className="card text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ borderLeft: `3px solid ${t.color}` }}>
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">{t.emoji}</div>
              <div>
                <div className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>{t.label}</div>
                <div className="text-xs font-medium mb-1" style={{ color: t.color }}>{t.tagline}</div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{t.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* History */}
      {logs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Flame size={14} style={{ color: '#f97316' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Releases</span>
          </div>
          <div className="space-y-2">
            {logs.slice(0, 5).map(log => {
              const delta = log.pressure_before - log.pressure_after;
              const t = TECHNIQUES.find(x => x.id === log.technique);
              return (
                <div key={log.id} className="card flex items-center gap-3" style={{ padding: '0.75rem 1rem' }}>
                  <span className="text-xl flex-shrink-0">{t?.emoji ?? '🔥'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t?.label ?? log.technique}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {format(new Date(log.created_at), 'MMM d, h:mm a')}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold" style={{ color: delta > 0 ? '#10b981' : 'var(--text-muted)' }}>
                      {delta > 0 ? `-${delta}` : '±0'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {log.pressure_before} → {log.pressure_after}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tension Dump ──────────────────────────────────────────────────────────
function TensionDump({ color, onDone, submitting, pressureAfter, setPressureAfter }: {
  color: string; onDone: (content: string) => void; submitting: boolean;
  pressureAfter: number; setPressureAfter: (n: number) => void;
}) {
  const [text, setText] = useState('');
  const [timeLeft, setTimeLeft] = useState(180);
  const [running, setRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [released, setReleased] = useState(false);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(intervalRef.current!); setTimerDone(true); setRunning(false); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const releaseIt = () => {
    setFading(true);
    setTimeout(() => { setText(''); setReleased(true); setFading(false); }, 800);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="space-y-4">
      <div className="card" style={{ borderLeft: `3px solid ${color}` }}>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Start the timer and type <strong>everything</strong> that is pressing on you — without stopping, editing, or judging. Pure unfiltered release.
        </p>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold font-mono" style={{ color: running ? color : 'var(--text-muted)' }}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
        {!running && !timerDone && (
          <button onClick={startTimer} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: color }}>
            <Play size={14} /> Start Timer
          </button>
        )}
        {timerDone && !released && <span className="text-sm font-semibold text-emerald-400">Time's up! Ready to release?</span>}
      </div>

      <textarea value={text} onChange={e => setText(e.target.value)}
        placeholder={running ? "Type everything — no holding back..." : "Start the timer to begin..."}
        rows={10} readOnly={!running && !timerDone}
        className="input-field resize-none w-full text-sm transition-opacity"
        style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.8s ease', minHeight: '200px' }} />

      {(timerDone || text.length > 20) && !released && (
        <div className="space-y-3">
          <button onClick={releaseIt}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: `linear-gradient(135deg, ${color}, #ef4444)` }}>
            🔥 Release It — Let It Go
          </button>
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>This will clear your writing symbolically — like burning a letter</p>
        </div>
      )}

      {released && (
        <div className="space-y-4">
          <div className="card text-center py-6">
            <div className="text-3xl mb-2">✨</div>
            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Released.</div>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Those words carried weight. Now they're gone.</p>
          </div>
          <AfterGauge pressureAfter={pressureAfter} setPressureAfter={setPressureAfter} color={color} />
          <button onClick={() => onDone('')} disabled={submitting}
            className="w-full btn-primary flex items-center justify-center gap-2 text-sm"
            style={{ background: color }}>
            {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Check size={14} /> Complete & Get Reflection</>}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PMR Session ───────────────────────────────────────────────────────────
function PMRSession({ color, onDone, sessionDone, submitting, pressureAfter, setPressureAfter, onFinish }: {
  color: string; onDone: () => void; sessionDone: boolean; submitting: boolean;
  pressureAfter: number; setPressureAfter: (n: number) => void; onFinish: () => void;
}) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<'tense' | 'release' | 'wait'>('wait');
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const done = step >= PMR_GROUPS.length;

  const startStep = () => {
    setPhase('tense');
    setTimeLeft(7);
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setPhase('release');
          setTimeLeft(15);
          intervalRef.current = setInterval(() => {
            setTimeLeft(t2 => {
              if (t2 <= 1) {
                clearInterval(intervalRef.current!);
                setPhase('wait');
                const next = step + 1;
                setStep(next);
                if (next >= PMR_GROUPS.length) onDone();
                return 0;
              }
              return t2 - 1;
            });
          }, 1000);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const group = PMR_GROUPS[step];

  if (done || sessionDone) {
    return (
      <div className="space-y-4">
        <div className="card text-center py-6">
          <div className="text-3xl mb-2">✨</div>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>All 8 groups released</div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your body is softer now. Tension dissolved.</p>
        </div>
        <AfterGauge pressureAfter={pressureAfter} setPressureAfter={setPressureAfter} color={color} />
        <button onClick={onFinish} disabled={submitting}
          className="w-full btn-primary flex items-center justify-center gap-2 text-sm"
          style={{ background: color }}>
          {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Check size={14} /> Complete & Get Reflection</>}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex gap-1">
        {PMR_GROUPS.map((_, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
            style={{ background: i < step ? color : i === step ? `${color}60` : 'var(--progress-track)' }} />
        ))}
      </div>

      <div className="card text-center space-y-4">
        <div className="text-5xl">{group.emoji}</div>
        <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{group.label}</div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-full inline-block"
          style={{
            background: phase === 'tense' ? '#ef444420' : phase === 'release' ? '#10b98120' : 'var(--subtle-bg)',
            color: phase === 'tense' ? '#ef4444' : phase === 'release' ? '#10b981' : 'var(--text-muted)',
          }}>
          {phase === 'wait' ? `Step ${step + 1} of ${PMR_GROUPS.length}` : phase === 'tense' ? `TENSE — ${timeLeft}s` : `RELEASE — ${timeLeft}s`}
        </div>
        <p className="text-sm leading-relaxed px-2" style={{ color: 'var(--text-secondary)' }}>
          {phase === 'wait' ? group.tense : phase === 'tense' ? group.tense : group.release}
        </p>
        {phase === 'wait' && (
          <button onClick={startStep} className="mx-auto flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: color }}>
            <Play size={14} /> {step === 0 ? 'Begin' : 'Next Group'}
          </button>
        )}
        {phase !== 'wait' && (
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-bold"
            style={{ background: phase === 'tense' ? '#ef444425' : '#10b98125', color: phase === 'tense' ? '#ef4444' : '#10b981' }}>
            {timeLeft}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Power Exhale ──────────────────────────────────────────────────────────
function PowerExhale({ color, onDone, sessionDone, submitting, pressureAfter, setPressureAfter, onFinish }: {
  color: string; onDone: () => void; sessionDone: boolean; submitting: boolean;
  pressureAfter: number; setPressureAfter: (n: number) => void; onFinish: () => void;
}) {
  const [round, setRound] = useState(1);
  const [exhaleCount, setExhaleCount] = useState(0);
  const [phase, setPhase] = useState<'inhale' | 'exhale' | 'rest'>('rest');
  const [animating, setAnimating] = useState(false);
  const totalRounds = 3;
  const exhalesPerRound = 10;
  const done = round > totalRounds || sessionDone;

  const doExhale = () => {
    if (animating) return;
    setAnimating(true);
    setPhase('inhale');
    setTimeout(() => {
      setPhase('exhale');
      setTimeout(() => {
        setPhase('rest');
        setAnimating(false);
        const next = exhaleCount + 1;
        setExhaleCount(next);
        if (next >= exhalesPerRound) {
          setExhaleCount(0);
          const nextRound = round + 1;
          setRound(nextRound);
          if (nextRound > totalRounds) onDone();
        }
      }, 400);
    }, 800);
  };

  if (done) {
    return (
      <div className="space-y-4">
        <div className="card text-center py-6">
          <div className="text-3xl mb-2">💨</div>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>3 rounds complete</div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>You've purged {totalRounds * exhalesPerRound} exhales of tension.</p>
        </div>
        <AfterGauge pressureAfter={pressureAfter} setPressureAfter={setPressureAfter} color={color} />
        <button onClick={onFinish} disabled={submitting}
          className="w-full btn-primary flex items-center justify-center gap-2 text-sm"
          style={{ background: color }}>
          {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Check size={14} /> Complete & Get Reflection</>}
        </button>
      </div>
    );
  }

  const circleScale = phase === 'inhale' ? 'scale-110' : phase === 'exhale' ? 'scale-75' : 'scale-100';
  const instruction = phase === 'inhale' ? 'Inhale...' : phase === 'exhale' ? 'EXHALE HARD 💨' : 'Tap to exhale';

  return (
    <div className="space-y-4">
      <div className="card text-center space-y-5">
        <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          Round {round}/{totalRounds} · {exhaleCount}/{exhalesPerRound} exhales
        </div>

        <div className="flex gap-1 justify-center">
          {Array.from({ length: exhalesPerRound }).map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full transition-all"
              style={{ background: i < exhaleCount ? color : 'var(--progress-track)' }} />
          ))}
        </div>

        <button onClick={doExhale} disabled={animating}
          className={`w-32 h-32 rounded-full mx-auto flex flex-col items-center justify-center text-white font-bold transition-all duration-300 ${circleScale}`}
          style={{ background: `radial-gradient(circle, ${color}cc, ${color})`, boxShadow: phase === 'exhale' ? `0 0 30px ${color}80` : 'none' }}>
          <span className="text-2xl">{phase === 'exhale' ? '💨' : phase === 'inhale' ? '🫁' : '👆'}</span>
          <span className="text-xs mt-1 font-semibold">{instruction}</span>
        </button>

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Tap the circle to complete each exhale. Each forceful exhale purges tension.
        </p>

        <div className="flex gap-1">
          {[1, 2, 3].map(r => (
            <div key={r} className="flex-1 h-1.5 rounded-full"
              style={{ background: r < round ? color : r === round ? `${color}50` : 'var(--progress-track)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shake It Out ──────────────────────────────────────────────────────────
function ShakeItOut({ color, onDone, sessionDone, submitting, pressureAfter, setPressureAfter, onFinish }: {
  color: string; onDone: () => void; sessionDone: boolean; submitting: boolean;
  pressureAfter: number; setPressureAfter: (n: number) => void; onFinish: () => void;
}) {
  const [moveIdx, setMoveIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const done = moveIdx >= SHAKE_MOVES.length || sessionDone;

  const startMove = () => {
    setRunning(true);
    setTimeLeft(SHAKE_MOVES[moveIdx].seconds);
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          const next = moveIdx + 1;
          setMoveIdx(next);
          if (next >= SHAKE_MOVES.length) onDone();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  if (done) {
    return (
      <div className="space-y-4">
        <div className="card text-center py-6">
          <div className="text-3xl mb-2">🎉</div>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Adrenaline discharged!</div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your nervous system just got a reset.</p>
        </div>
        <AfterGauge pressureAfter={pressureAfter} setPressureAfter={setPressureAfter} color={color} />
        <button onClick={onFinish} disabled={submitting}
          className="w-full btn-primary flex items-center justify-center gap-2 text-sm"
          style={{ background: color }}>
          {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Check size={14} /> Complete & Get Reflection</>}
        </button>
      </div>
    );
  }

  const move = SHAKE_MOVES[moveIdx];
  const pct = running ? Math.round(((move.seconds - timeLeft) / move.seconds) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {SHAKE_MOVES.map((_, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
            style={{ background: i < moveIdx ? color : i === moveIdx ? `${color}60` : 'var(--progress-track)' }} />
        ))}
      </div>

      <div className="card text-center space-y-4">
        <div className={`text-6xl transition-transform ${running ? 'animate-bounce' : ''}`}>{move.emoji}</div>
        <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{move.label}</div>
        <p className="text-sm leading-relaxed px-2" style={{ color: 'var(--text-secondary)' }}>{move.instruction}</p>

        {running ? (
          <div className="space-y-2">
            <div className="h-2 rounded-full" style={{ background: 'var(--progress-track)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
            </div>
            <div className="text-2xl font-bold" style={{ color }}>{timeLeft}s</div>
          </div>
        ) : (
          <button onClick={startMove} className="mx-auto flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: color }}>
            <Play size={14} /> {moveIdx === 0 ? 'Start' : 'Next Movement'}
          </button>
        )}

        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Movement {moveIdx + 1} of {SHAKE_MOVES.length}
        </div>
      </div>
    </div>
  );
}

// ─── Vent to AI ────────────────────────────────────────────────────────────
function VentToAI({ color, onDone, submitting, pressureAfter, setPressureAfter }: {
  color: string; onDone: (content: string) => void; submitting: boolean;
  pressureAfter: number; setPressureAfter: (n: number) => void;
}) {
  const [text, setText] = useState('');
  const [readyToSubmit, setReadyToSubmit] = useState(false);

  return (
    <div className="space-y-4">
      <div className="card" style={{ borderLeft: `3px solid ${color}` }}>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Say everything that's on your mind. <strong>No filters, no editing.</strong> AI will respond with empathy only — no advice, no fixes. Just a space to be fully heard.
        </p>
      </div>

      <textarea value={text} onChange={e => { setText(e.target.value); if (e.target.value.length > 30) setReadyToSubmit(true); }}
        placeholder="What's pressing on you right now? Let it all out..."
        rows={10} className="input-field resize-none w-full text-sm"
        style={{ minHeight: '200px' }} />

      <div className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>{text.length} characters</div>

      {readyToSubmit && (
        <div className="space-y-3">
          <AfterGauge pressureAfter={pressureAfter} setPressureAfter={setPressureAfter} color={color} />
          <button onClick={() => onDone(text)} disabled={submitting || text.length < 10}
            className="w-full btn-primary flex items-center justify-center gap-2 text-sm"
            style={{ background: color }}>
            {submitting
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> AI is listening...</>
              : <><Send size={14} /> Send & Get AI Response</>}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Shared: After pressure gauge ─────────────────────────────────────────
function AfterGauge({ pressureAfter, setPressureAfter, color }: {
  pressureAfter: number; setPressureAfter: (n: number) => void; color: string;
}) {
  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>How much pressure now?</span>
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{PRESSURE_EMOJI(pressureAfter)}</span>
          <span className="text-lg font-bold" style={{ color: PRESSURE_COLOR(pressureAfter) }}>{pressureAfter}</span>
        </div>
      </div>
      <input type="range" min={1} max={10} value={pressureAfter}
        onChange={e => setPressureAfter(Number(e.target.value))}
        className="w-full" style={{ accentColor: color }} />
    </div>
  );
}
