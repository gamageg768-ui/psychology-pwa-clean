'use client';

import { useState, useEffect } from 'react';
import { Pill, Plus, Check, X, Clock, Trash2 } from 'lucide-react';
import { medicationsApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Medication } from '@/types';
import { format } from 'date-fns';

const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Every other day', 'Weekly', 'As needed'];
const TIMES = ['Morning', 'Afternoon', 'Evening', 'Bedtime', 'With meals', 'As prescribed'];

export default function MedicationsPage() {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', dosage: '', frequency: 'Once daily', time_of_day: 'Morning', notes: '' });
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => { load(); }, []);

  const load = async () => {
    if (!user) return;
    const res = await medicationsApi.list(user.id);
    setMedications(res.data);
  };

  const addMedication = async () => {
    if (!user || !form.name.trim() || !form.dosage.trim()) return;
    setSaving(true);
    await medicationsApi.create(user.id, form);
    setForm({ name: '', dosage: '', frequency: 'Once daily', time_of_day: 'Morning', notes: '' });
    setShowForm(false);
    load();
    setSaving(false);
  };

  const toggle = async (medicationId: number, taken: boolean) => {
    await medicationsApi.log(medicationId, today, !taken);
    load();
  };

  const remove = async (medicationId: number) => {
    if (!user) return;
    await medicationsApi.deactivate(user.id, medicationId);
    load();
  };

  const todayStatus = (med: Medication) => {
    const todayLog = med.logs?.find(l => l.date === today);
    return todayLog?.taken ?? false;
  };

  const adherenceRate = (med: Medication) => {
    if (!med.logs?.length) return 0;
    const taken = med.logs.filter(l => l.taken).length;
    return Math.round((taken / med.logs.length) * 100);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Medications</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Track prescriptions & supplements</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm px-3 py-2">
          <Plus size={15} /> Add
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Add Medication / Supplement</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Sertraline" className="input-field" />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Dosage *</label>
              <input value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
                placeholder="e.g. 50mg" className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Frequency</label>
              <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                className="input-field">
                {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Time of Day</label>
              <select value={form.time_of_day} onChange={e => setForm(f => ({ ...f, time_of_day: e.target.value }))}
                className="input-field">
                {TIMES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Notes (side effects to watch, instructions...)" rows={2} className="input-field resize-none" />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl text-sm font-medium"
              style={{ background: 'var(--subtle-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Cancel
            </button>
            <button onClick={addMedication} disabled={saving || !form.name.trim() || !form.dosage.trim()}
              className="flex-1 btn-primary text-sm">
              {saving ? 'Saving...' : 'Add Medication'}
            </button>
          </div>
        </div>
      )}

      {medications.length === 0 && !showForm && (
        <div className="card text-center py-10">
          <Pill size={36} className="mx-auto mb-3 text-indigo-400" />
          <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No medications tracked</div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Add your prescriptions or supplements to track adherence.</p>
        </div>
      )}

      <div className="space-y-3">
        {medications.map(med => {
          const taken = todayStatus(med);
          const rate = adherenceRate(med);
          return (
            <div key={med.id} className="card">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  taken ? 'bg-emerald-500' : ''
                }`}
                  style={!taken ? { background: 'var(--subtle-bg)', border: '1px solid var(--border)' } : {}}>
                  <Pill size={18} className={taken ? 'text-white' : ''} style={!taken ? { color: 'var(--text-muted)' } : {}} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{med.name}</span>
                    <button onClick={() => remove(med.id)} className="p-1 rounded-lg opacity-40 hover:opacity-100 transition-opacity">
                      <Trash2 size={13} style={{ color: '#ef4444' }} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                      {med.dosage}
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <Clock size={10} /> {med.time_of_day}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{med.frequency}</span>
                  </div>
                  {med.logs && med.logs.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>14-day adherence</span>
                        <span className="text-xs font-semibold" style={{ color: rate >= 80 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444' }}>
                          {rate}%
                        </span>
                      </div>
                      <div className="flex gap-0.5">
                        {med.logs.slice(0, 14).reverse().map((l, i) => (
                          <div key={i} className="flex-1 h-2 rounded-sm" style={{
                            background: l.taken ? '#10b981' : '#ef444430',
                          }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 flex gap-2" style={{ borderTop: '1px solid var(--border)' }}>
                <button onClick={() => toggle(med.id, taken)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
                    taken ? 'bg-emerald-500/10 text-emerald-400' : ''
                  }`}
                  style={!taken ? { background: 'var(--subtle-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' } : {}}>
                  {taken ? <><Check size={14} /> Taken Today</> : <><X size={14} /> Mark as Taken</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
