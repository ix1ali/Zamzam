'use client';

import { useState, useEffect, useCallback } from 'react';
import { Apartment, Tenant } from '@/lib/types';
import { getApartments, getTenants, updateApartment } from '@/lib/store';
import { floors } from '@/lib/data';

export default function ApartmentsView() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [openFloors, setOpenFloors] = useState<Set<string>>(new Set());
  const [editingApt, setEditingApt] = useState<Apartment | null>(null);

  const reload = useCallback(() => {
    setApartments(getApartments());
    setTenants(getTenants());
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const occupied = apartments.filter(a => a.status === 'occupied').length;
  const vacant = apartments.filter(a => a.status === 'vacant').length;

  const toggleFloor = (key: string) => {
    const s = new Set(openFloors);
    s.has(key) ? s.delete(key) : s.add(key);
    setOpenFloors(s);
  };

  const floorGroups = floors.map(f => ({
    ...f,
    apartments: apartments.filter(a => a.floor === f.key),
  })).filter(f => f.apartments.length > 0);

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '14px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>الشقق</h1>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {apartments.length} شقة — {occupied} مشغولة
          {vacant > 0 && <span style={{ color: 'var(--danger)', fontWeight: 600 }}> — {vacant} شاغرة</span>}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {[...floorGroups].reverse().map(floor => {
          const isOpen = openFloors.has(floor.key);
          const floorVacant = floor.apartments.filter(a => a.status === 'vacant').length;

          return (
            <div key={floor.key} style={{
              background: 'var(--bg-card)', borderRadius: '10px',
              border: '1px solid var(--border)', overflow: 'hidden',
            }}>
              <div onClick={() => toggleFloor(floor.key)} style={{
                padding: '10px 14px', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>
                  {floor.label}
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400, marginRight: '8px' }}>
                    {floor.apartments.length} شقة
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {floorVacant > 0 && (
                    <span style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: 600 }}>{floorVacant} شاغرة</span>
                  )}
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>

              {isOpen && (
                <div style={{ padding: '8px 12px 12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '6px' }}>
                  {floor.apartments.map(apt => {
                    const tenant = tenants.find(t => t.id === apt.tenantId);
                    const isVacant = apt.status === 'vacant';
                    return (
                      <div
                        key={apt.id}
                        onClick={() => setEditingApt(apt)}
                        style={{
                          borderRadius: '8px', padding: '8px', textAlign: 'center', cursor: 'pointer',
                          border: `1.5px solid ${isVacant ? 'var(--danger)' : apt.flagged ? 'var(--warning)' : 'var(--border)'}`,
                          background: isVacant ? 'var(--danger-light)' : apt.flagged ? 'var(--warning-light)' : 'var(--bg)',
                          position: 'relative',
                        }}
                      >
                        {apt.flagged && <span style={{ position: 'absolute', top: '2px', left: '4px', fontSize: '10px' }}>⚑</span>}
                        <div style={{
                          fontWeight: 700, fontSize: '16px',
                          color: isVacant ? 'var(--danger)' : 'var(--text)',
                        }}>{apt.number}</div>
                        {tenant ? (
                          <div style={{ fontSize: '9px', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-muted)' }}>
                            {tenant.name.split(' ').slice(0, 2).join(' ')}
                          </div>
                        ) : (
                          <div style={{ fontSize: '10px', color: 'var(--danger)', fontWeight: 600, marginTop: '2px' }}>شاغرة</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editingApt && (
        <ApartmentDetail
          apartment={editingApt}
          tenant={tenants.find(t => t.id === editingApt.tenantId) || null}
          onSave={(updated) => { updateApartment(updated); setEditingApt(null); reload(); }}
          onClose={() => setEditingApt(null)}
        />
      )}
    </div>
  );
}

function ApartmentDetail({ apartment, tenant, onSave, onClose }: {
  apartment: Apartment; tenant: Tenant | null;
  onSave: (a: Apartment) => void; onClose: () => void;
}) {
  const [notes, setNotes] = useState(apartment.notes || '');
  const [flagged, setFlagged] = useState(apartment.flagged || false);
  const [flagReason, setFlagReason] = useState(apartment.flagReason || '');

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-card)', borderRadius: '16px 16px 0 0', width: '100%',
        maxWidth: '500px', padding: '20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>شقة {apartment.number}</h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{apartment.floor} — {apartment.status === 'occupied' ? 'مشغولة' : 'شاغرة'}</div>
          </div>
        </div>

        {tenant && (
          <div style={{ background: 'var(--bg)', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>
            <div style={{ fontWeight: 600 }}>{tenant.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{tenant.phone || '-'} | {apartment.rentAmount} د.ك</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="ملاحظات..." />

          <label style={{ fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={flagged} onChange={e => setFlagged(e.target.checked)} style={{ width: '16px', height: '16px' }} />
            تعليم الشقة
          </label>

          {flagged && <input style={inputStyle} value={flagReason} onChange={e => setFlagReason(e.target.value)} placeholder="سبب التعليم..." />}

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button onClick={() => onSave({ ...apartment, notes, flagged, flagReason: flagged ? flagReason : '' })} style={{
              flex: 1, padding: '11px', borderRadius: '8px', border: 'none',
              background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}>حفظ</button>
            <button onClick={onClose} style={{
              padding: '11px 20px', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', cursor: 'pointer',
            }}>إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  );
}
