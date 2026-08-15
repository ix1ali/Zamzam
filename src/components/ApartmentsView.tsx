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
  const totalRent = apartments.reduce((s, a) => s + a.rentAmount, 0);
  const flagged = apartments.filter(a => a.flagged).length;

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
    <div style={{ padding: '0' }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2a5298 100%)',
        padding: '20px 20px 24px', color: '#fff', borderRadius: '0 0 20px 20px',
      }}>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '14px' }}>الشقق / Apartments</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          <HeaderStat value={apartments.length.toString()} label="إجمالي" />
          <HeaderStat value={occupied.toString()} label="مشغولة" />
          <HeaderStat value={vacant.toString()} label="شاغرة" highlight={vacant > 0} />
          <HeaderStat value={flagged > 0 ? `⚑ ${flagged}` : `${totalRent.toLocaleString()}`} label={flagged > 0 ? 'مُعلّمة' : 'إيرادات'} />
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {[...floorGroups].reverse().map(floor => {
          const isOpen = openFloors.has(floor.key);
          const floorOccupied = floor.apartments.filter(a => a.status === 'occupied').length;
          const floorVacant = floor.apartments.filter(a => a.status === 'vacant').length;
          const floorRent = floor.apartments.reduce((s, a) => s + a.rentAmount, 0);

          return (
            <div key={floor.key} style={{
              background: 'var(--bg-card)', borderRadius: isOpen ? 'var(--radius)' : 'var(--radius-sm)',
              marginBottom: '8px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)',
              overflow: 'hidden', transition: 'all 0.2s',
            }}>
              <div
                onClick={() => toggleFloor(floor.key)}
                style={{
                  padding: '12px 16px', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: isOpen ? 'var(--primary-light)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: 'var(--primary)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700,
                  }}>
                    {floor.prefix}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>الدور {floor.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{floor.apartments.length} شقة - {floorRent} د.ك</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{
                    background: 'var(--success-light)', color: 'var(--success)',
                    padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                  }}>{floorOccupied}</span>
                  {floorVacant > 0 && (
                    <span style={{
                      background: '#fde8ea', color: '#dc3545',
                      padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                    }}>{floorVacant}</span>
                  )}
                  <svg width="14" height="14" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {isOpen && (
                <div style={{ padding: '10px 14px 14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                  {floor.apartments.map(apt => {
                    const tenant = tenants.find(t => t.id === apt.tenantId);
                    const isOccupied = apt.status === 'occupied';
                    const isVacant = apt.status === 'vacant';
                    return (
                      <div
                        key={apt.id}
                        onClick={() => setEditingApt(apt)}
                        style={{
                          background: isVacant ? '#fde8ea' : apt.flagged ? '#fff8e1' : 'var(--success-light)',
                          borderRadius: '10px', padding: '10px',
                          border: `2px solid ${isVacant ? '#dc3545' : apt.flagged ? '#e67e22' : 'var(--success)'}`,
                          textAlign: 'center', cursor: 'pointer',
                          position: 'relative',
                        }}
                      >
                        {apt.flagged && (
                          <div style={{ position: 'absolute', top: '4px', left: '4px', fontSize: '12px' }}>⚑</div>
                        )}
                        {apt.notes && (
                          <div style={{ position: 'absolute', top: '4px', right: '4px', fontSize: '10px' }}>📝</div>
                        )}
                        <div style={{
                          fontWeight: 700, fontSize: '18px',
                          color: isVacant ? '#dc3545' : apt.flagged ? '#e67e22' : 'var(--success)',
                        }}>
                          {apt.number}
                        </div>
                        {tenant ? (
                          <>
                            <div style={{ fontSize: '10px', fontWeight: 500, marginTop: '3px', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {tenant.name.split(' ').slice(0, 2).join(' ')}
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>{apt.rentAmount} د.ك</div>
                          </>
                        ) : (
                          <div style={{ fontSize: '11px', color: '#dc3545', marginTop: '4px', fontWeight: 700 }}>شاغرة</div>
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

function HeaderStat({ value, label, highlight }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div style={{
      background: highlight ? 'rgba(220,53,69,0.3)' : 'rgba(255,255,255,0.12)',
      borderRadius: '10px', padding: '10px 6px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '18px', fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: '9px', opacity: 0.9 }}>{label}</div>
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

  const handleSave = () => {
    onSave({ ...apartment, notes, flagged, flagReason: flagged ? flagReason : '' });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-card)', borderRadius: '24px 24px 0 0', width: '100%',
        maxWidth: '500px', padding: '24px 20px', maxHeight: '80vh', overflowY: 'auto',
      }}>
        <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 16px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>شقة {apartment.number}</h2>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>الدور {apartment.floor}</div>
          </div>
          <span style={{
            padding: '4px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            background: apartment.status === 'occupied' ? 'var(--success-light)' : '#fde8ea',
            color: apartment.status === 'occupied' ? 'var(--success)' : '#dc3545',
          }}>
            {apartment.status === 'occupied' ? 'مشغولة' : 'شاغرة'}
          </span>
        </div>

        {tenant && (
          <div style={{
            background: 'var(--primary-light)', padding: '12px 14px', borderRadius: '10px',
            fontSize: '13px', marginBottom: '16px',
          }}>
            <div style={{ fontWeight: 600 }}>{tenant.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
              {tenant.phone || '-'} | {apartment.rentAmount} د.ك
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>ملاحظات / Notes</label>
            <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="إضافة ملاحظات على الشقة..." />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={flagged} onChange={e => setFlagged(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#e67e22' }} />
              تعليم الشقة / Flag
            </label>
          </div>

          {flagged && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>سبب التعليم / Flag Reason</label>
              <input style={inputStyle} value={flagReason} onChange={e => setFlagReason(e.target.value)} placeholder="سبب التعليم..." />
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button onClick={handleSave} style={{
              flex: 1, padding: '13px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #1e3a5f, #2a5298)', color: '#fff',
              fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            }}>حفظ / Save</button>
            <button onClick={onClose} style={{
              padding: '13px 24px', borderRadius: '12px', border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text)', fontSize: '15px', cursor: 'pointer',
            }}>إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  );
}
