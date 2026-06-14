'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Shield } from 'lucide-react';
import { buddyApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { BuddyMessage } from '@/types';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';

export default function BuddyChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const matchId = Number(params.matchId);
  const [messages, setMessages] = useState<BuddyMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadMessages(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadMessages = async () => {
    const res = await buddyApi.getMessages(matchId);
    setMessages(res.data);
  };

  const send = async () => {
    if (!user || !input.trim()) return;
    setSending(true);
    const content = input.trim();
    setInput('');
    await buddyApi.sendMessage(matchId, user.id, content);
    loadMessages();
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center gap-3 pb-4 mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => router.back()} className="p-2 rounded-xl"
          style={{ background: 'var(--subtle-bg)', border: '1px solid var(--border)' }}>
          <ArrowLeft size={16} style={{ color: 'var(--text-secondary)' }} />
        </button>
        <div>
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Buddy Chat</h2>
          <div className="flex items-center gap-1.5">
            <Shield size={11} style={{ color: '#10b981' }} />
            <span className="text-xs" style={{ color: '#10b981' }}>Anonymous & Safe</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">💛</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Say hello to your buddy. You're both here to support each other.</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm`}
                style={{
                  background: isMe ? '#6366f1' : 'var(--bg-card)',
                  color: isMe ? 'white' : 'var(--text-primary)',
                  border: isMe ? 'none' : '1px solid var(--border)',
                  borderBottomRightRadius: isMe ? 4 : undefined,
                  borderBottomLeftRadius: !isMe ? 4 : undefined,
                }}>
                {msg.content}
                <div className="text-xs mt-1" style={{ color: isMe ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)' }}>
                  {format(new Date(msg.created_at), 'h:mm a')}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder="Share something supportive..." rows={2}
          className="input-field flex-1 resize-none text-sm" style={{ minHeight: '52px' }} />
        <button onClick={send} disabled={sending || !input.trim()}
          className="btn-primary px-4 self-end flex items-center gap-1">
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
