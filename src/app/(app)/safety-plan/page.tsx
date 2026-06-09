'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, X, Phone } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface Contact { name: string; phone: string; }

export default function SafetyPlanPage() {
  const { user } = useAuth();
  const [warningSigns, setWarningSigns] = useState<string[]>([]);
  const [copingStrategies, setCopingStrategies] = useState<string[]>([]);
  const [supportContacts, setSupportContacts] = useState<Contact[]>([]);
  const [professionalContacts, setProfessionalContacts] = useState<Contact[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    axios.get(`/api/safety-plan/${user.id}`).then(r => {
      if (r.data) {
        setWarningSigns(r.data.warning_signs || []);
        setCopingStrategies(r.data.coping_strategies || []);
        setSupportContacts(r.data.support_contacts || []);
        setProfessionalContacts(r.data.professional_contacts || []);
      }
    }).catch(() => {});
  }, []);

  const save = useCallback(async (ws = warningSigns, cs = copingStrategies, sc = supportContacts, pc = professionalContacts) => {
    if (!user) return;
    setLoading(true);
    try {
      await axios.post(`/api/safety-plan/${user.id}`, { warning_signs: ws, coping_strategies: cs, support_contacts: sc, professional_contacts: pc });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch { /* silent */ }
    setLoading(false);
  }, [user, warningSigns, copingStrategies, supportContacts, professionalContacts]);

  const addTag = (list: string[], setList: (v: string[]) => void, max: number) => {
    if (list.length >= max) return;
    setList([...list, '']);
  };

  const updateTag = (list: string[], setList: (v: string[]) => void, i: number, val: string) => {
    const n = [...list]; n[i] = val; setList(n);
  };

  const removeTag = (list: string[], setList: (v: string[]) => void, i: number) => {
    const n = list.filter((_, j) => j !== i); setList(n);
  };

  const addContact = (list: Contact[], setList: (v: Contact[]) => void) => {
    setList([...list, { name: '', phone: '' }]);
  };

  const updateContact = (list: Contact[], setList: (v: Contact[]) => void, i: number, field: keyof Contact, val: string) => {
    const n = [...list]; n[i] = { ...n[i], [field]: val }; setList(n);
  };

  const removeContact = (list: Contact[], setList: (v: Contact[]) => void, i: number) => {
    setList(list.filter((_, j) => j !== i));
  };

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Crisis Safety Plan</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your personal plan for difficult moments</p>
        </div>
        {saved && <span className="text-sm text-calm-400 font-medium">✓ Saved</span>}
        {loading && <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />}
      </div>

      <div className="card border-red-500/30 bg-red-500/5">
        <div className="flex items-center gap-2 mb-1">
          <Phone size={16} className="text-red-400" />
          <span className="font-semibold text-red-400">In immediate danger?</span>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Call <strong className="text-white">911</strong> or the Suicide & Crisis Lifeline: <strong className="text-white">988</strong></p>
      </div>

      <div className="card border-primary-500/20 bg-primary-500/5">
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Shield size={14} className="text-primary-400" />
          Your safety plan is private and only accessible to you.
        </div>
      </div>

      {/* Warning Signs */}
      <Section title="⚠️ Warning Signs" desc='Signs that tell you "I need support"'>
        <div className="space-y-2">
          {warningSigns.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input value={s} onChange={e => updateTag(warningSigns, setWarningSigns, i, e.target.value)}
                onBlur={() => save(warningSigns)} placeholder="e.g. I stop talking to friends" className="input-field text-sm" />
              <button onClick={() => { removeTag(warningSigns, setWarningSigns, i); save(warningSigns.filter((_, j) => j !== i)); }} className="text-slate-500 hover:text-red-400"><X size={16} /></button>
            </div>
          ))}
          {warningSigns.length < 6 && <button onClick={() => addTag(warningSigns, setWarningSigns, 6)} className="btn-ghost text-sm flex items-center gap-2"><Plus size={14} />Add sign</button>}
        </div>
      </Section>

      {/* Coping Strategies */}
      <Section title="💡 Coping Strategies" desc="Things that help me feel better">
        <div className="space-y-2">
          {copingStrategies.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input value={s} onChange={e => updateTag(copingStrategies, setCopingStrategies, i, e.target.value)}
                onBlur={() => save(undefined, copingStrategies)} placeholder="e.g. Take a walk outside" className="input-field text-sm" />
              <button onClick={() => { removeTag(copingStrategies, setCopingStrategies, i); save(undefined, copingStrategies.filter((_, j) => j !== i)); }} className="text-slate-500 hover:text-red-400"><X size={16} /></button>
            </div>
          ))}
          {copingStrategies.length < 6 && <button onClick={() => addTag(copingStrategies, setCopingStrategies, 6)} className="btn-ghost text-sm flex items-center gap-2"><Plus size={14} />Add strategy</button>}
        </div>
      </Section>

      {/* Support Contacts */}
      <Section title="👥 Support Contacts" desc="People I trust and can call">
        <div className="space-y-3">
          {supportContacts.map((c, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input value={c.name} onChange={e => updateContact(supportContacts, setSupportContacts, i, 'name', e.target.value)}
                  onBlur={() => save(undefined, undefined, supportContacts)} placeholder="Name" className="input-field text-sm" />
                <input value={c.phone} onChange={e => updateContact(supportContacts, setSupportContacts, i, 'phone', e.target.value)}
                  onBlur={() => save(undefined, undefined, supportContacts)} placeholder="Phone" className="input-field text-sm" />
              </div>
              <button onClick={() => { removeContact(supportContacts, setSupportContacts, i); save(undefined, undefined, supportContacts.filter((_, j) => j !== i)); }} className="text-slate-500 hover:text-red-400 pt-2.5"><X size={16} /></button>
            </div>
          ))}
          {supportContacts.length < 4 && <button onClick={() => addContact(supportContacts, setSupportContacts)} className="btn-ghost text-sm flex items-center gap-2"><Plus size={14} />Add contact</button>}
        </div>
      </Section>

      {/* Professional Contacts */}
      <Section title="🏥 Professional Contacts" desc="My therapist, doctor, or crisis lines">
        <div className="space-y-3">
          {professionalContacts.map((c, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input value={c.name} onChange={e => updateContact(professionalContacts, setProfessionalContacts, i, 'name', e.target.value)}
                  onBlur={() => save(undefined, undefined, undefined, professionalContacts)} placeholder="Name / Service" className="input-field text-sm" />
                <input value={c.phone} onChange={e => updateContact(professionalContacts, setProfessionalContacts, i, 'phone', e.target.value)}
                  onBlur={() => save(undefined, undefined, undefined, professionalContacts)} placeholder="Phone / Number" className="input-field text-sm" />
              </div>
              <button onClick={() => { removeContact(professionalContacts, setProfessionalContacts, i); save(undefined, undefined, undefined, professionalContacts.filter((_, j) => j !== i)); }} className="text-slate-500 hover:text-red-400 pt-2.5"><X size={16} /></button>
            </div>
          ))}
          {professionalContacts.length < 3 && <button onClick={() => addContact(professionalContacts, setProfessionalContacts)} className="btn-ghost text-sm flex items-center gap-2"><Plus size={14} />Add contact</button>}
        </div>
      </Section>

      <button onClick={() => save()} className="btn-primary w-full">Save Safety Plan</button>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="card space-y-3">
      <div>
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      </div>
      {children}
    </div>
  );
}
