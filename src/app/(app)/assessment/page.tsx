'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { assessmentApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Assessment } from '@/types';
import { format } from 'date-fns';

const ASSESSMENTS = [
  {
    type: 'PHQ-9 (Depression)', desc: 'Patient Health Questionnaire for depression screening', emoji: '💙',
    questions: [
      'Little interest or pleasure in doing things', 'Feeling down, depressed, or hopeless',
      'Trouble falling or staying asleep, or sleeping too much', 'Feeling tired or having little energy',
      'Poor appetite or overeating', 'Feeling bad about yourself or that you are a failure',
      'Trouble concentrating on things', 'Moving or speaking slowly — or being fidgety or restless',
      'Thoughts that you would be better off dead or of hurting yourself',
    ],
    scale: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
  },
  {
    type: 'GAD-7 (Anxiety)', desc: 'Generalized Anxiety Disorder 7-item scale', emoji: '🌊',
    questions: [
      'Feeling nervous, anxious or on edge', 'Not being able to stop or control worrying',
      'Worrying too much about different things', 'Trouble relaxing',
      'Being so restless that it is hard to sit still', 'Becoming easily annoyed or irritable',
      'Feeling afraid as if something awful might happen',
    ],
    scale: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
  },
  {
    type: 'Wellbeing (WEMWBS)', desc: 'Warwick-Edinburgh Mental Wellbeing Scale', emoji: '🌟',
    questions: [
      "I've been feeling optimistic about the future", "I've been feeling useful", "I've been feeling relaxed",
      "I've been feeling interested in other people", "I've had energy to spare",
      "I've been dealing with problems well", "I've been thinking clearly",
    ],
    scale: ['None of the time', 'Rarely', 'Some of the time', 'Often', 'All of the time'],
  },
  {
    type: 'Stress (PSS-10)', desc: 'Perceived Stress Scale', emoji: '🔥',
    questions: [
      'Been upset because of something unexpected', 'Felt unable to control the important things in your life',
      'Felt nervous and stressed', 'Felt confident about your ability to handle personal problems',
      'Felt that things were going your way', 'Found that you could not cope with all the things you had to do',
      'Been able to control irritations in your life', 'Felt that you were on top of things',
      'Been angered by things outside your control', 'Felt difficulties were piling up so high you could not overcome them',
    ],
    scale: ['Never', 'Almost Never', 'Sometimes', 'Fairly Often', 'Very Often'],
  },
  {
    type: 'Insomnia (ISI)', desc: 'Insomnia Severity Index — sleep difficulty screening', emoji: '😴',
    questions: [
      'Difficulty falling asleep', 'Difficulty staying asleep', 'Problems waking up too early',
      'How satisfied are you with your current sleep pattern',
      'How noticeable to others do you think your sleep problem is',
      'How worried are you about your current sleep problem',
      'To what extent does your sleep problem interfere with your daily functioning',
    ],
    scale: ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'],
  },
  {
    type: 'Trauma (PC-PTSD-5)', desc: 'Primary Care PTSD Screen — trauma and stress response', emoji: '🛡️',
    questions: [
      'Repeated, disturbing memories or dreams related to a stressful experience',
      'Avoiding external reminders of a stressful experience',
      'Feeling distant or cut off from other people',
      'Feeling irritable or having angry outbursts',
      'Being "super-alert," watchful, or on guard',
    ],
    scale: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely'],
  },
  {
    type: 'Social Anxiety (MINI-SPIN)', desc: 'Mini Social Phobia Inventory — social anxiety screening', emoji: '🫂',
    questions: [
      'Fear of embarrassment causes me to avoid doing things or speaking to people',
      'I avoid activities in which I am the center of attention',
      'Being embarrassed or looking stupid are among my worst fears',
      'I feel tense when meeting people I don\'t know',
      'I am afraid of giving speeches or presentations',
      'I avoid speaking to people in authority',
    ],
    scale: ['Not at all', 'A little', 'Somewhat', 'Very much', 'Extremely'],
  },
  {
    type: 'Resilience (BRS)', desc: 'Brief Resilience Scale — ability to bounce back from stress', emoji: '💪',
    questions: [
      'I tend to bounce back quickly after hard times',
      'I have a hard time making it through stressful events',
      'It does not take me long to recover from a stressful event',
      'It is hard for me to snap back when something bad happens',
      'I usually come through difficult times with little trouble',
      'I tend to take a long time to get over setbacks in my life',
    ],
    scale: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  },
  {
    type: 'Self-Compassion (SCS-SF)', desc: 'Self-Compassion Scale (Short Form) — how kindly you treat yourself', emoji: '🤍',
    questions: [
      'When I fail at something important to me I become consumed by feelings of inadequacy',
      'I try to be understanding and patient towards aspects of my personality I don\'t like',
      'When something painful happens I try to take a balanced view of the situation',
      'When I\'m feeling down I tend to feel like most other people are probably happier than I am',
      'I try to see my failings as part of the human condition',
      'When I\'m going through a very hard time I give myself the caring and tenderness I need',
      'When something upsets me I try to keep my emotions in balance',
      'When I fail at something important to me I tend to feel alone in my failure',
      'When I\'m feeling down I tend to obsess and fixate on everything that\'s wrong',
      'When I feel inadequate in some way I try to remind myself that feelings of inadequacy are shared by most people',
      'I\'m disapproving and judgmental about my own flaws and inadequacies',
      'I\'m intolerant and impatient with those aspects of my personality I don\'t like',
    ],
    scale: ['Almost Never', 'Rarely', 'Sometimes', 'Often', 'Almost Always'],
  },
  {
    type: 'Loneliness (UCLA)', desc: 'UCLA Loneliness Scale — feelings of social isolation', emoji: '🌐',
    questions: [
      'How often do you feel that you lack companionship',
      'How often do you feel left out',
      'How often do you feel isolated from others',
      'How often do you feel that people are around you but not with you',
      'How often do you feel that your relationships lack meaning',
      'How often do you feel that no one really knows you well',
    ],
    scale: ['Never', 'Rarely', 'Sometimes', 'Always'],
  },
  {
    type: 'Burnout Screening', desc: 'Professional burnout screening — exhaustion and disengagement', emoji: '🔋',
    questions: [
      'I feel emotionally drained from my work or responsibilities',
      'I feel used up at the end of the workday',
      'I feel fatigued when I face another day of work',
      'Working with people all day puts great strain on me',
      'I feel burned out from my work',
      'I feel frustrated by my role or responsibilities',
      'I feel I\'m working too hard in my role',
      'I feel my contributions don\'t make a real difference',
      'I have become less interested in my work since I started this job',
    ],
    scale: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  },
  {
    type: 'Life Satisfaction (SWLS)', desc: 'Satisfaction with Life Scale — overall life contentment', emoji: '✨',
    questions: [
      'In most ways my life is close to my ideal',
      'The conditions of my life are excellent',
      'I am satisfied with my life',
      'So far I have gotten the important things I want in life',
      'If I could live my life over I would change almost nothing',
    ],
    scale: ['Strongly Disagree', 'Disagree', 'Neither Agree nor Disagree', 'Agree', 'Strongly Agree'],
  },
  {
    type: 'Emotion Regulation (DERS-SF)', desc: 'Emotional Regulation Difficulties — how well you manage emotions', emoji: '🌀',
    questions: [
      'When I\'m upset I have difficulty controlling my behaviors',
      'When I\'m upset I become out of control',
      'When I\'m upset I have difficulty thinking about anything else',
      'When I\'m upset I feel ashamed at myself for feeling that way',
      'When I\'m upset I have difficulty focusing on other things',
      'When I\'m upset I believe that I will end up feeling very depressed',
      'When I\'m upset I have difficulty accepting my emotional state',
      'When I\'m upset it takes me a long time to feel better',
    ],
    scale: ['Almost Never', 'Sometimes', 'About Half the Time', 'Most of the Time', 'Almost Always'],
  },
  {
    type: 'Mindfulness (MAAS-SF)', desc: 'Mindful Attention Awareness — present-moment awareness', emoji: '🧘',
    questions: [
      'I find it difficult to stay focused on what\'s happening in the present',
      'I rush through activities without being attentive to them',
      'I find myself doing things without paying attention',
      'I tend not to notice feelings of physical tension or discomfort until they really grab my attention',
      'I forget a person\'s name almost as soon as I\'ve been told it',
      'It seems I am "running on automatic" without much awareness of what I\'m doing',
    ],
    scale: ['Almost Always', 'Very Frequently', 'Somewhat Frequently', 'Somewhat Infrequently', 'Almost Never'],
  },
  {
    type: 'Anger & Irritability', desc: 'Anger and Irritability Screening — emotional reactivity', emoji: '🌋',
    questions: [
      'I feel angry about things that happened in the past',
      'I feel irritated when I don\'t get my way',
      'I lose my temper easily',
      'When I\'m frustrated I feel like hitting or throwing something',
      'Others tell me I have a quick temper',
      'I say negative things when I\'m angry that I later regret',
    ],
    scale: ['Never', 'Sometimes', 'Often', 'Always'],
  },
];

