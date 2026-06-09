'use client';

import { useState } from 'react';

const REACTIONS = [
  { key: 'felt', emoji: '💙', label: 'Felt this' },
  { key: 'notalone', emoji: '🤗', label: "You're not alone" },
  { key: 'strength', emoji: '💪', label: "You've got this" },
  { key: 'thanks', emoji: '🌱', label: 'Thank you' },
];

interface ReactionBarProps {
  reactions: Record<string, number>;
  userReactions?: string[];
  targetType: string;
  targetId: number;
  onReact?: (updated: Record<string, number>, userReactions: string[]) => void;
}

export default function ReactionBar({ reactions, userReactions = [], targetType, targetId, onReact }: ReactionBarProps) {
  const [counts, setCounts] = useState<Record<string, number>>(reactions);
  const [mine, setMine] = useState<string[]>(userReactions);
  const [loading, setLoading] = useState(false);

  const handleReact = async (key: string) => {
    if (loading) return;
    setLoading(true);

    const isActive = mine.includes(key);
    const next = isActive ? mine.filter(k => k !== key) : [...mine, key];
    const delta = isActive ? -1 : 1;
    const nextCounts = { ...counts, [key]: Math.max(0, (counts[key] || 0) + delta) };

    setCounts(nextCounts);
    setMine(next);

    try {
      await fetch('/api/community/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_type: targetType, target_id: targetId, reaction: key }),
      });
      onReact?.(nextCounts, next);
    } catch {
      setCounts(counts);
      setMine(mine);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap mt-2">
      {REACTIONS.map(r => (
        <button
          key={r.key}
          onClick={() => handleReact(r.key)}
          title={r.label}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
            mine.includes(r.key)
              ? 'bg-primary-500/30 text-primary-300 border border-primary-500/50'
              : 'border border-white/10 text-slate-400 hover:border-primary-500/30 hover:text-primary-300'
          }`}
          style={mine.includes(r.key) ? {} : { background: 'var(--subtle-bg)' }}
        >
          <span>{r.emoji}</span>
          {(counts[r.key] || 0) > 0 && <span>{counts[r.key]}</span>}
        </button>
      ))}
    </div>
  );
}
