'use client';

import { useState, useEffect } from 'react';
import { Tenant, Apartment } from '@/lib/types';
import { getApartments, generateId } from '@/lib/store';
import { floors } from '@/lib/data';

interface Props {
  tenant?: Tenant | null;
  onSave: (tenant: Tenant) => void;
  onCancel: () => void;
}

export default function TenantForm({ tenant, onSave, onCancel }: Props) {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [form, setForm] = useState<Tenant>({
    id: '', name: '', civilId: '', nationality: '', profession: '', phone: '',
    apartmentId: '', floor: '', rentAmount: 0, leaseStart: '', leaseEnd: '',
    leaseDuration: 'سنة', paymentMethod: 'نقدا', registrationDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    setApartments(getApartments());
    if (tenant) setForm(tenant);
  }, [tenant]);

  const vacantApts = apartments.filter(a => a.status === 'vacant' || a.id === tenant?.apartmentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const apt = apartments.find(a => a.id === form.apartmentId);
    onSave({ ...form, id: form.id || generateId(), floor: apt?.floor || form.floor });
  };

  const set = (key: keyof Tenant, value: string | number) => setForm(prev => ({ ...prev, [key]: value }));

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    }} onClick={onCancel}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', borderRadius: '24px 24px 0 0', width: '100%',
          maxWidth: '500px', maxHeight: '90vh', overflow: 'auto', padding: '24px 20px',
        }}
      >
        <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
            {tenant ? 'تعديل مستأجر / Edit Tenant' : 'إضافة مستأجر / Add Tenant'}
          </h2>
          <button onClick={onCancel} style={{ background: 'var(--bg)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '18px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="اسم المستأجر / Tenant Name *">
            <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="الاسم الكامل" />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="الرقم المدني / Civil ID">
              <input style={inputStyle} value={form.civilId} onChange={e => set('civilId', e.target.value)} placeholder="000000000000" />
            </Field>
            <Field label="الجنسية / Nationality">
              <input style={inputStyle} value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="مصري، هندي..." />
            </Field>
          </div>

          <Field label="المهنة / Profession">
            <input style={inputStyle} value={form.profession} onChange={e => set('profession', e.target.value)} />
          </Field>

          <Field label="رقم الهاتف / Phone">
            <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} type="tel" placeholder="96550000" />
          </Field>

          <Field label="الشقة / Apartment *">
            <select style={inputStyle} value={form.apartmentId} onChange={e => {
              const apt = apartments.find(a => a.id === e.target.value);
              setForm(prev => ({ ...prev, apartmentId: e.target.value, floor: apt?.floor || '', rentAmount: apt?.rentAmount || prev.rentAmount }));
            }} required>
              <option value="">اختر الشقة / Select apartment</option>
              {floors.map(f => {
                const floorApts = vacantApts.filter(a => a.floor === f.key);
                if (floorApts.length === 0) return null;
                return (
                  <optgroup key={f.key} label={`الدور ${f.label}`}>
                    {floorApts.map(a => <option key={a.id} value={a.id}>شقة {a.number}</option>)}
                  </optgroup>
                );
              })}
            </select>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="الإيجار / Rent (KWD) *">
              <input style={inputStyle} type="number" value={form.rentAmount || ''} onChange={e => set('rentAmount', Number(e.target.value))} required />
            </Field>
            <Field label="طريقة الدفع / Payment">
              <select style={inputStyle} value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
                <option value="نقدا">نقدا / Cash</option>
                <option value="شيك">شيك / Check</option>
                <option value="تحويل">تحويل بنكي / Transfer</option>
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="بداية العقد / Start">
              <input style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }} type="date" value={form.leaseStart} onChange={e => set('leaseStart', e.target.value)} />
            </Field>
            <Field label="نهاية العقد / End">
              <input style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }} type="date" value={form.leaseEnd} onChange={e => set('leaseEnd', e.target.value)} />
            </Field>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" style={{
              flex: 1, padding: '13px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #1e3a5f, #2a5298)', color: '#fff',
              fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            }}>
              {tenant ? 'تحديث / Update' : 'إضافة / Add'}
            </button>
            <button type="button" onClick={onCancel} style={{
              padding: '13px 24px', borderRadius: '12px', border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text)', fontSize: '15px', cursor: 'pointer',
            }}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>{label}</label>
      {children}
    </div>
  );
}
