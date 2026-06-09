'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface Group {
  id: number; name: string; emoji: string; description: string; category: string; memberCount: number;
  _count: { memberships: number; posts: number };
}

export default function GroupsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [memberships, setMemberships] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch('/api/community/groups').then(r => r.json()).then((data: Group[]) => {
      setGroups(data);
      if (user) {
        Promise.all(data.map(g =>
          fetch(`/api/community/groups/${g.id}?user_id=${user.id}`).then(r => r.json())
        )).then(results => {
          const joined = new Set<number>();
          results.forEach((r, i) => { if (r.isMember) joined.add(data[i].id); });
          setMemberships(joined);
        }).catch(() => {});
      }
    }).catch(() => {});
  }, [user]);

  const toggleJoin = async (groupId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    setLoading(l => ({ ...l, [groupId]: true }));
    try {
      const r = await fetch(`/api/community/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await r.json();
      setMemberships(prev => {
        const n = new Set(prev);
        data.joined ? n.add(groupId) : n.delete(groupId);
        return n;
      });
      setGroups(prev => prev.map(g =>
        g.id === groupId ? { ...g, memberCount: g.memberCount + (data.joined ? 1 : -1) } : g
      ));
    } finally { setLoading(l => ({ ...l, [groupId]: false })); }
  };

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Support Groups</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Anonymous, safe spaces for shared experiences</p>
      </div>

      <div className="space-y-3">
        {groups.map(g => (
          <button key={g.id} onClick={() => router.push(`/community/groups/${g.id}`)}
            className="card w-full text-left glass-hover" style={{ padding: '1rem' }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{g.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{g.name}</p>
                  {memberships.has(g.id) && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>Joined</span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{g.description}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {g._count.memberships} members · {g._count.posts} posts
                </p>
              </div>
              <button
                onClick={e => toggleJoin(g.id, e)}
                disabled={loading[g.id]}
                className={`text-xs px-3 py-1.5 rounded-full font-medium flex-shrink-0 ${memberships.has(g.id) ? '' : 'btn-primary py-1.5'}`}
                style={memberships.has(g.id) ? { background: 'var(--subtle-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' } : {}}>
                {loading[g.id] ? '...' : memberships.has(g.id) ? 'Leave' : 'Join'}
              </button>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
