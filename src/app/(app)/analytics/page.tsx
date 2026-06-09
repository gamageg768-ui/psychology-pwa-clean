'use client';

import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, BookOpen, ClipboardList } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { moodApi, assessmentApi, journalApi } from '@/services/api';
import { MoodLog, Assessment } from '@/types';
import { format } from 'date-fns';

interface JournalEntry { id: number; themes?: string; created_at: string; }

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [moods, setMoods] = useState<MoodLog[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    moodApi.list(user.id).then(r => setMoods(r.data)).catch(() => {});
    assessmentApi.list(user.id).then(r => setAssessments(r.data)).catch(() => {});
    journalApi.list(user.id).then(r => setJournals(r.data)).catch(() => {});
  }, []);

  const moodChartData = [...moods].reverse().slice(-30).map(m => ({
    date: format(new Date(m.created_at), 'MM/dd'),
    mood: m.mood,
  }));

  const emotionFreq: Record<string, number> = {};
  moods.forEach(m => {
    if (m.emotions?.length) {
      m.emotions.forEach(e => { emotionFreq[e] = (emotionFreq[e] || 0) + 1; });
    }
  });
  const emotionData = Object.entries(emotionFreq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));

  const assessmentTypes = [...new Set(assessments.map(a => a.assessment_type))].slice(0, 4);
  const assessmentData = [...assessments].reverse().slice(-20).map(a => ({
    date: format(new Date(a.created_at), 'MM/dd'),
    score: a.score,
    type: a.assessment_type,
  }));

  const journalDates = new Set(journals.map(j => format(new Date(j.created_at), 'yyyy-MM-dd')));
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    const ds = format(d, 'yyyy-MM-dd');
    return { date: format(d, 'MM/dd'), active: journalDates.has(ds) };
  });

  const themeFreq: Record<string, number> = {};
  journals.forEach(j => {
    if (j.themes) j.themes.split(',').forEach(t => { const k = t.trim(); if (k) themeFreq[k] = (themeFreq[k] || 0) + 1; });
  });
  const topThemes = Object.entries(themeFreq).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const tooltipStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12 };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Analytics & Insights</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your wellness patterns over time</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Mood Logs', value: moods.length, icon: <TrendingUp size={16} className="text-primary-400" /> },
          { label: 'Assessments', value: assessments.length, icon: <ClipboardList size={16} className="text-accent-400" /> },
          { label: 'Journal Days', value: journalDates.size, icon: <BookOpen size={16} className="text-calm-400" /> },
        ].map((s, i) => (
          <div key={i} className="card text-center p-3">
            <div className="flex justify-center mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mood Trend */}
      {moodChartData.length > 1 && (
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp size={16} className="text-primary-400" /> Mood Trend (Last 30 logs)
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={moodChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[1, 10]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="mood" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Emotion Frequency */}
      {emotionData.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            <BarChart2 size={16} className="inline mr-2 text-accent-400" />Emotion Frequency
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={emotionData} layout="vertical">
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Assessment History */}
      {assessmentData.length > 1 && (
        <div className="card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            <ClipboardList size={16} className="inline mr-2 text-calm-400" />Assessment Scores Over Time
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={assessmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [v, n]} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)' }} />
              {assessmentTypes.slice(0, 3).map((type, i) => (
                <Line key={type} type="monotone" dataKey={type === assessmentTypes[0] ? 'score' : undefined}
                  data={assessmentData.filter(d => d.type === type)}
                  stroke={['#6366f1', '#8b5cf6', '#10b981'][i]} strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 0 }} name={type} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Journal Calendar */}
      <div className="card">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          <BookOpen size={16} className="inline mr-2 text-yellow-400" />Journal Activity (Last 30 Days)
        </h3>
        <div className="grid grid-cols-10 gap-1.5">
          {last30Days.map((d, i) => (
            <div key={i} title={d.date}
              className={`w-full aspect-square rounded-md transition-colors ${d.active ? 'bg-primary-500' : ''}`}
              style={!d.active ? { background: 'var(--progress-track)' } : {}} />
          ))}
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Each square = 1 day. Purple = journal entry written.</p>
      </div>

      {/* Top Journal Themes */}
      {topThemes.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Top Journal Themes</h3>
          <div className="flex flex-wrap gap-2">
            {topThemes.map(([theme, count]) => (
              <span key={theme} className="px-3 py-1 rounded-full text-sm font-medium text-primary-300 flex items-center gap-1"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                {theme} <span className="text-xs opacity-70">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {moods.length === 0 && assessments.length === 0 && journals.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">📊</div>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No data yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Log moods, complete assessments, and write journals to see your insights.</p>
        </div>
      )}
    </div>
  );
}
