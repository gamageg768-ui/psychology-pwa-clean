'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ReactionBar from '@/components/ReactionBar';
import { formatDistanceToNow } from 'date-fns';
import { Flag } from 'lucide-react';

interface Post { id: number; userId: number; content: string; contentWarn?: string; anonName: string; reactions: Record<string, number>; createdAt: string; }

const CW_OPTIONS = ['Suicidal thoughts', 'Self-harm', 'Grief', 'Abuse', 'Trauma', 'Eating disorders', 'Addiction'];

export default function StoryWallPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [content, setContent] = useState('');
  const [cw, setCw] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  useEffect(() => {
    fetch('/api/community/posts?type=story&page=0')
      .then(r => r.json()).then(setPosts).catch(() => {});
  }, []);

  const submit = async () => {
    if (!user || !content.trim() || !cw) return;
    setSubmitting(true);
    try {
      const r = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, content: content.slice(0, 1000), post_type: 'story', content_warn: cw }),
      });
      const post = await r.json();
      setPosts(prev => [post, ...prev]);
      setContent(''); setCw(''); setShowComposer(false);
    } finally { setSubmitting(false); }
  };

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Story Wall</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Share longer recovery stories and experiences</p>
        </div>
        <button onClick={() => setShowComposer(!showComposer)} className="btn-primary text-sm py-2 px-3">
          + Post Story
        </button>
      </div>

      {showComposer && (
        <div className="card">
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Content Warning (required)</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {CW_OPTIONS.map(o => (
              <button key={o} onClick={() => setCw(cw === o ? '' : o)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${cw === o ? 'border-red-400/50 text-red-300 bg-red-500/10' : 'border-white/10'}`}
                style={cw !== o ? { background: 'var(--subtle-bg)', color: 'var(--text-muted)' } : {}}>
                {o}
              </button>
            ))}
          </div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value.slice(0, 1000))}
            placeholder="Share your story..."
            className="input-field resize-none"
            rows={5}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{content.length}/1000</span>
            <button onClick={submit} disabled={submitting || !content.trim() || !cw} className="btn-primary text-sm py-2 px-4">
              {submitting ? 'Sharing...' : 'Share Story'}
            </button>
          </div>
          {!cw && <p className="text-xs mt-1" style={{ color: '#f87171' }}>A content warning is required before sharing</p>}
        </div>
      )}

      {posts.map(post => (
        <div key={post.id} className="card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-300">
              {post.anonName.charAt(0)}
            </div>
            <div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{post.anonName}</span>
              <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          {post.contentWarn && !expanded.has(post.id) ? (
            <div>
              <span className="text-xs px-2 py-1 rounded-full mr-2" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                CW: {post.contentWarn}
              </span>
              <button onClick={() => toggleExpand(post.id)} className="text-xs underline" style={{ color: 'var(--text-muted)' }}>
                Tap to read
              </button>
            </div>
          ) : (
            <>
              {post.contentWarn && (
                <span className="text-xs px-2 py-1 rounded-full inline-block mb-2" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                  CW: {post.contentWarn}
                </span>
              )}
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{post.content}</p>
              <ReactionBar reactions={post.reactions} targetType="community_post" targetId={post.id} />
            </>
          )}
        </div>
      ))}

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📖</p>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No stories yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your story might help someone feel less alone.</p>
        </div>
      )}
    </div>
  );
}
