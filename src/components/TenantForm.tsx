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
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onCancel}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', borderRadius: '16px 16px 0 0', width: '100%',
          maxWidth: '500px', maxHeight: '90vh', overflow: 'auto', padding: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
            {tenant ? 'تعديل مستأجر' : 'إضافة مستأجر'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="اسم المستأجر *" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input style={inputStyle} value={form.civilId} onChange={e => set('civilId', e.target.value)} placeholder="الرقم المدني" />
            <input style={inputStyle} value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="الجنسية" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input style={inputStyle} value={form.profession} onChange={e => set('profession', e.target.value)} placeholder="المهنة" />
            <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} type="tel" placeholder="رقم الهاتف" />
          </div>

          <select style={inputStyle} value={form.apartmentId} onChange={e => {
            const apt = apartments.find(a => a.id === e.target.value);
            setForm(prev => ({ ...prev, apartmentId: e.target.value, floor: apt?.floor || '', rentAmount: apt?.rentAmount || prev.rentAmount }));
          }} required>
            <option value="">اختر الشقة *</option>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input style={inputStyle} type="number" value={form.rentAmount || ''} onChange={e => set('rentAmount', Number(e.target.value))} required placeholder="الإيجار (د.ك) *" />
            <select style={inputStyle} value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
              <option value="نقدا">نقدا</option>
              <option value="شيك">شيك</option>
              <option value="تحويل">تحويل بنكي</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>بداية العقد</label>
              <input style={{ ...inputStyle, direction: 'ltr' }} type="date" value={form.leaseStart} onChange={e => set('leaseStart', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>نهاية العقد</label>
              <input style={{ ...inputStyle, direction: 'ltr' }} type="date" value={form.leaseEnd} onChange={e => set('leaseEnd', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button type="submit" style={{
              flex: 1, padding: '11px', borderRadius: '8px', border: 'none',
              background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}>
              {tenant ? 'تحديث' : 'إضافة'}
            </button>
            <button type="button" onClick={onCancel} style={{
              padding: '11px 20px', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', cursor: 'pointer',
            }}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
