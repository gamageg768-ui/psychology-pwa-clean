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

// Feature #12: Pulse
export interface PulseLog {
  id: number;
  focus: number;
  energy: number;
  stress: number;
  note?: string;
  ai_insight?: string;
  created_at: string;
}

// Feature #3: Goals
export interface GoalMilestone {
  id: number;
  goal_id: number;
  title: string;
  completed: boolean;
  completed_at?: string;
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  category: string;
  target_date?: string;
  status: 'active' | 'completed' | 'paused';
  ai_plan?: string;
  milestones: GoalMilestone[];
  created_at: string;
}

// Feature #1: Medications
export interface MedicationLog {
  id: number;
  medication_id: number;
  date: string;
  taken: boolean;
  side_effects?: string;
  note?: string;
  created_at: string;
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  time_of_day: string;
  notes?: string;
  is_active: boolean;
  logs?: MedicationLog[];
  created_at: string;
}

// Feature #4: Symptoms
export interface SymptomLog {
  id: number;
  energy: number;
  appetite: number;
  focus: number;
  social_withdraw: number;
  physical_symptoms?: string;
  note?: string;
  ai_insight?: string;
  created_at: string;
}

// Feature #5: Crisis contacts
export interface TrustedContact {
  id: number;
  name: string;
  phone: string;
  relation?: string;
  created_at: string;
}

// Feature #10: Routines
export interface RoutineStep {
  id: number;
  routine_id: number;
  step_order: number;
  activity: string;
  duration: number;
}

export interface Routine {
  id: number;
  name: string;
  type: string;
  emoji: string;
  steps: RoutineStep[];
  created_at: string;
}

// Feature #7: Courses
export interface CourseProgress {
  course_id: string;
  steps_done: number[];
  completed: boolean;
  quiz_score?: number;
  completed_at?: string;
}

// Feature #2: Meditation
export interface MeditationSession {
  id: number;
  type: string;
  duration: number;
  completed: boolean;
  created_at: string;
}

// Feature #8: Buddy
export interface BuddyMessage {
  id: number;
  match_id: number;
  sender_id: number;
  content: string;
  created_at: string;
}

export interface BuddyMatch {
  id: number;
  area: string;
  status: string;
  partner_name: string;
  created_at: string;
  messages?: BuddyMessage[];
}