const getScoreColor = (score: number) => {
  if (score < 4) return 'text-calm-400'; if (score < 7) return 'text-yellow-400'; return 'text-red-400';
};

export default function AssessmentPage() {
  const { user } = useAuth();
  const [view, setView] = useState<'list' | 'taking' | 'result' | 'history'>('list');
  const [selected, setSelected] = useState<(typeof ASSESSMENTS)[0] | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Assessment[]>([]);

  useEffect(() => {
    if (user) assessmentApi.list(user.id).then(r => setHistory(r.data)).catch(() => {});
  }, []);

  const startAssessment = (a: (typeof ASSESSMENTS)[0]) => {
    setSelected(a); setAnswers([]); setCurrent(0); setResult(null); setView('taking');
  };

  const answer = async (val: number) => {
    const newAnswers = [...answers, val];
    setAnswers(newAnswers);
    if (current + 1 < selected!.questions.length) {
      setCurrent(current + 1);
    } else {
      setLoading(true);
      try {
        const res = await assessmentApi.submit(user!.id, selected!.type, newAnswers);
        setResult(res.data); setView('result');
        assessmentApi.list(user!.id).then(r => setHistory(r.data)).catch(() => {});
      } catch {
        setResult({ id: 0, assessment_type: selected!.type, score: 0, interpretation: 'Error', ai_report: 'Could not get AI report.', created_at: new Date().toISOString() });
        setView('result');
      }
      setLoading(false);
    }
  };

  if (view === 'result' && result) return (
    <div className="space-y-4 pb-8">
      <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-400 hover:text-white">
        <ChevronLeft size={18} /> Back
      </button>
      <div className="card text-center">
        <div className="text-5xl mb-2">{selected?.emoji}</div>
        <h3 className="font-bold text-white text-lg">{result.assessment_type}</h3>
        <div className={`text-4xl font-bold mt-3 ${getScoreColor(result.score)}`}>
          {result.score.toFixed(1)}<span className="text-lg text-slate-500">/10</span>
        </div>
        <div className={`text-sm mt-1 font-medium ${getScoreColor(result.score)}`}>{result.interpretation}</div>
        <div className="mt-4 w-full bg-slate-800 rounded-full h-3">
          <div className="h-3 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all" style={{ width: `${result.score * 10}%` }} />
        </div>
      </div>
      <div className="glass rounded-2xl p-5 border border-primary-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-primary-400" />
          <span className="font-semibold text-primary-300">AI Clinical Reflection</span>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{result.ai_report}</p>
      </div>
      <div className="glass rounded-2xl p-4 border border-yellow-500/20 bg-yellow-500/5">
        <p className="text-xs text-slate-400">⚠️ <strong className="text-white">Disclaimer:</strong> This is a wellness screening tool, not a clinical diagnosis. Please consult a licensed mental health professional for proper evaluation.</p>
      </div>
      <button onClick={() => setView('list')} className="btn-primary w-full">Take Another Assessment</button>
    </div>
  );

  if (view === 'taking' && selected) {
    const progress = (current / selected.questions.length) * 100;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')} className="text-slate-400 hover:text-white"><ChevronLeft size={20} /></button>
          <div className="flex-1">
            <div className="flex justify-between text-sm text-slate-400 mb-1">
              <span>{selected.type}</span><span>{current + 1}/{selected.questions.length}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Analyzing your responses...</p>
          </div>
        ) : (
          <div className="card">
            <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Question {current + 1}</div>
            <p className="text-white text-lg font-medium leading-relaxed mb-6">{selected.questions[current]}</p>
            <p className="text-xs text-slate-400 mb-3">Over the last 2 weeks, how often...</p>
            <div className="space-y-3">
              {selected.scale.map((label, i) => (
                <button key={i} onClick={() => answer(i + 1)}
                  className="w-full text-left glass rounded-xl p-4 hover:border-primary-500/50 hover:bg-primary-500/10 transition-all flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center text-primary-300 font-bold text-sm">{i + 1}</div>
                  <span className="text-slate-300">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Assessments</h2>
          <p className="text-sm text-slate-400">Evidence-based mental health screenings</p>
        </div>
        {history.length > 0 && (
          <button onClick={() => setView(view === 'history' ? 'list' : 'history')} className="text-primary-400 text-sm hover:text-primary-300">History</button>
        )}
      </div>
      {view !== 'history' && (
        <div className="space-y-3">
          {ASSESSMENTS.map(a => (
            <button key={a.type} onClick={() => startAssessment(a)}
              className="w-full card text-left glass-hover flex items-center gap-4">
              <span className="text-3xl">{a.emoji}</span>
              <div className="flex-1">
                <div className="font-semibold text-white">{a.type}</div>
                <div className="text-sm text-slate-400">{a.desc}</div>
                <div className="text-xs text-slate-500 mt-1">{a.questions.length} questions • ~3 min</div>
              </div>
            </button>
          ))}
        </div>
      )}
      {view === 'history' && history.length > 0 && (
        <div>
          <h3 className="font-semibold text-white mb-3">Past Assessments</h3>
          <div className="space-y-2">
            {history.map(h => (
              <div key={h.id} className="glass rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{h.assessment_type}</span>
                  <span className={`font-bold ${getScoreColor(h.score)}`}>{h.score.toFixed(1)}/10</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">{h.interpretation}</div>
                <div className="text-xs text-slate-500 mt-1">{format(new Date(h.created_at), 'MMM d, yyyy')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
