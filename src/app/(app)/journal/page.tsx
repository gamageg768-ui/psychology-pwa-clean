'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Plus, ChevronLeft } from 'lucide-react';
import { journalApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { JournalEntry } from '@/types';
import { format } from 'date-fns';

const PROMPTS = [
  "What's weighing on my mind today...",
  "I'm grateful for...",
  "A challenge I'm facing is...",
  "Something that made me feel...",
  "What I need right now is...",
  "Today I noticed...",
];

export default function JournalPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'write' | 'read'>('list');
  const [selected, setSelected] = useState<JournalEntry | null>(null);
  const [result, setResult] = useState<{ ai_analysis: string; themes: string } | null>(null);

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    if (!user) return;
    const res = await journalApi.list(user.id);
    setEntries(res.data);
  };

  const submit = async () => {
    if (!content.trim() || !user) return;
    setLoading(true);
    try {
      const res = await journalApi.create(user.id, content);
      setResult(res.data);
      setContent('');
      loadEntries();
    } catch { setResult({ ai_analysis: 'Could not analyze. Check backend.', themes: '' }); }
    setLoading(false);
  };

  const ReadView = () => selected ? (
    <div className="space-y-4">
      <div className="text-xs text-slate-500">{format(new Date(selected.created_at), 'MMMM d, yyyy • h:mm a')}</div>
      <div className="card"><p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{selected.content}</p></div>
      {selected.themes && (
        <div>
          <div className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Themes</div>
          <div className="flex flex-wrap gap-2">
            {selected.themes.split(',').map(t => t.trim()).filter(Boolean).map(t => (
              <span key={t} className="text-xs bg-accent-500/20 text-accent-300 px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      )}
      {selected.ai_analysis && (
        <div className="glass rounded-2xl p-5 border border-primary-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-primary-400" />
            <span className="text-sm font-semibold text-primary-300">Therapeutic Reflection</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{selected.ai_analysis}</p>
        </div>
      )}
    </div>
  ) : null;

  const WriteView = () => (
    <div className="space-y-4">
      {!result ? (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {PROMPTS.map(p => (
              <button key={p} onClick={() => setContent(prev => prev ? prev + '\n\n' + p : p)}
                className="flex-shrink-0 text-xs bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-3 py-2 rounded-lg transition-colors">{p}</button>
            ))}
          </div>
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder="Start writing..." rows={14} className="input-field resize-none text-sm leading-relaxed" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{content.length} characters</span>
            <button onClick={submit} disabled={loading || content.trim().length < 10}
              className="btn-primary flex items-center gap-2 py-2 px-5 text-sm">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</>
                : <><Sparkles size={14} />Save & Analyze</>}
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5 border border-calm-500/30 bg-calm-500/5">
            <div className="text-calm-400 font-semibold mb-2 flex items-center gap-2">Entry saved</div>
            <p className="text-slate-300 text-sm leading-relaxed">{result.ai_analysis}</p>
          </div>
          {result.themes && (
            <div>
              <div className="text-xs text-slate-400 mb-2 font-medium">Themes detected:</div>
              <div className="flex flex-wrap gap-2">
                {result.themes.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                  <span key={t} className="text-xs bg-accent-500/20 text-accent-300 px-3 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => setResult(null)} className="btn-primary w-full">Write Another Entry</button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden space-y-5 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Therapeutic Journal</h2>
            <p className="text-sm text-slate-400">Express, reflect, and grow</p>
          </div>
          <button onClick={() => setView('write')} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
            <Plus size={16} /> Write
          </button>
        </div>
        {view === 'read' && selected && (
          <div className="space-y-4">
            <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-400 hover:text-white">
              <ChevronLeft size={18} /> Back
            </button>
            <ReadView />
          </div>
        )}
        {view === 'write' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => { setView('list'); setResult(null); }} className="text-slate-400 hover:text-white">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-bold text-white">New Entry</h2>
            </div>
            <WriteView />
          </div>
        )}
        {view === 'list' && (
          entries.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
              <p>Your journal is empty. Start writing to explore your thoughts.</p>
              <button onClick={() => setView('write')} className="btn-primary mt-4 mx-auto block">Start Journaling</button>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map(e => (
                <button key={e.id} onClick={() => { setSelected(e); setView('read'); }}
                  className="w-full glass rounded-xl p-4 text-left glass-hover">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">{format(new Date(e.created_at), 'MMM d, yyyy')}</span>
                    {e.themes && <span className="text-xs bg-accent-500/20 text-accent-300 px-2 py-0.5 rounded-full">{e.themes.split(',')[0]?.trim()}</span>}
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-3">{e.content}</p>
                  {e.ai_analysis && <p className="text-xs text-slate-500 mt-2 line-clamp-1 italic">{e.ai_analysis}</p>}
                </button>
              ))}
            </div>
          )
        )}
      </div>

      {/* Desktop: 2-panel */}
      <div className="hidden md:flex gap-4 h-[calc(100vh-56px)]">
        <div className="w-72 flex flex-col glass rounded-2xl overflow-hidden flex-shrink-0">
          <div className="p-4 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-white">Journal</h3>
              <button onClick={() => { setView('write'); setResult(null); }} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                <Plus size={12} /> Write
              </button>
            </div>
            <p className="text-xs text-slate-500">Express, reflect, and grow</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {entries.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">No entries yet</div>
            ) : entries.map(e => (
              <button key={e.id} onClick={() => { setSelected(e); setView('read'); }}
                className={`w-full rounded-xl p-3 text-left transition-all ${
                  selected?.id === e.id && view === 'read' ? 'bg-accent-500/20 border border-accent-500/30' : 'glass glass-hover'
                }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">{format(new Date(e.created_at), 'MMM d, yyyy')}</span>
                  {e.themes && <span className="text-xs bg-accent-500/20 text-accent-300 px-2 py-0.5 rounded-full truncate max-w-[80px]">{e.themes.split(',')[0]?.trim()}</span>}
                </div>
                <p className="text-xs text-slate-300 line-clamp-2">{e.content}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden glass rounded-2xl p-5">
          {view === 'read' && selected ? (
            <div className="overflow-y-auto space-y-4"><ReadView /></div>
          ) : view === 'write' ? (
            <div className="flex flex-col h-full space-y-4">
              <h2 className="text-lg font-bold text-white flex-shrink-0">New Journal Entry</h2>
              {!result ? (
                <>
                  <div className="flex gap-2 overflow-x-auto pb-1 flex-shrink-0">
                    {PROMPTS.map(p => (
                      <button key={p} onClick={() => setContent(prev => prev ? prev + '\n\n' + p : p)}
                        className="flex-shrink-0 text-xs bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-3 py-2 rounded-lg transition-colors">{p}</button>
                    ))}
                  </div>
                  <textarea value={content} onChange={e => setContent(e.target.value)}
                    placeholder="Start writing... let your thoughts flow freely. This is a safe space."
                    className="flex-1 input-field resize-none text-sm leading-relaxed" />
                  <div className="flex items-center justify-between flex-shrink-0">
                    <span className="text-xs text-slate-500">{content.length} characters</span>
                    <button onClick={submit} disabled={loading || content.trim().length < 10}
                      className="btn-primary flex items-center gap-2 py-2 px-5 text-sm">
                      {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</>
                        : <><Sparkles size={14} />Save & Analyze</>}
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="glass rounded-2xl p-5 border border-calm-500/30 bg-calm-500/5">
                    <div className="text-calm-400 font-semibold mb-2">✅ Entry saved!</div>
                    <p className="text-slate-300 text-sm leading-relaxed">{result.ai_analysis}</p>
                  </div>
                  {result.themes && (
                    <div>
                      <div className="text-xs text-slate-400 mb-2 font-medium">Themes:</div>
                      <div className="flex flex-wrap gap-2">
                        {result.themes.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                          <span key={t} className="text-xs bg-accent-500/20 text-accent-300 px-3 py-1 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <button onClick={() => setResult(null)} className="btn-primary">Write Another Entry</button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <BookOpen size={48} className="text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Your Therapeutic Journal</h3>
              <p className="text-slate-400 text-sm max-w-xs mb-6">"Journaling is like whispering to one's self and listening at the same time."</p>
              <button onClick={() => { setView('write'); setResult(null); }} className="btn-primary flex items-center gap-2">
                <Plus size={16} /> Start Writing
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
