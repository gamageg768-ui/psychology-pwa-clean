'use client';

import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Clock, ChevronRight, Trophy, ArrowLeft, Check, X } from 'lucide-react';
import { coursesApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const COURSES = [
  {
    id: 'dbt-distress',
    title: 'DBT Distress Tolerance',
    emoji: '🌊',
    color: '#06b6d4',
    duration: 8,
    category: 'DBT',
    description: 'Evidence-based skills to tolerate emotional pain without making things worse.',
    steps: [
      { title: 'What is Distress Tolerance?', content: 'Distress tolerance skills help you survive emotional crises without making the situation worse. Unlike other DBT skills that aim to change emotions, these skills accept the current moment as it is. The goal is to tolerate pain skillfully — not forever, just for now.' },
      { title: 'TIPP: Temperature', content: 'TIPP stands for Temperature, Intense exercise, Paced breathing, and Paired muscle relaxation. Temperature works fast: hold ice cubes, splash cold water on your face, or put your face in a bowl of cold water for 30 seconds. Cold activates the dive reflex, slowing your heart rate and calming your body chemistry within seconds.' },
      { title: 'TIPP: Intense Exercise', content: 'When emotions are overwhelming, intense physical activity burns off stress hormones. Run hard, do jumping jacks, sprint up stairs. Even 10 minutes of vigorous movement can dramatically reduce the intensity of a crisis emotion. Your body must be involved, not just your mind.' },
      { title: 'TIPP: Paced Breathing', content: 'Slow your breath to 5–6 breaths per minute by making your exhale longer than your inhale. Try inhaling for 4 counts and exhaling for 6 counts. A longer exhale activates the parasympathetic nervous system and down-regulates your emotional brain (amygdala) within minutes.' },
      { title: 'ACCEPTS Distraction', content: 'ACCEPTS is a distraction toolkit: Activities (do something engaging), Contributing (help someone), Comparisons (compare situation to worse times), Emotions (create opposite emotions via movies/music), Pushing away (mentally shelve the problem), Thoughts (count, memorise, do a puzzle), Sensations (use strong but safe sensations like ice or spicy food).' },
      { title: 'Self-Soothe with 5 Senses', content: 'Soothe yourself through each sense: Vision (look at nature or art), Hearing (calming music or sounds), Smell (a candle, coffee, essential oils), Taste (a favourite food or warm drink), Touch (a soft blanket, pet an animal, take a warm bath). This activates the body\'s natural calming response.' },
    ],
    quiz: [
      { q: 'What does the T in TIPP stand for?', options: ['Temperature', 'Thoughts', 'Touch', 'Tolerance'], answer: 0 },
      { q: 'Which breathing pattern calms the nervous system fastest?', options: ['Equal in/out', 'Longer exhale than inhale', 'Breath holding', 'Rapid breathing'], answer: 1 },
      { q: 'ACCEPTS is a tool for:', options: ['Changing emotions', 'Solving problems', 'Distraction during crisis', 'Improving relationships'], answer: 2 },
    ],
  },
  {
    id: 'act-defusion',
    title: 'ACT Cognitive Defusion',
    emoji: '🍃',
    color: '#10b981',
    duration: 7,
    category: 'ACT',
    description: 'Learn to observe thoughts without being controlled by them.',
    steps: [
      { title: 'Thoughts Are Not Facts', content: 'Cognitive defusion is an ACT technique that changes your relationship to thoughts, rather than trying to change the thoughts themselves. The goal is to see thoughts as just thoughts — mental events passing through — not as facts, commands, or the truth about reality. You are not your thoughts; you are the one observing them.' },
      { title: 'Leaves on a Stream', content: 'Visualisation: Imagine sitting beside a gently flowing stream. Every thought that arises, place it on a leaf and watch it float downstream. You don\'t need to fight it or hold onto it. When a thought hooks you, gently notice that you got caught, place it on a leaf, and return to watching. Practise for 5 minutes.' },
      { title: 'I\'m Having the Thought That...', content: 'Add a prefix to your thoughts: Instead of "I\'m worthless," say "I\'m having the thought that I\'m worthless." Instead of "This is too hard," say "I notice I\'m having the feeling that this is too hard." This small linguistic shift creates psychological distance and reduces the thought\'s power over your behaviour.' },
      { title: 'Milk, Milk, Milk', content: 'Say the word "milk" slowly. Notice the image, taste, and meaning it evokes. Now repeat "milk" rapidly for 30 seconds. After a while, it becomes just a sound — the meaning dissolves. This works for distressing words too: repeat a feared word until it loses its sting, becoming just noise.' },
      { title: 'Name Your Storyteller', content: 'Give your inner critic a name — "Radio Drama" or "The Doom Machine." When negative thoughts arise, say "Oh, the Doom Machine is on again." This creates distance. You can then ask: "Is listening to this story helping me move toward the life I want?" If not, you can choose to let it play in the background without being controlled by it.' },
    ],
    quiz: [
      { q: 'The goal of cognitive defusion is to:', options: ['Stop negative thoughts', 'Change thoughts to positive', 'Change your relationship to thoughts', 'Ignore all thoughts'], answer: 2 },
      { q: 'The leaves on a stream exercise develops:', options: ['Positive thinking', 'Thought observing', 'Problem solving', 'Memory'], answer: 1 },
      { q: '"I\'m having the thought that..." creates:', options: ['More sadness', 'Psychological distance from thoughts', 'Positive affirmations', 'Deeper emotions'], answer: 1 },
    ],
  },
  {
    id: 'mindfulness-basics',
    title: 'Mindfulness Foundations',
    emoji: '🧘',
    color: '#8b5cf6',
    duration: 10,
    category: 'Mindfulness',
    description: 'Build a practical mindfulness practice from the ground up.',
    steps: [
      { title: 'What Mindfulness Actually Is', content: 'Mindfulness is deliberately paying attention to the present moment — thoughts, feelings, and sensations — with an attitude of curiosity and non-judgment. It is not about emptying your mind, being calm, or being spiritual. It is a trainable skill that rewires the brain over time, reducing stress, improving focus, and increasing emotional resilience.' },
      { title: 'The Anchor Breath', content: 'Sit comfortably. Focus entirely on the sensation of breathing — the air entering your nostrils, your chest rising, your belly falling. When your mind wanders (it will, and that\'s normal), gently notice it has wandered, and return your focus to the breath. That moment of noticing and returning IS the practice. Do this for 5 minutes daily.' },
      { title: 'The STOP Technique', content: 'STOP is mindfulness you can do anywhere: Stop what you\'re doing. Take a deep breath. Observe — what are you thinking, feeling, experiencing right now? Proceed with awareness. Use STOP when you\'re stressed, overwhelmed, or on autopilot. 30 seconds of STOP can interrupt a negative spiral.' },
      { title: 'Mindful Daily Activities', content: 'Formal meditation is valuable, but informal mindfulness is even more transformative. Choose one daily activity — teeth brushing, showering, eating — and do it with full attention every day. Notice textures, temperatures, flavours, sounds. This trains your brain to be present during ordinary moments, which is when most of our happiness or suffering occurs.' },
      { title: 'Working with Difficult Emotions', content: 'When a difficult emotion arises: Name it — "I notice anger." Locate it in your body — "Tension in my chest." Breathe into it gently. Stay curious. Say: "It\'s okay to feel this. Emotions are not permanent." Research shows that labelling emotions activates the prefrontal cortex and reduces amygdala reactivity — the science behind "name it to tame it."' },
    ],
    quiz: [
      { q: 'Mindfulness is primarily about:', options: ['Emptying your mind', 'Paying attention to the present with curiosity', 'Achieving calm all the time', 'Avoiding difficult thoughts'], answer: 1 },
      { q: 'What does STOP stand for?', options: ['Stop, Think, Observe, Proceed', 'Stop, Take a breath, Observe, Proceed', 'Sit, Think, Open, Pause', 'Stay, Take a breath, Open, Pray'], answer: 1 },
      { q: '"Name it to tame it" refers to:', options: ['Giving your anxiety a nickname', 'Labelling emotions to reduce their intensity', 'Naming your therapist', 'Naming the problem you want to solve'], answer: 1 },
    ],
  },
  {
    id: 'stress-inoculation',
    title: 'Stress Inoculation Training',
    emoji: '🛡️',
    color: '#f59e0b',
    duration: 9,
    category: 'CBT',
    description: 'Build psychological resilience to stress before it strikes.',
    steps: [
      { title: 'What is Stress Inoculation?', content: 'Stress Inoculation Training (SIT) was developed by Donald Meichenbaum. Like a vaccine exposes you to a small amount of a pathogen to build immunity, SIT exposes you to manageable doses of stress to build psychological resilience. It has three phases: education, rehearsal, and application — and it works for anxiety, PTSD, and everyday stress.' },
      { title: 'Phase 1: Understanding Your Stress Response', content: 'Your stress response is an ancient survival system: the amygdala detects threat → releases adrenaline and cortisol → heart rate increases, digestion slows, muscles tense, thinking narrows. This is helpful for immediate threats, but chronically activated, it causes anxiety, burnout, and health problems. Understanding this demystifies the physical sensations of stress.' },
      { title: 'Phase 2: Coping Skills Menu', content: 'Build your personal coping menu across 4 domains: Physical (deep breathing, exercise, cold exposure, sleep). Cognitive (reframing, problem-solving, thought records). Emotional (journaling, talking to someone, self-compassion). Behavioural (scheduling pleasant activities, reducing avoidance). Having a menu means you always have a tool ready for different stress types.' },
      { title: 'Phase 3: Mental Rehearsal', content: 'Visualise upcoming stressors in detail. Imagine the scenario: see it, feel it, notice your stress response activating. Then rehearse your coping response step by step. Hear yourself using calming self-talk: "I\'ve prepared for this." "I can manage discomfort." Visualise successfully navigating the situation. Mental rehearsal primes your nervous system for real events.' },
      { title: 'Inoculation Statements', content: 'Create personal stress inoculation statements for each phase of a stressor: Preparing: "I\'ve prepared. I can handle this." During: "Breathe. One step at a time. Feeling stressed is normal." Coping with feeling overwhelmed: "I can still function even if uncomfortable." Reflecting after: "I handled it. I\'m building resilience." Write these and carry them with you.' },
    ],
    quiz: [
      { q: 'SIT stands for:', options: ['Sitting in Tension', 'Stress Inoculation Training', 'Systematic Integrative Therapy', 'Stress Impact Technique'], answer: 1 },
      { q: 'Mental rehearsal works because:', options: ['It makes problems disappear', 'It primes the nervous system for real events', 'It reduces stress permanently', 'It replaces therapy'], answer: 1 },
      { q: 'Stress inoculation statements should be used:', options: ['Only before the stressor', 'During and after the stressor as well', 'Only when feeling calm', 'Only with a therapist'], answer: 1 },
    ],
  },
];

interface Progress { steps_done: number[]; completed: boolean; quiz_score?: number; }

export default function CoursesPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [selected, setSelected] = useState<typeof COURSES[0] | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [inQuiz, setInQuiz] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizDone, setQuizDone] = useState(false);

  useEffect(() => { loadProgress(); }, []);

  const loadProgress = async () => {
    if (!user) return;
    const entries: Record<string, Progress> = {};
    for (const course of COURSES) {
      try {
        const res = await coursesApi.getProgress(user.id, course.id);
        entries[course.id] = res.data;
      } catch { entries[course.id] = { steps_done: [], completed: false }; }
    }
    setProgress(entries);
  };

  const openCourse = (course: typeof COURSES[0]) => {
    const prog = progress[course.id] ?? { steps_done: [], completed: false };
    const nextStep = prog.steps_done.length < course.steps.length ? prog.steps_done.length : 0;
    setSelected(course);
    setStepIdx(nextStep);
    setInQuiz(false);
    setAnswers({});
    setQuizDone(false);
  };

  const completeStep = async (idx: number) => {
    if (!user || !selected) return;
    const prog = progress[selected.id] ?? { steps_done: [], completed: false };
    const newDone = Array.from(new Set([...prog.steps_done, idx]));
    const isLast = newDone.length >= selected.steps.length;
    await coursesApi.saveProgress(user.id, selected.id, newDone, false);
    setProgress(p => ({ ...p, [selected.id]: { ...prog, steps_done: newDone } }));
    if (isLast) {
      setInQuiz(true);
    } else {
      setStepIdx(idx + 1);
    }
  };

  const submitQuiz = async () => {
    if (!user || !selected) return;
    const score = selected.quiz.filter((q, i) => answers[i] === q.answer).length;
    const pct = Math.round((score / selected.quiz.length) * 100);
    await coursesApi.saveProgress(user.id, selected.id, selected.steps.map((_, i) => i), true, pct);
    setProgress(p => ({ ...p, [selected.id]: { steps_done: selected.steps.map((_, i) => i), completed: true, quiz_score: pct } }));
    setQuizDone(true);
  };

  if (selected) {
    const prog = progress[selected.id] ?? { steps_done: [], completed: false };
    const step = selected.steps[stepIdx];
    const isDone = prog.steps_done.includes(stepIdx);

    if (inQuiz && !quizDone) {
      return (
        <div className="space-y-6 pb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setInQuiz(false)} className="p-2 rounded-xl" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--border)' }}>
              <ArrowLeft size={16} style={{ color: 'var(--text-secondary)' }} />
            </button>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Knowledge Check</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{selected.title}</p>
            </div>
          </div>
          <div className="space-y-4">
            {selected.quiz.map((q, qi) => (
              <div key={qi} className="card space-y-3">
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{qi + 1}. {q.q}</div>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <button key={oi} onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}
                      className="w-full text-left p-3 rounded-xl text-sm transition-all"
                      style={{
                        background: answers[qi] === oi ? 'rgba(99,102,241,0.15)' : 'var(--subtle-bg)',
                        border: `1px solid ${answers[qi] === oi ? '#6366f1' : 'var(--border)'}`,
                        color: answers[qi] === oi ? '#818cf8' : 'var(--text-secondary)',
                      }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={submitQuiz} disabled={Object.keys(answers).length < selected.quiz.length}
              className="btn-primary w-full">Submit Quiz</button>
          </div>
        </div>
      );
    }

    if (quizDone) {
      const score = prog.quiz_score ?? 0;
      return (
        <div className="space-y-6 pb-8">
          <div className="card text-center py-10 space-y-3">
            <Trophy size={40} className="mx-auto" style={{ color: '#f59e0b' }} />
            <div className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Course Complete! 🎉</div>
            <div className="text-3xl font-bold" style={{ color: score >= 70 ? '#10b981' : '#f59e0b' }}>{score}%</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {score === 100 ? 'Perfect score! You mastered this skill.' : score >= 70 ? 'Great job! You have a solid understanding.' : 'Good effort! Re-read the material to reinforce your learning.'}
            </p>
            <button onClick={() => { setSelected(null); loadProgress(); }} className="btn-primary mx-auto mt-2">
              Back to Courses
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelected(null)} className="p-2 rounded-xl" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--border)' }}>
            <ArrowLeft size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{selected.emoji} {selected.title}</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Step {stepIdx + 1} of {selected.steps.length}</p>
          </div>
        </div>

        <div className="flex gap-1">
          {selected.steps.map((_, i) => (
            <button key={i} onClick={() => setStepIdx(i)}
              className="flex-1 h-1.5 rounded-full transition-all"
              style={{ background: prog.steps_done.includes(i) ? selected.color : i === stepIdx ? `${selected.color}60` : 'var(--progress-track)' }} />
          ))}
        </div>

        <div className="card space-y-4">
          <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{step.content}</p>
          <button onClick={() => completeStep(stepIdx)} disabled={isDone}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${isDone ? 'opacity-60' : ''}`}
            style={{ background: isDone ? 'var(--subtle-bg)' : selected.color, color: isDone ? 'var(--text-muted)' : 'white', border: isDone ? '1px solid var(--border)' : 'none' }}>
            {isDone ? <><Check size={14} /> Already Completed</> : prog.steps_done.length === selected.steps.length - 1 ? 'Complete & Take Quiz' : 'Mark Complete & Next'}
          </button>
        </div>

        <div className="space-y-1">
          {selected.steps.map((s, i) => (
            <button key={i} onClick={() => setStepIdx(i)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all"
              style={{ background: i === stepIdx ? `${selected.color}10` : 'transparent' }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: prog.steps_done.includes(i) ? selected.color : 'var(--subtle-bg)', border: `1px solid ${prog.steps_done.includes(i) ? selected.color : 'var(--border)'}` }}>
                {prog.steps_done.includes(i) && <Check size={10} className="text-white" />}
              </div>
              <span className="text-xs" style={{ color: i === stepIdx ? selected.color : 'var(--text-secondary)' }}>{s.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const completedCount = Object.values(progress).filter(p => p.completed).length;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Skill Library</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Evidence-based micro-courses for mental resilience</p>
      </div>

      {completedCount > 0 && (
        <div className="card flex items-center gap-3 py-3">
          <Trophy size={20} style={{ color: '#f59e0b' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{completedCount} of {COURSES.length} courses completed</span>
        </div>
      )}

      <div className="space-y-3">
        {COURSES.map(course => {
          const prog = progress[course.id] ?? { steps_done: [], completed: false };
          const pct = Math.round((prog.steps_done.length / course.steps.length) * 100);
          return (
            <button key={course.id} onClick={() => openCourse(course)}
              className="card w-full text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ borderLeft: `3px solid ${course.color}` }}>
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">{course.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{course.title}</span>
                    {prog.completed
                      ? <CheckCircle size={16} style={{ color: course.color, flexShrink: 0 }} />
                      : <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                  </div>
                  <p className="text-xs mt-0.5 mb-2" style={{ color: 'var(--text-muted)' }}>{course.description}</p>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${course.color}15`, color: course.color }}>{course.category}</span>
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <Clock size={10} /> {course.duration} min
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{course.steps.length} lessons</span>
                    {prog.quiz_score !== undefined && (
                      <span className="text-xs font-semibold" style={{ color: course.color }}>{prog.quiz_score}% quiz</span>
                    )}
                  </div>
                  {prog.steps_done.length > 0 && (
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--progress-track)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: course.color }} />
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
