'use client';

import { useState, useEffect } from 'react';
import ReactionBar from '@/components/ReactionBar';
import { formatDistanceToNow } from 'date-fns';

interface Achievement { id: number; userId: number; achievement: string; emoji: string; anonName: string; reactions: Record<string, number>; createdAt: string; }

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    fetch('/api/community/achievements').then(r => r.json()).then(setAchievements).catch(() => {});
  }, []);

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Achievements Feed</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Celebrate each other's milestones</p>
      </div>

      <div className="card py-3" style={{ background: 'rgba(249,115,22,0.08)', borderColor: 'rgba(249,115,22,0.3)' }}>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          🏆 Share your milestone from the <strong>Profile</strong> page to appear here
        </p>
      </div>

      <div className="space-y-3">
        {achievements.map(a => (
          <div key={a.id} className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                style={{ background: 'rgba(249,115,22,0.15)' }}>
                {a.emoji}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                  <span className="text-orange-300">{a.anonName}</span> achieved:
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{a.achievement}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            <ReactionBar reactions={a.reactions} targetType="community_post" targetId={a.id} />
          </div>
        ))}
        {achievements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🏆</p>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No achievements shared yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Celebrate your milestones from the Profile page!</p>
          </div>
        )}
      </div>
    </div>
  );
}
