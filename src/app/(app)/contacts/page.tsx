'use client';

import { useState, useEffect } from 'react';
import { Phone, Plus, Trash2, AlertTriangle, Heart, Shield, ExternalLink } from 'lucide-react';
import { contactsApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { TrustedContact } from '@/types';

const CRISIS_LINES = [
  { name: 'National Suicide Prevention Lifeline', number: '988', country: 'US' },
  { name: 'Crisis Text Line', number: 'Text HOME to 741741', country: 'US' },
  { name: 'Samaritans UK', number: '116 123', country: 'UK' },
  { name: 'Lifeline Australia', number: '13 11 14', country: 'AU' },
  { name: 'International Association for Suicide Prevention', number: 'https://www.iasp.info/resources/Crisis_Centres/', country: 'Global' },
];

const RELATIONS = ['Partner', 'Family Member', 'Close Friend', 'Therapist', 'Counsellor', 'GP / Doctor', 'Other'];

export default function ContactsPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', relation: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    if (!user) return;
    const res = await contactsApi.list(user.id);
    setContacts(res.data);
  };

  const add = async () => {
    if (!user || !form.name.trim() || !form.phone.trim()) return;
    setSaving(true);
    try {
      await contactsApi.add(user.id, form.name, form.phone, form.relation);
      setForm({ name: '', phone: '', relation: '' });
      setShowForm(false);
      load();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const remove = async (id: number) => {
    if (!user) return;
    await contactsApi.remove(user.id, id);
    load();
  };

  const escalate = async () => {
    if (!user) return;
    setEscalating(true);
    await contactsApi.escalate(user.id, 'Crisis button activated from MindSpace app');
    setEscalated(true);
    setEscalating(false);
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Crisis & Contacts</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Trusted contacts and emergency resources</p>
      </div>

      {/* SOS Button */}
      <div className="card text-center py-6 space-y-3" style={{ borderColor: '#ef4444', border: '1px solid #ef444440' }}>
        <div className="flex items-center justify-center gap-2 mb-1">
          <AlertTriangle size={16} style={{ color: '#ef4444' }} />
          <span className="text-sm font-semibold" style={{ color: '#ef4444' }}>In a Crisis Right Now?</span>
        </div>
        {escalated ? (
          <div className="py-4">
            <Shield size={32} className="mx-auto mb-2 text-emerald-400" />
            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Crisis Event Logged</div>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Reach out to your trusted contacts or call a crisis line below.</p>
          </div>
        ) : (
          <>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Tap to log a crisis event and see your support resources. You are not alone.
            </p>
            <button onClick={escalate} disabled={escalating}
              className="mx-auto flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
              style={{ background: '#ef4444' }}>
              {escalating
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Please wait...</>
                : <><AlertTriangle size={16} /> I Need Help Now</>}
            </button>
          </>
        )}
      </div>

      {/* Trusted Contacts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart size={15} className="text-indigo-400" />
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Trusted Contacts ({contacts.length}/5)</h3>
          </div>
          {contacts.length < 5 && (
            <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
              <Plus size={12} /> Add
            </button>
          )}
        </div>

        {showForm && (
          <div className="card space-y-3 mb-3">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Full name" className="input-field" />
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="Phone number" type="tel" className="input-field" />
            <select value={form.relation} onChange={e => setForm(f => ({ ...f, relation: e.target.value }))}
              className="input-field">
              <option value="">Relationship (optional)</option>
              {RELATIONS.map(r => <option key={r}>{r}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl text-sm"
                style={{ background: 'var(--subtle-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
              <button onClick={add} disabled={saving || !form.name.trim() || !form.phone.trim()}
                className="flex-1 btn-primary text-sm">
                {saving ? 'Saving...' : 'Add Contact'}
              </button>
            </div>
          </div>
        )}

        {contacts.length === 0 && !showForm && (
          <div className="card text-center py-8">
            <Phone size={28} className="mx-auto mb-2 text-indigo-400" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No trusted contacts added yet. Add up to 5 people you can reach in a crisis.</p>
          </div>
        )}

        <div className="space-y-2">
          {contacts.map(c => (
            <div key={c.id} className="card flex items-center gap-3" style={{ padding: '0.75rem 1rem' }}>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-base">👤</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{c.name}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.phone}{c.relation ? ` · ${c.relation}` : ''}</div>
              </div>
              <a href={`tel:${c.phone}`} className="p-2 rounded-lg" style={{ background: '#10b98115', color: '#10b981' }}>
                <Phone size={14} />
              </a>
              <button onClick={() => remove(c.id)} className="p-2 rounded-lg opacity-40 hover:opacity-100 transition-opacity">
                <Trash2 size={13} style={{ color: '#ef4444' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Crisis Lines */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Shield size={15} className="text-indigo-400" />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Crisis Hotlines</h3>
        </div>
        <div className="space-y-2">
          {CRISIS_LINES.map(line => (
            <div key={line.name} className="card flex items-center gap-3" style={{ padding: '0.75rem 1rem' }}>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{line.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold" style={{ color: '#6366f1' }}>{line.number}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--subtle-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    {line.country}
                  </span>
                </div>
              </div>
              {line.number.startsWith('http') ? (
                <a href={line.number} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                  <ExternalLink size={14} />
                </a>
              ) : (
                <a href={`tel:${line.number.replace(/\D/g, '')}`}
                  className="p-2 rounded-lg" style={{ background: '#10b98115', color: '#10b981' }}>
                  <Phone size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
