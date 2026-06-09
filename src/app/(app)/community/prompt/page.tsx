'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ReactionBar from '@/components/ReactionBar';
import { formatDistanceToNow } from 'date-fns';

interface Prompt { id: number; date: string; question: string; }
interface Response { id: number; userId: number; content: string; anonName: string; reactions: Record<string, number>; createdAt: string; }

export default function DailyPromptPage() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!user) return;
    const r = await fetch(`/api/community/prompt?user_id=${user.id}`);
    const data = await r.json();
    setPrompt(data.prompt);
    setResponses(data.responses);
    setHasAnswered(data.hasAnswered);
  };

  useEffect(() => { load(); }, [user]);

  const submit = async () => {
    if (!user || !prompt || !answer.trim()) return;
    setSubmitting(true);
    try {
      const r = await fetch('/api/community/prompt/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, prompt_id: prompt.id, content: answer }),
      });
      if (r.ok) {
        const resp = await r.json();
        setResponses(prev => [resp, ...prev]);
        setHasAnswered(true);
        setAnswer('');
      }
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Today's Prompt</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>One shared question for the community</p>
      </div>

      {prompt && (
        <div className="card" style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.3)' }}>
          <p className="text-base font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            ✨ {prompt.question}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{responses.length} responses · resets daily</p>
        </div>
      )}

      {!hasAnswered ? (
        <div className="card">
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value.slice(0, 500))}
            placeholder="Share your answer anonymously..."
            className="input-field resize-none"
            rows={3}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{answer.length}/500</span>
            <button onClick={submit} disabled={submitting || !answer.trim()} className="btn-primary text-sm py-2 px-4">
              {submitting ? 'Sharing...' : 'Share Answer'}
            </button>
          </div>
        </div>
      ) : (
        <div className="card py-3 text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>✓ You've answered today's prompt</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Come back tomorrow for a new question</p>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Community Responses ({responses.length})</h3>
        {responses.map(r => (
          <div key={r.id} className="card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-300">
                {r.anonName.charAt(0)}
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.anonName}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.content}</p>
            <ReactionBar reactions={r.reactions} targetType="prompt_response" targetId={r.id} />
          </div>
        ))}
        {responses.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No responses yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
