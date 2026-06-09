export interface User {
  id: number;
  name: string;
  email: string;
  stats?: { mood_logs: number; sessions: number; journals: number; avg_mood: number };
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface TherapySession {
  id: number;
  title: string;
  session_type: string;
  created_at: string;
}

export interface MoodLog {
  id: number;
  mood: number;
  emotions: string[];
  note: string;
  ai_insight: string;
  created_at: string;
}

export interface JournalEntry {
  id: number;
  content: string;
  ai_analysis: string;
  themes: string;
  created_at: string;
}

export interface Assessment {
  id: number;
  assessment_type: string;
  score: number;
  interpretation: string;
  ai_report: string;
  created_at: string;
}

export type SessionType = 'general' | 'cbt' | 'mindfulness' | 'grief' | 'anxiety';
