'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ReactionBar from '@/components/ReactionBar';
import { formatDistanceToNow } from 'date-fns';

interface Post { id: number; userId: number; content: string; anonName: string; reactions: Record<string, number>; createdAt: string; }

export default function GratitudeWallPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'today' | 'week' | 'all'>('all');

  useEffect(() => {
    fetch('/api/community/posts?type=gratitude&page=0')
      .then(r => r.json()).then(setPosts).catch(() => {});
  }, []);

  const submit = async () => {
    if (!user || !content.trim()) return;
    setSubmitting(true);
    try {
      const r = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, content: content.slice(0, 200), post_type: 'gratitude' }),
      });
      const post = await r.json();
      setPosts(prev => [post, ...prev]);
      setContent('');
    } finally { setSubmitting(false); }
  };

  const now = new Date();
  const filtered = posts.filter(p => {
    if (filter === 'today') return new Date(p.createdAt).toDateString() === now.toDateString();
    if (filter === 'week') return (now.getTime() - new Date(p.createdAt).getTime()) < 7 * 86400000;
    return true;
  });

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Gratitude Wall</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Share what you're grateful for today</p>
      </div>

      <div className="card">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value.slice(0, 200))}
          placeholder="I'm grateful for..."
          className="input-field resize-none"
          rows={2}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{content.length}/200</span>
          <button onClick={submit} disabled={submitting || !content.trim()} className="btn-primary text-sm py-2 px-4">
            {submitting ? 'Adding...' : '🙏 Share'}
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {(['today', 'week', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-colors ${filter === f ? 'bg-primary-500 text-white' : ''}`}
            style={filter !== f ? { background: 'var(--subtle-bg)', color: 'var(--text-muted)' } : {}}>
            {f === 'all' ? 'All Time' : f === 'week' ? 'This Week' : 'Today'}
          </button>
        ))}
      </div>

      <div className="columns-2 gap-3 space-y-3">
        {filtered.map(post => (
          <div key={post.id} className="card break-inside-avoid mb-3" style={{ padding: '0.875rem' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center text-xs font-bold text-pink-300">
                {post.anonName.charAt(0)}
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{post.anonName}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>🙏 {post.content}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
            <ReactionBar reactions={post.reactions} targetType="community_post" targetId={post.id} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🙏</p>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No gratitude posts yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Be the first to share what you're grateful for</p>
        </div>
      )}
    </div>
  );
}
