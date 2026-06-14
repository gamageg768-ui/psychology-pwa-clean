'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Check, Clock } from 'lucide-react';
import { meditationApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const SESSIONS = [
  {
    id: 'box-breathing',
    title: 'Box Breathing',
    emoji: '🫁',
    duration: 5,
    color: '#06b6d4',
    description: 'Calm anxiety with 4-4-4-4 breath cycles',
    steps: [
      { label: 'Inhale', seconds: 4, instruction: 'Breathe in slowly through your nose... fill your lungs completely.' },
      { label: 'Hold', seconds: 4, instruction: 'Hold your breath gently. Stay calm and still.' },
      { label: 'Exhale', seconds: 4, instruction: 'Breathe out slowly through your mouth. Release all tension.' },
      { label: 'Hold', seconds: 4, instruction: 'Empty lungs, hold. Notice the stillness.' },
    ],
  },
  {
    id: 'body-scan',
    title: 'Body Scan',
    emoji: '🧘',
    duration: 10,
    color: '#8b5cf6',
    description: 'Release tension from head to toe',
    steps: [
      { label: 'Head & Face', seconds: 30, instruction: 'Close your eyes. Notice any tension in your forehead, jaw, or neck. Soften it completely.' },
      { label: 'Shoulders & Arms', seconds: 30, instruction: 'Drop your shoulders away from your ears. Feel your arms heavy and relaxed.' },
      { label: 'Chest & Belly', seconds: 30, instruction: 'Notice your breath rising and falling. Let your belly soften with each exhale.' },
      { label: 'Hips & Legs', seconds: 30, instruction: 'Feel the ground beneath you. Let your legs grow heavy and warm.' },
      { label: 'Feet', seconds: 30, instruction: 'Notice your feet. Wiggle your toes gently, then let them relax completely.' },
      { label: 'Whole Body', seconds: 30, instruction: 'Scan your whole body now. You are fully relaxed. Stay here as long as you like.' },
    ],
  },
  {
    id: 'loving-kindness',
    title: 'Loving Kindness',
    emoji: '💛',
    duration: 8,
    color: '#f59e0b',
    description: 'Cultivate compassion for yourself and others',
    steps: [
      { label: 'For Yourself', seconds: 60, instruction: 'Place your hand on your heart. Silently repeat: "May I be happy. May I be healthy. May I be at peace."' },
      { label: 'For a Loved One', seconds: 60, instruction: 'Bring someone you love to mind. Send them: "May you be happy. May you be healthy. May you be at peace."' },
      { label: 'For a Neutral Person', seconds: 60, instruction: 'Think of someone neutral in your life. Extend the same wish: "May you be happy. May you be at peace."' },
      { label: 'For All Beings', seconds: 60, instruction: 'Expand your heart to all beings everywhere. "May all beings be happy. May all beings be free."' },
    ],
  },
  {
    id: 'nsdr',
    title: 'NSDR Rest',
    emoji: '🌊',
    duration: 10,
    color: '#10b981',
    description: 'Non-sleep deep rest to restore focus',
    steps: [
      { label: 'Settle', seconds: 60, instruction: 'Lie down or sit comfortably. Close your eyes. You are safe. There is nowhere to be right now.' },
      { label: 'Body Weight', seconds: 60, instruction: 'Feel your body become heavy. Notice where you make contact with the surface beneath you. Sink deeper.' },
      { label: 'Breath Anchor', seconds: 90, instruction: 'Focus only on your breath. When your mind wanders, gently return to the sensation of breathing. No effort needed.' },
      { label: 'Delta Rest', seconds: 90, instruction: 'Let your mind drift toward sleep — but stay aware. You are in the liminal space between waking and sleeping. Rest here.' },
      { label: 'Return', seconds: 60, instruction: 'Gently bring your awareness back. Wiggle your fingers and toes. Take a deep breath. You have restored your nervous system.' },
    ],
  },
  {
    id: '4-7-8',
    title: '4-7-8 Breathing',
    emoji: '💨',
    duration: 5,
    color: '#6366f1',
    description: 'The natural tranquillizer technique',
    steps: [
      { label: 'Inhale', seconds: 4, instruction: 'Inhale quietly through your nose for 4 counts.' },
      { label: 'Hold', seconds: 7, instruction: 'Hold your breath for 7 counts. Stay relaxed.' },
      { label: 'Exhale', seconds: 8, instruction: 'Exhale completely through your mouth for 8 counts. Make a whoosh sound.' },
    ],
  },
  {
    id: 'visualization',
    title: 'Safe Place',
    emoji: '🌿',
    duration: 7,
    color: '#84cc16',
    description: 'Guided visualization to your inner sanctuary',
    steps: [
      { label: 'Arrive', seconds: 45, instruction: 'Close your eyes. Imagine a place where you feel completely safe and at peace. It can be real or imagined.' },
      { label: 'Look Around', seconds: 45, instruction: 'What do you see? Take in the colours, shapes, and light. Notice every beautiful detail.' },
      { label: 'Listen', seconds: 45, instruction: 'What sounds are there? Perhaps water, wind, birds, or gentle music. Let the sounds soothe you.' },
      { label: 'Feel', seconds: 45, instruction: 'Feel the air on your skin. The temperature. The ground beneath you. Fully inhabit this safe place.' },
      { label: 'Rest', seconds: 45, instruction: 'You are completely safe here. Nothing can harm you. Rest in this peace as long as you need.' },
    ],
  },
];

export default function MeditationPage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<typeof SESSIONS[0] | null>(null);
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [history, setHistory] = useState<{ type: string; duration: number; completed: boolean; created_at: string }[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    if (!user) return;
    const res = await meditationApi.list(user.id);
    setHistory(res.data);
  };

  const startSession = (session: typeof SESSIONS[0]) => {
    setSelected(session);
    setStepIdx(0);
    setTimeLeft(session.steps[0].seconds);
    setTotalElapsed(0);
    setCompleted(false);
    setActive(false);
  };

  const play = () => {
    if (!selected) return;
    setActive(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setStepIdx(si => {
            const next = si + 1;
            if (next >= selected.steps.length) {
              clearInterval(intervalRef.current!);
              setActive(false);
              setCompleted(true);
              meditationApi.log(user!.id, selected.id, selected.duration, true);
              return si;
            }
            setTimeLeft(selected.steps[next].seconds);
            return next;
          });
          return selected.steps[stepIdx + 1]?.seconds ?? 0;
        }
        setTotalElapsed(e => e + 1);
        return t - 1;
      });
    }, 1000);
  };

  const pause = () => {
    setActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const reset = () => {
    pause();
    if (!selected) return;
    setStepIdx(0);
    setTimeLeft(selected.steps[0].seconds);
    setTotalElapsed(0);
    setCompleted(false);
  };

  const totalSeconds = selected?.steps.reduce((s, st) => s + st.seconds, 0) ?? 0;
  const progressPct = totalSeconds ? Math.round((totalElapsed / totalSeconds) * 100) : 0;
  const currentStep = selected ? selected.steps[stepIdx] : null;
  const repeatCount = selected?.id === 'box-breathing' || selected?.id === '4-7-8' ? 6 : 1;

  if (selected) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => { reset(); setSelected(null); }} className="p-2 rounded-xl"
            style={{ background: 'var(--subtle-bg)', border: '1px solid var(--border)' }}>
            <RotateCcw size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{selected.emoji} {selected.title}</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{selected.duration} min · {selected.description}</p>
          </div>
        </div>

        {completed ? (
          <div className="card text-center py-10 space-y-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: `${selected.color}20` }}>
              <Check size={32} style={{ color: selected.color }} />
            </div>
            <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Session Complete</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Well done. Take a moment to notice how you feel.</p>
            <button onClick={() => { reset(); loadHistory(); }} className="btn-primary mx-auto mt-2">
              Return to Sessions
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="card text-center space-y-6">
              <div className="relative inline-flex items-center justify-center">
                <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
                  <circle cx="70" cy="70" r="60" fill="none" stroke="var(--progress-track)" strokeWidth="8" />
                  <circle cx="70" cy="70" r="60" fill="none" stroke={selected.color} strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 60}`}
                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - (currentStep ? (currentStep.seconds - timeLeft) / currentStep.seconds : 0))}`}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold" style={{ color: selected.color }}>{timeLeft}</span>
                  <span className="text-sm font-semibold mt-1" style={{ color: 'var(--text-secondary)' }}>{currentStep?.label}</span>
                </div>
              </div>

              <p className="text-sm leading-relaxed px-4" style={{ color: 'var(--text-secondary)' }}>
                {currentStep?.instruction}
              </p>

              <div className="flex items-center justify-between px-2">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Step {stepIdx + 1} of {selected.steps.length}
                  {repeatCount > 1 && ` · ${repeatCount} rounds`}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{progressPct}%</span>
              </div>

              <div className="h-1.5 rounded-full" style={{ background: 'var(--progress-track)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: selected.color }} />
              </div>

              <div className="flex items-center justify-center gap-4">
                <button onClick={reset} className="p-3 rounded-xl"
                  style={{ background: 'var(--subtle-bg)', border: '1px solid var(--border)' }}>
                  <RotateCcw size={18} style={{ color: 'var(--text-secondary)' }} />
                </button>
                <button onClick={active ? pause : play}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
                  style={{ background: selected.color }}>
                  {active ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              {selected.steps.map((_, i) => (
                <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
                  style={{ background: i < stepIdx ? selected.color : i === stepIdx ? `${selected.color}60` : 'var(--progress-track)' }} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const completedCount = history.filter(h => h.completed).length;
  const totalMinutes = history.filter(h => h.completed).reduce((s, h) => s + h.duration, 0);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Meditation Rooms</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Guided sessions for calm, focus, and rest</p>
      </div>

      {completedCount > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center py-4">
            <div className="text-2xl font-bold text-emerald-400">{completedCount}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Sessions Done</div>
          </div>
          <div className="card text-center py-4">
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-bold text-indigo-400">{totalMinutes}</span>
              <Clock size={14} className="text-indigo-400 mb-1" />
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Minutes Meditated</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SESSIONS.map(session => (
          <button key={session.id} onClick={() => startSession(session)}
            className="card text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ borderLeft: `3px solid ${session.color}` }}>
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">{session.emoji}</div>
              <div>
                <div className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>{session.title}</div>
                <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{session.description}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${session.color}20`, color: session.color }}>
                    {session.duration} min
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {session.steps.length} steps
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
