'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import ReactionBar from '@/components/ReactionBar';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Flag, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Reply { id: number; userId: number; content: string; anonName: string; createdAt: string; }
interface Post {
  id: number; userId: number; content: string; contentWarn?: string; anonName: string;
  reactions: Record<string, number>; createdAt: string; _count: { replies: number };
}
interface Group { id: number; name: string; emoji: string; description: string; }

const CW_OPTIONS = ['Suicidal thoughts', 'Self-harm', 'Grief', 'Abuse', 'Trauma', 'General'];

export default function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [content, setContent] = useState('');
  const [cw, setCw] = useState('');
  const [showCw, setShowCw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openReplies, setOpenReplies] = useState<Set<number>>(new Set());
  const [replies, setReplies] = useState<Record<number, Reply[]>>({});
  const [replyContent, setReplyContent] = useState<Record<number, string>>({});
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/community/groups/${groupId}?user_id=${user.id}`)
      .then(r => r.json()).then(d => {
        setGroup(d.group);
        setPosts(d.posts);
        setIsMember(d.isMember);
      }).catch(() => {});
  }, [groupId, user]);

  const toggleJoin = async () => {
    if (!user) return;
    setJoinLoading(true);
    try {
      const r = await fetch(`/api/community/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      const d = await r.json();
      setIsMember(d.joined);
    } finally { setJoinLoading(false); }
  };

  const submitPost = async () => {
    if (!user || !content.trim()) return;
    setSubmitting(true);
    try {
      const r = await fetch(`/api/community/groups/${groupId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, content, content_warn: cw || undefined }),
      });
      const post = await r.json();
      setPosts(prev => [post, ...prev]);
      setContent(''); setCw(''); setShowCw(false);
    } finally { setSubmitting(false); }
  };

  const loadReplies = async (postId: number) => {
    if (replies[postId]) {
      setOpenReplies(prev => { const n = new Set(prev); n.has(postId) ? n.delete(postId) : n.add(postId); return n; });
      return;
    }
    const r = await fetch(`/api/community/groups/posts/${postId}/replies`);
    const data = await r.json();
    setReplies(prev => ({ ...prev, [postId]: data }));
    setOpenReplies(prev => { const n = new Set(prev); n.add(postId); return n; });
  };

  const submitReply = async (postId: number) => {
    if (!user || !replyContent[postId]?.trim()) return;
    const r = await fetch(`/api/community/groups/posts/${postId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, content: replyContent[postId] }),
    });
    const reply = await r.json();
    setReplies(prev => ({ ...prev, [postId]: [...(prev[postId] || []), reply] }));
    setReplyContent(prev => ({ ...prev, [postId]: '' }));
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, _count: { replies: p._count.replies + 1 } } : p
    ));
  };

  if (!group) return <div className="flex items-center justify-center h-40"><div className="animate-spin w-6 h-6 rounded-full border-2 border-primary-400 border-t-transparent" /></div>;

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl" style={{ background: 'var(--subtle-bg)', color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{group.emoji} {group.name}</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{group.description}</p>
        </div>
        <button onClick={toggleJoin} disabled={joinLoading}
          className={`ml-auto text-sm px-3 py-1.5 rounded-full font-medium ${isMember ? '' : 'btn-primary py-1.5'}`}
          style={isMember ? { background: 'var(--subtle-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' } : {}}>
          {joinLoading ? '...' : isMember ? 'Leave' : 'Join'}
        </button>
      </div>

      {isMember && (
        <div className="card">
          <textarea value={content} onChange={e => setContent(e.target.value.slice(0, 500))}
            placeholder="Share with the group..." className="input-field resize-none" rows={3} />
          <div className="flex items-center gap-2 mt-2">
            <button onClick={() => setShowCw(!showCw)} className="text-xs px-2 py-1 rounded-full border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--subtle-bg)' }}>
              {showCw ? 'Remove CW' : '+ Content Warning'}
            </button>
            <button onClick={submitPost} disabled={submitting || !content.trim()} className="btn-primary text-sm py-2 px-4 ml-auto">
              {submitting ? '...' : 'Post'}
            </button>
          </div>
          {showCw && (
            <div className="flex flex-wrap gap-2 mt-2">
              {CW_OPTIONS.map(o => (
                <button key={o} onClick={() => setCw(cw === o ? '' : o)}
                  className={`text-xs px-2 py-1 rounded-full border ${cw === o ? 'border-red-400/50 text-red-300 bg-red-500/10' : ''}`}
                  style={cw !== o ? { borderColor: 'var(--border)', background: 'var(--subtle-bg)', color: 'var(--text-muted)' } : {}}>
                  {o}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!isMember && (
        <div className="card py-4 text-center">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Join this group to post and reply</p>
        </div>
      )}

      {posts.map(post => (
        <div key={post.id} className="card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-300">
              {post.anonName.charAt(0)}
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{post.anonName}</span>
            <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
          {post.contentWarn && (
            <span className="text-xs px-2 py-0.5 rounded-full inline-block mb-2" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
              CW: {post.contentWarn}
            </span>
          )}
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{post.content}</p>
          <ReactionBar reactions={post.reactions} targetType="group_post" targetId={post.id} />

          <button onClick={() => loadReplies(post.id)}
            className="flex items-center gap-1 text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            <MessageCircle size={12} />
            {post._count.replies} {post._count.replies === 1 ? 'reply' : 'replies'}
            {openReplies.has(post.id) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {openReplies.has(post.id) && (
            <div className="mt-3 space-y-2 pl-3 border-l-2" style={{ borderColor: 'var(--border)' }}>
              {(replies[post.id] || []).map(r => (
                <div key={r.id}>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{r.anonName}</span>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{r.content}</p>
                </div>
              ))}
              {isMember && (
                <div className="flex gap-2 mt-2">
                  <input value={replyContent[post.id] || ''} onChange={e => setReplyContent(p => ({ ...p, [post.id]: e.target.value }))}
                    placeholder="Write a reply..." className="input-field text-xs py-1.5 flex-1" />
                  <button onClick={() => submitReply(post.id)} className="btn-primary text-xs py-1.5 px-3">Reply</button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">{group.emoji}</p>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No posts yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {isMember ? 'Be the first to post in this group' : 'Join the group to see and post conversations'}
          </p>
        </div>
      )}
    </div>
  );
}
