'use client';

import { useState, useEffect, useRef } from 'react';
import { Brain, Send, Plus, ChevronLeft, Sparkles } from 'lucide-react';
import { sessionApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { TherapySession, Message, SessionType } from '@/types';
import { format } from 'date-fns';

const SESSION_TYPES: { type: SessionType; label: string; desc: string; emoji: string }[] = [
  { type: 'general', label: 'General Therapy', desc: 'Open conversation with Dr. Aria', emoji: '🧠' },
  { type: 'cbt', label: 'CBT Session', desc: 'Cognitive Behavioral Therapy', emoji: '💭' },
  { type: 'mindfulness', label: 'Mindfulness', desc: 'Present-moment awareness', emoji: '🧘' },
  { type: 'grief', label: 'Grief Support', desc: 'Processing loss and change', emoji: '💙' },
  { type: 'anxiety', label: 'Anxiety Help', desc: 'Anxiety management techniques', emoji: '🌊' },
];

const WELCOME: Record<SessionType, string> = {
  general: "Hello, I'm Dr. Aria. I'm here to listen and support you. How are you feeling today?",
  cbt: "Welcome to our CBT session. Today we'll work together to identify thought patterns affecting your wellbeing. What situation would you like to explore?",
  mindfulness: "Welcome. Let's begin with a moment of presence. Take a gentle breath... I'm here with you.",
  grief: "I'm so glad you reached out. Grief is one of the most profound human experiences, and you don't have to face it alone.",
  anxiety: "I understand that anxiety can feel overwhelming. You're safe here. Let's work through what you're experiencing together.",
};

export default function TherapyPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [activeSession, setActiveSession] = useState<TherapySession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'new' | 'chat'>('list');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadSessions(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const loadSessions = async () => {
    if (!user) return;
    const res = await sessionApi.list(user.id);
    setSessions(res.data);
  };

  const startSession = async (type: SessionType) => {
    if (!user) return;
    setLoading(true);
    const res = await sessionApi.create(user.id, type);
    setActiveSession(res.data);
    setMessages([{ role: 'assistant', content: WELCOME[type] }]);
    setView('chat');
    setSessions(prev => [res.data, ...prev]);
    setLoading(false);
  };

  const openSession = async (session: TherapySession) => {
    setActiveSession(session);
    setLoading(true);
    const res = await sessionApi.getMessages(session.id);
    const msgs = res.data.messages;
    setMessages(msgs.length === 0 ? [{ role: 'assistant', content: WELCOME[session.session_type as SessionType] }] : msgs);
    setView('chat');
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeSession || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);
    try {
      const res = await sessionApi.chat(activeSession.id, input);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
      loadSessions();
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please check if Ollama is running." }]);
    }
    setLoading(false);
  };

  const MessagesArea = () => (
    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          {msg.role === 'assistant' && (
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
              <Brain size={14} className="text-white" />
            </div>
          )}
          <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            msg.role === 'user' ? 'bg-primary-500 text-white rounded-br-sm' : 'glass text-slate-200 rounded-bl-sm'
          }`}>
            {msg.content}
          </div>
        </div>
      ))}
      {loading && (
        <div className="flex justify-start">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
            <Brain size={14} className="text-white" />
          </div>
          <div className="glass rounded-2xl rounded-bl-sm px-4 py-3">
            <div className="flex gap-1.5 items-center h-5">
              {[0, 1, 2].map(i => <div key={i} className="typing-dot w-2 h-2 bg-primary-400 rounded-full" />)}
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );

  const ChatInput = () => (
    <div className="glass rounded-2xl p-3 mt-3 flex gap-2 flex-shrink-0">
      <textarea value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
        placeholder="Share what's on your mind..." rows={2}
        className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none resize-none text-sm" />
      <button onClick={sendMessage} disabled={!input.trim() || loading}
        className="w-10 h-10 bg-primary-500 disabled:opacity-40 rounded-xl flex items-center justify-center hover:bg-primary-600 transition-colors self-end">
        <Send size={16} className="text-white" />
      </button>
    </div>
  );

  const ChatHeader = ({ showBack = false }) => (
    <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 mb-3 flex-shrink-0">
      {showBack && (
        <button onClick={() => { setView('list'); loadSessions(); }} className="text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
      )}
      <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
        <Brain size={16} className="text-white" />
      </div>
      <div>
        <div className="text-sm font-semibold text-white">Dr. Aria</div>
        <div className="text-xs text-calm-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-calm-400 rounded-full animate-pulse" />Online
        </div>
      </div>
      <div className="ml-auto text-xs bg-primary-500/20 text-primary-300 px-2 py-1 rounded-full capitalize">
        {activeSession?.session_type}
      </div>
    </div>
  );

  const SessionTypePicker = ({ onBack }: { onBack?: () => void }) => (
    <div className="space-y-4">
      {onBack ? (
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-white"><ChevronLeft size={20} /></button>
          <h2 className="text-xl font-bold text-white">Choose Session Type</h2>
        </div>
      ) : (
        <h2 className="text-lg font-bold text-white mb-2">Choose Session Type</h2>
      )}
      <div className="space-y-3">
        {SESSION_TYPES.map(st => (
          <button key={st.type} onClick={() => startSession(st.type)}
            className="w-full card text-left glass-hover flex items-center gap-4 hover:border-primary-500/50">
            <span className="text-3xl">{st.emoji}</span>
            <div>
              <div className="font-semibold text-white">{st.label}</div>
              <div className="text-sm text-slate-400">{st.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        {view === 'chat' && activeSession ? (
          <div className="flex flex-col h-[calc(100vh-140px)]">
            <ChatHeader showBack />
            <MessagesArea />
            <ChatInput />
          </div>
        ) : view === 'new' ? (
          <SessionTypePicker onBack={() => setView('list')} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Therapy Sessions</h2>
                <p className="text-sm text-slate-400">Your conversations with Dr. Aria</p>
              </div>
              <button onClick={() => setView('new')} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
                <Plus size={16} /> New
              </button>
            </div>
            <div className="card bg-gradient-to-br from-primary-900/50 to-accent-600/20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center glow">
                  <Brain size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Dr. Aria</h3>
                  <p className="text-primary-300 text-sm">AI Psychologist • CBT • DBT • Mindfulness</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 bg-calm-400 rounded-full animate-pulse" />
                    <span className="text-calm-400 text-xs">Available 24/7</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setView('new')} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
                <Sparkles size={16} /> Start New Session
              </button>
            </div>
            {sessions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Past Sessions</h3>
                <div className="space-y-2">
                  {sessions.map(s => (
                    <button key={s.id} onClick={() => openSession(s)}
                      className="w-full glass rounded-xl p-4 text-left glass-hover flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                        <Brain size={18} className="text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{s.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded-full capitalize">{s.session_type}</span>
                          <span className="text-xs text-slate-500">{format(new Date(s.created_at), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop: 2-panel */}
      <div className="hidden md:flex gap-4 h-[calc(100vh-56px)]">
        <div className="w-64 lg:w-72 flex flex-col glass rounded-2xl overflow-hidden flex-shrink-0">
          <div className="p-4 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center glow flex-shrink-0">
                <Brain size={18} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-white">Dr. Aria</div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-calm-400 rounded-full animate-pulse" />
                  <span className="text-xs text-calm-400">Available 24/7</span>
                </div>
              </div>
            </div>
            <button onClick={() => setView('new')} className="btn-primary w-full text-sm py-2 flex items-center justify-center gap-1.5">
              <Plus size={14} /> New Session
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">No sessions yet</div>
            ) : sessions.map(s => (
              <button key={s.id} onClick={() => openSession(s)}
                className={`w-full rounded-xl p-3 text-left transition-all ${
                  activeSession?.id === s.id ? 'bg-primary-500/20 border border-primary-500/30 text-white' : 'glass glass-hover'
                }`}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain size={12} className="text-primary-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-white truncate">{s.title}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs text-primary-400 capitalize">{s.session_type}</span>
                      <span className="text-xs text-slate-600">· {format(new Date(s.created_at), 'MMM d')}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {view === 'chat' && activeSession ? (
            <div className="flex flex-col h-full">
              <ChatHeader />
              <MessagesArea />
              <ChatInput />
            </div>
          ) : view === 'new' ? (
            <div className="overflow-y-auto glass rounded-2xl p-6">
              <SessionTypePicker />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center glass rounded-2xl p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center glow mb-4">
                <Brain size={36} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Welcome to AI Therapy</h3>
              <p className="text-slate-400 text-sm max-w-sm mb-6">
                Dr. Aria is a compassionate AI therapist trained in CBT, DBT, and mindfulness. Select a session or start a new one.
              </p>
              <button onClick={() => setView('new')} className="btn-primary flex items-center gap-2">
                <Sparkles size={16} /> Start New Session
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
