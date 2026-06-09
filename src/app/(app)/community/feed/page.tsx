'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ReactionBar from '@/components/ReactionBar';
import { formatDistanceToNow } from 'date-fns';
import { Flag } from 'lucide-react';

interface Post {
  id: number; userId: number; content: string; mood?: number; contentWarn?: string;
  anonName: string; reactions: Record<string, number>; createdAt: string;
}

const MOOD_EMOJI = ['', '😞', '😔', '😕', '😐', '🙂', '😊', '😀', '😄', '🤩', '🌟'];

export default function CommunityFeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [cw, setCw] = useState('');
  const [showCw, setShowCw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [reportMenu, setReportMenu] = useState<number | null>(null);

  const load = async (p = 0) => {
    const r = await fetch(`/api/community/posts?type=feed&page=${p}`);
    const data = await r.json();
    if (p === 0) setPosts(data);
    else setPosts(prev => [...prev, ...data]);
    if (data.length < 20) setHasMore(false);
  };

  useEffect(() => { load(0); }, []);

  const submit = async () => {
    if (!user || !content.trim()) return;
    setSubmitting(true);
    try {
      const r = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, content, post_type: 'feed', mood: mood || undefined, content_warn: cw || undefined }),
      });
      const post = await r.json();
      setPosts(prev => [post, ...prev]);
      setContent(''); setMood(null); setCw(''); setShowCw(false);
    } finally { setSubmitting(false); }
  };

  const report = async (postId: number, reason: string) => {
    if (!user) return;
    await fetch('/api/community/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reporter_id: user.id, target_type: 'community_post', target_id: postId, reason }),
    });
    setReportMenu(null);
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Community Feed</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Share anonymously with the community</p>
      </div>

      {/* Composer */}
      <div className="card">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value.slice(0, 280))}
          placeholder="Share what's on your mind..."
          className="input-field resize-none"
          rows={3}
        />
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{content.length}/280</span>
          <button onClick={() => setShowCw(!showCw)} className="text-xs px-2 py-1 rounded-full border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--subtle-bg)' }}>
            {showCw ? 'Remove CW' : '+ Content Warning'}
          </button>
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Mood:</span>
            {[3, 5, 7, 9].map(m => (
              <button key={m} onClick={() => setMood(mood === m ? null : m)}
                className={`text-sm px-1.5 py-0.5 rounded ${mood === m ? 'bg-primary-500/30' : ''}`}>
                {MOOD_EMOJI[m]}
              </button>
            ))}
          </div>
        </div>
        {showCw && (
          <input value={cw} onChange={e => setCw(e.target.value)} placeholder="Content warning (e.g. Grief, Anxiety...)"
            className="input-field mt-2 text-sm" />
        )}
        <button onClick={submit} disabled={submitting || !content.trim()} className="btn-primary mt-3 text-sm py-2 w-full">
          {submitting ? 'Sharing...' : 'Share Anonymously'}
        </button>
      </div>

      {/* Posts */}
      {posts.map(post => (
        <div key={post.id} className="card relative">
          {reportMenu === post.id && (
            <div className="absolute right-4 top-10 z-10 rounded-xl shadow-lg p-2 space-y-1 min-w-40"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {['Harmful content', 'Spam', 'Triggering without CW', 'Misinformation'].map(r => (
                <button key={r} onClick={() => report(post.id, r)} className="block w-full text-left text-xs px-3 py-1.5 rounded-lg"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--subtle-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  {r}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-300">
                {post.anonName.charAt(0)}
              </div>
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{post.anonName}</span>
                <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {post.mood && <span className="text-sm">{MOOD_EMOJI[post.mood]}</span>}
              <button onClick={() => setReportMenu(reportMenu === post.id ? null : post.id)}
                className="p-1 rounded opacity-40 hover:opacity-100" style={{ color: 'var(--text-muted)' }}>
                <Flag size={12} />
              </button>
            </div>
          </div>
          {post.contentWarn && (
            <div className="mt-2 text-xs px-2 py-1 rounded-full inline-block"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
              CW: {post.contentWarn}
            </div>
          )}
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{post.content}</p>
          <ReactionBar reactions={post.reactions} targetType="community_post" targetId={post.id} />
        </div>
      ))}

      {hasMore && posts.length > 0 && (
        <button onClick={() => { const p = page + 1; setPage(p); load(p); }}
          className="w-full text-sm py-2 rounded-xl" style={{ color: 'var(--text-muted)', background: 'var(--subtle-bg)' }}>
          Load more
        </button>
      )}

      {posts.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">💬</p>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Be the first to share</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your thoughts are anonymous and safe here.</p>
        </div>
      )}
    </div>
  );
}
