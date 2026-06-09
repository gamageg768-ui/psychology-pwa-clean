'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ReactionBar from '@/components/ReactionBar';
import { ExternalLink } from 'lucide-react';

interface Post { id: number; userId: number; content: string; url?: string; contentWarn?: string; anonName: string; reactions: Record<string, number>; createdAt: string; }

const CATEGORIES = ['Article', 'Book', 'App', 'Video', 'Podcast', 'Worksheet'];

export default function ResourceBoardPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState('All');
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/community/posts?type=resource&page=0')
      .then(r => r.json()).then(setPosts).catch(() => {});
  }, []);

  const submit = async () => {
    if (!user || !title.trim() || !category) return;
    setSubmitting(true);
    try {
      const r = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, content: `${title}\n${desc}`, post_type: 'resource', url: url || undefined, content_warn: category }),
      });
      const post = await r.json();
      setPosts(prev => [post, ...prev]);
      setTitle(''); setUrl(''); setDesc(''); setCategory(''); setShowComposer(false);
    } finally { setSubmitting(false); }
  };

  const filtered = filter === 'All' ? posts : posts.filter(p => p.contentWarn === filter);

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Resource Board</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Helpful links, books, and tools</p>
        </div>
        <button onClick={() => setShowComposer(!showComposer)} className="btn-primary text-sm py-2 px-3">
          + Add Resource
        </button>
      </div>

      {showComposer && (
        <div className="card space-y-3">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`text-xs px-3 py-1 rounded-full border ${category === c ? 'border-primary-500/50 text-primary-300 bg-primary-500/10' : ''}`}
                style={category !== c ? { borderColor: 'var(--border)', background: 'var(--subtle-bg)', color: 'var(--text-muted)' } : {}}>
                {c}
              </button>
            ))}
          </div>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="input-field" />
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL (optional)" className="input-field" />
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Brief description..." className="input-field resize-none" rows={2} />
          <button onClick={submit} disabled={submitting || !title.trim() || !category} className="btn-primary text-sm py-2 w-full">
            {submitting ? 'Adding...' : 'Share Resource'}
          </button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {['All', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium flex-shrink-0 transition-colors ${filter === c ? 'bg-primary-500 text-white' : ''}`}
            style={filter !== c ? { background: 'var(--subtle-bg)', color: 'var(--text-muted)' } : {}}>
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(post => {
          const [titleLine, ...descLines] = post.content.split('\n');
          return (
            <div key={post.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {post.contentWarn && (
                    <span className="text-xs px-2 py-0.5 rounded-full inline-block mb-1 font-medium"
                      style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                      {post.contentWarn}
                    </span>
                  )}
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{titleLine}</p>
                  {descLines.join('\n') && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{descLines.join('\n')}</p>
                  )}
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>shared by {post.anonName}</p>
                </div>
                {post.url && (
                  <a href={post.url} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              <ReactionBar reactions={post.reactions} targetType="community_post" targetId={post.id} />
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📚</p>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No resources yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Share something that helped you.</p>
          </div>
        )}
      </div>
    </div>
  );
}
