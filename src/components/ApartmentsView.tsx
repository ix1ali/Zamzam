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
  const flaggedCount = apartments.filter(a => a.flagged).length;

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
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <LegendItem color="var(--success)" label="مشغولة" count={occupied} />
        <LegendItem color="#8b5cf6" label="شاغرة" count={vacant} />
        <LegendItem color="var(--danger)" label="معلّمة" count={flaggedCount} />
      </div>

      {/* Floors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {[...floorGroups].reverse().map(floor => {
          const isOpen = openFloors.has(floor.key);
          const floorVacant = floor.apartments.filter(a => a.status === 'vacant').length;
          const floorFlagged = floor.apartments.filter(a => a.flagged).length;
          const floorOccupied = floor.apartments.filter(a => a.status === 'occupied').length;
          const pct = floor.apartments.length > 0 ? (floorOccupied / floor.apartments.length) * 100 : 0;

          let borderColor = 'var(--border)';
          if (floorFlagged > 0) borderColor = 'var(--danger)';
          else if (floorVacant > 0) borderColor = '#8b5cf6';
          else borderColor = 'var(--success)';

          return (
            <div key={floor.key} style={{
              background: 'var(--bg-card)', borderRadius: '12px',
              border: `1px solid var(--border)`, overflow: 'hidden',
              borderRight: `3px solid ${borderColor}`,
            }}>
              <div onClick={() => toggleFloor(floor.key)} style={{
                padding: '10px 14px', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{floor.label}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>
                    {floor.apartments.length} شقة
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {floorFlagged > 0 && (
                    <span style={{ color: 'var(--danger)', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      {floorFlagged}
                    </span>
                  )}
                  {floorVacant > 0 && (
                    <span style={{ color: '#8b5cf6', fontSize: '11px', fontWeight: 600 }}>{floorVacant} شاغرة</span>
                  )}
                  {/* Mini progress bar */}
                  <div style={{ width: '40px', height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: '3px', background: pct === 100 ? 'var(--success)' : '#8b5cf6' }} />
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>

              {isOpen && (
                <div style={{ padding: '8px 12px 12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                  {floor.apartments.map(apt => {
                    const tenant = tenants.find(t => t.id === apt.tenantId);
                    const isVacant = apt.status === 'vacant';
                    const isFlagged = apt.flagged;

                    let bgColor = 'var(--bg)';
                    let borderClr = 'var(--success)';
                    let numColor = 'var(--text)';

                    if (isFlagged) {
                      bgColor = 'var(--danger-light)';
                      borderClr = 'var(--danger)';
                      numColor = 'var(--danger)';
                    } else if (isVacant) {
                      bgColor = 'rgba(139,92,246,0.1)';
                      borderClr = '#8b5cf6';
                      numColor = '#8b5cf6';
                    }

                    return (
                      <div
                        key={apt.id}
                        onClick={() => setEditingApt(apt)}
                        style={{
                          borderRadius: '10px', padding: '10px', textAlign: 'center', cursor: 'pointer',
                          border: `1.5px solid ${borderClr}`,
                          background: bgColor,
                          position: 'relative',
                          transition: 'transform 0.15s',
                        }}
                      >
                        {isFlagged && (
                          <span style={{ position: 'absolute', top: '4px', left: '6px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--danger)" stroke="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><text x="12" y="17" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">!</text></svg>
                          </span>
                        )}
                        <div style={{ fontWeight: 700, fontSize: '18px', color: numColor }}>{apt.number}</div>
                        {tenant ? (
                          <div style={{ fontSize: '9px', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-muted)' }}>
                            {tenant.name.split(' ').slice(0, 2).join(' ')}
                          </div>
                        ) : (
                          <div style={{ fontSize: '10px', color: '#8b5cf6', fontWeight: 600, marginTop: '3px' }}>شاغرة</div>
                        )}
                        {tenant && (
                          <div style={{ fontSize: '9px', color: 'var(--success)', marginTop: '2px', fontWeight: 600 }}>{apt.rentAmount} د.ك</div>
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

function LegendItem({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: color }} />
      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '11px', fontWeight: 600, color }}>{count}</span>
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

  const isVacant = apartment.status === 'vacant';
  const statusColor = apartment.flagged ? 'var(--danger)' : isVacant ? '#8b5cf6' : 'var(--success)';
  const statusLabel = apartment.flagged ? 'معلّمة' : isVacant ? 'شاغرة' : 'مشغولة';

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
            <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>{apartment.floor}</span>
              <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, background: statusColor, color: '#fff' }}>{statusLabel}</span>
            </div>
          </div>
        </div>

        {tenant && (
          <div style={{ background: 'var(--bg)', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px', borderRight: '3px solid var(--success)' }}>
            <div style={{ fontWeight: 600 }}>{tenant.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>{tenant.phone || '-'}</span>
              <span style={{ fontWeight: 600, color: 'var(--success)' }}>{apartment.rentAmount} د.ك</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="ملاحظات..." />

          <label style={{ fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: flagged ? 'var(--danger)' : 'var(--text)' }}>
            <input type="checkbox" checked={flagged} onChange={e => setFlagged(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--danger)' }} />
            تعليم الشقة (تحذير)
          </label>

          {flagged && <input style={{ ...inputStyle, borderColor: 'var(--danger)' }} value={flagReason} onChange={e => setFlagReason(e.target.value)} placeholder="سبب التعليم..." />}

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
