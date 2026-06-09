'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, MessageSquare, BookOpen, Heart, Star, Trophy, Zap, Newspaper, Target } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Pulse { avg: number | null; count: number; todayCount: number; topEmotions: string[]; }

function moodLabel(avg: number) {
  if (avg >= 8) return 'Great';
  if (avg >= 6) return 'Good';
  if (avg >= 4) return 'Moderate';
  if (avg >= 2) return 'Low';
  return 'Struggling';
}

function moodColor(avg: number) {
  if (avg >= 8) return '#10b981';
  if (avg >= 6) return '#6366f1';
  if (avg >= 4) return '#f59e0b';
  return '#ef4444';
}

export default function CommunityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const [anonName, setAnonName] = useState('');
  const [guidelinesAck, setGuidelinesAck] = useState(true);

  useEffect(() => {
    const ack = localStorage.getItem('communityGuidelinesAcknowledged');
    if (!ack) setGuidelinesAck(false);

    fetch('/api/community/pulse').then(r => r.json()).then(setPulse).catch(() => {});

    if (user) {
      fetch('/api/community/posts?type=feed&page=0').then(r => r.json()).then(posts => {
        const mine = posts.find((p: { userId: number; anonName: string }) => p.userId === user.id);
        if (mine) setAnonName(mine.anonName);
      }).catch(() => {});
    }

    const interval = setInterval(() => {
      fetch('/api/community/pulse').then(r => r.json()).then(setPulse).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const ackGuidelines = () => {
    localStorage.setItem('communityGuidelinesAcknowledged', '1');
    setGuidelinesAck(true);
  };

  const spaces = [
    { icon: <Newspaper size={20} />, label: 'Community Feed', desc: 'Share thoughts anonymously', path: '/community/feed', color: '#6366f1' },
    { icon: <MessageSquare size={20} />, label: 'Support Groups', desc: '8 topic-based groups', path: '/community/groups', color: '#8b5cf6' },
    { icon: <Star size={20} />, label: "Today's Prompt", desc: 'One shared question daily', path: '/community/prompt', color: '#f59e0b' },
    { icon: <Heart size={20} />, label: 'Gratitude Wall', desc: 'Share what you\'re thankful for', path: '/community/gratitude-wall', color: '#ec4899' },
    { icon: <BookOpen size={20} />, label: 'Story Wall', desc: 'Share longer experiences', path: '/community/stories', color: '#10b981' },
    { icon: <Trophy size={20} />, label: 'Achievements', desc: 'Celebrate milestones together', path: '/community/achievements', color: '#f97316' },
    { icon: <Zap size={20} />, label: 'Challenges', desc: 'Join community wellness goals', path: '/community/challenges', color: '#06b6d4' },
    { icon: <Target size={20} />, label: 'Resource Board', desc: 'Helpful links and tools', path: '/community/resources', color: '#84cc16' },
  ];

  return (
    <div className="space-y-5 pb-8">
      {!guidelinesAck && (
        <div className="card border-primary-500/30" style={{ background: 'rgba(99,102,241,0.08)' }}>
          <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Users size={16} className="text-primary-400" /> Community Guidelines
          </h3>
          <ol className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
            <li>1. Be kind — everyone here is going through something</li>
            <li>2. All content is anonymous — protect your own identity</li>
            <li>3. Add content warnings when sharing heavy topics</li>
            <li>4. No medical advice — share experiences, not diagnoses</li>
            <li>5. In crisis? Use the SOS button or call 988</li>
          </ol>
          <button className="btn-primary mt-3 text-sm py-2" onClick={ackGuidelines}>I understand</button>
        </div>
      )}

      {/* Mood Pulse */}
      <div className="card">
        <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span className="text-lg">💫</span> Community Mood Pulse
        </h3>
        {pulse && pulse.avg !== null ? (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
              style={{ background: moodColor(pulse.avg) }}>
              {pulse.avg}
            </div>
            <div>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                The community is feeling <span style={{ color: moodColor(pulse.avg) }}>{moodLabel(pulse.avg)}</span>
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Based on {pulse.count} recent check-ins · {pulse.todayCount} checked in today
              </p>
              {pulse.topEmotions.length > 0 && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Top emotions: {pulse.topEmotions.join(' · ')}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No mood data yet — log your mood to contribute!</p>
        )}
      </div>

      {anonName && (
        <div className="card py-3" style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.3)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            You appear as <span className="font-bold text-primary-300">{anonName}</span> in the community
          </p>
        </div>
      )}

      {/* Community Spaces Grid */}
      <div>
        <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Community Spaces</h3>
        <div className="grid grid-cols-2 gap-3">
          {spaces.map(s => (
            <button key={s.path} onClick={() => router.push(s.path)}
              className="card text-left p-4 glass-hover cursor-pointer"
              style={{ padding: '1rem' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 text-white"
                style={{ background: s.color + '33', color: s.color }}>
                {s.icon}
              </div>
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{s.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
