'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Brain, Activity, BookOpen, TrendingUp, Wrench, User, Sun, Moon, BarChart2,
  Heart, CheckSquare, Lightbulb, Users, Target, Pill, Zap, Stethoscope,
  Mail, BookMarked, Phone, Dumbbell, Flame,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import BottomNav from './BottomNav';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: <Activity size={18} /> },
  { id: 'therapy', label: 'AI Therapy', icon: <Brain size={18} /> },
  { id: 'mood', label: 'Mood', icon: <Activity size={18} /> },
  { id: 'journal', label: 'Journal', icon: <BookOpen size={18} /> },
  { id: 'pulse', label: 'Daily Pulse', icon: <Zap size={18} /> },
  { id: 'assessment', label: 'Assessments', icon: <TrendingUp size={18} /> },
  { id: 'tools', label: 'Wellness Tools', icon: <Wrench size={18} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={18} /> },
  { id: 'gratitude', label: 'Gratitude', icon: <Heart size={18} /> },
  { id: 'habits', label: 'Habits', icon: <CheckSquare size={18} /> },
  { id: 'cbt', label: 'CBT', icon: <Lightbulb size={18} /> },
  { id: 'goals', label: 'Goals', icon: <Target size={18} /> },
  { id: 'medications', label: 'Medications', icon: <Pill size={18} /> },
  { id: 'symptoms', label: 'Symptoms', icon: <Stethoscope size={18} /> },
  { id: 'meditation', label: 'Meditation', icon: <Brain size={18} /> },
  { id: 'routines', label: 'Routines', icon: <Dumbbell size={18} /> },
  { id: 'courses', label: 'Skill Library', icon: <BookMarked size={18} /> },
  { id: 'wellness-letter', label: 'Weekly Letter', icon: <Mail size={18} /> },
  { id: 'pressure-release', label: 'Pressure Release', icon: <Flame size={18} /> },
  { id: 'contacts', label: 'Crisis & Contacts', icon: <Phone size={18} /> },
  { id: 'community', label: 'Community', icon: <Users size={18} /> },
  { id: 'profile', label: 'Profile', icon: <User size={18} /> },
];

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'MindSpace', therapy: 'AI Therapy', mood: 'Mood Tracker',
  journal: 'Journal', assessment: 'Assessments', tools: 'Wellness Tools',
  analytics: 'Analytics', gratitude: 'Gratitude Journal', sleep: 'Sleep Tracker',
  habits: 'Habit Tracker', cbt: 'CBT Thought Record', 'safety-plan': 'Safety Plan',
  community: 'Community', report: 'Weekly Report', profile: 'Profile',
  pulse: 'Daily Pulse', goals: 'Wellness Goals', medications: 'Medications',
  symptoms: 'Symptom Tracker', meditation: 'Meditation Rooms', routines: 'Daily Routines',
  courses: 'Skill Library', 'wellness-letter': 'Weekly Letter', contacts: 'Crisis & Contacts',
  buddy: 'Peer Buddy',
  'pressure-release': 'Pressure Release',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  useEffect(() => {
    if (mounted && !user) router.push('/');
  }, [mounted, user, router]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  if (!mounted || !user) return null;

  const segments = pathname.slice(1).split('/');
  const current = segments[segments.length - 1] || segments[0] || 'dashboard';

  return (
    <div className="min-h-screen bg-mesh flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-56 lg:w-60 glass border-r border-white/10 z-50 p-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6 px-1 flex-shrink-0">
          <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center glow flex-shrink-0">
            <Brain size={16} className="text-white" />
          </div>
          <span className="font-bold gradient-text text-lg">MindSpace</span>
        </div>
        <nav className="flex-1 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => router.push(`/${item.id}`)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                current === item.id
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 pt-3 mt-3 space-y-2 px-1 flex-shrink-0">
          <div className="text-xs text-slate-500">Signed in as</div>
          <div className="text-sm font-medium text-white truncate">{user.name}</div>
          <div className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full inline-block">
            Powered by Ollama
          </div>
          <button onClick={toggleTheme} className="theme-toggle w-full mt-1 gap-2 text-xs font-medium" style={{ justifyContent: 'flex-start', padding: '0.5rem 0.625rem' }}>
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-56 lg:ml-60 min-w-0">
        <div className="sticky top-0 z-40 glass border-b border-white/5 px-4 py-3 flex items-center gap-3">
          <h1 className="text-base font-bold gradient-text flex-1">
            {PAGE_TITLES[current] ?? 'MindSpace'}
          </h1>
          <div className="md:hidden text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full">
            Ollama
          </div>
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-4 pt-5 pb-28 md:pb-8">{children}</div>
      </div>

      <BottomNav />
    </div>
  );
}
