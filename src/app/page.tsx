'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Sparkles, Shield, Heart, UserX } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/services/api';
import { User } from '@/types';

export default function HomePage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && user) router.push('/dashboard');
  }, [mounted, user, router]);

  if (!mounted || user) return null;

  const handleGuest = async () => {
    setLoading(true); setError('');
    try {
      const res = await userApi.guestLogin();
      setUser(res.data as User);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? 'Something went wrong. Is the backend running?');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = mode === 'register'
        ? await userApi.create(name, email)
        : await userApi.login(email);
      setUser(res.data as User);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? 'Something went wrong. Is the backend running?');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Branding */}
        <div className="text-center md:text-left space-y-6">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center glow">
              <Brain size={28} className="text-white" />
            </div>
            <span className="text-3xl font-bold gradient-text">MindSpace</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Your AI-powered<br />
            <span className="gradient-text">Mental Wellness</span><br />
            companion
          </h1>
          <p className="text-slate-400 text-lg">
            Evidence-based therapy tools, mood tracking, and personalized AI support — available 24/7.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Sparkles size={20} />, label: 'AI Therapy', color: 'text-primary-400' },
              { icon: <Heart size={20} />, label: 'Mood Tracking', color: 'text-pink-400' },
              { icon: <Shield size={20} />, label: 'Private & Safe', color: 'text-calm-400' },
            ].map((f, i) => (
              <div key={i} className="glass rounded-xl p-3 text-center">
                <div className={`${f.color} flex justify-center mb-1`}>{f.icon}</div>
                <div className="text-xs text-slate-400">{f.label}</div>
              </div>
            ))}
          </div>
          <div className="glass rounded-2xl p-4 border-l-4 border-primary-500">
            <p className="text-slate-300 text-sm italic">
              "Taking care of your mental health is just as important as physical health."
            </p>
            <p className="text-primary-400 text-xs mt-1">— Dr. Aria, AI Psychologist</p>
          </div>
        </div>

        {/* Form */}
        <div className="card glow">
          <div className="flex gap-2 mb-6 bg-slate-900/50 rounded-xl p-1">
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all capitalize ${
                  mode === m ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'
                }`}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name" required className="input-field" />
              </div>
            )}
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" required className="input-field" />
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-3">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
                : mode === 'login' ? 'Enter MindSpace' : 'Begin Your Journey'}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-800 px-3 text-xs text-slate-500">or</span>
            </div>
          </div>

          <button type="button" onClick={handleGuest} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white transition-all text-sm font-medium">
            <UserX size={16} />
            Continue as Guest
          </button>

          <p className="text-center text-xs text-slate-500 mt-4">
            🔒 Your data is stored locally and privately. No payment required.
          </p>
        </div>
      </div>
    </div>
  );
}
