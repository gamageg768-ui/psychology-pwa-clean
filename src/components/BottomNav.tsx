'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  Brain, Activity, BookOpen, TrendingUp, Wrench, User, BarChart2,
  Heart, CheckSquare, Lightbulb, Users, Target, Pill, Zap, Stethoscope,
  Mail, BookMarked, Phone, Dumbbell,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: <Activity size={20} /> },
  { id: 'mood', label: 'Mood', icon: <Activity size={20} /> },
  { id: 'pulse', label: 'Pulse', icon: <Zap size={20} /> },
  { id: 'journal', label: 'Journal', icon: <BookOpen size={20} /> },
  { id: 'therapy', label: 'Therapy', icon: <Brain size={20} /> },
  { id: 'meditation', label: 'Meditate', icon: <Brain size={20} /> },
  { id: 'goals', label: 'Goals', icon: <Target size={20} /> },
  { id: 'habits', label: 'Habits', icon: <CheckSquare size={20} /> },
  { id: 'routines', label: 'Routines', icon: <Dumbbell size={20} /> },
  { id: 'medications', label: 'Meds', icon: <Pill size={20} /> },
  { id: 'symptoms', label: 'Symptoms', icon: <Stethoscope size={20} /> },
  { id: 'courses', label: 'Skills', icon: <BookMarked size={20} /> },
  { id: 'assessment', label: 'Assess', icon: <TrendingUp size={20} /> },
  { id: 'analytics', label: 'Charts', icon: <BarChart2 size={20} /> },
  { id: 'gratitude', label: 'Grateful', icon: <Heart size={20} /> },
  { id: 'cbt', label: 'CBT', icon: <Lightbulb size={20} /> },
  { id: 'wellness-letter', label: 'Letter', icon: <Mail size={20} /> },
  { id: 'tools', label: 'Tools', icon: <Wrench size={20} /> },
  { id: 'contacts', label: 'Crisis', icon: <Phone size={20} /> },
  { id: 'community', label: 'Community', icon: <Users size={20} /> },
  { id: 'profile', label: 'Profile', icon: <User size={20} /> },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname.slice(1).split('/');
  const current = segments[segments.length - 1] || segments[0] || 'dashboard';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass border-t border-white/10 px-1 py-1.5 overflow-x-auto scrollbar-hide">
        <div className="flex gap-0.5 min-w-max px-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => router.push(`/${item.id}`)}
              className={`nav-item flex-shrink-0 ${current === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
