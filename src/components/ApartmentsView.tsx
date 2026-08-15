'use client';

import { useState, useEffect } from 'react';
import { Apartment, Tenant } from '@/lib/types';
import { getApartments, getTenants } from '@/lib/store';
import { floors } from '@/lib/data';

export default function ApartmentsView() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [openFloors, setOpenFloors] = useState<Set<string>>(new Set());

  useEffect(() => {
    setApartments(getApartments());
    setTenants(getTenants());
  }, []);

  const occupied = apartments.filter(a => a.status === 'occupied').length;
  const vacant = apartments.filter(a => a.status === 'vacant').length;
  const totalRent = apartments.reduce((s, a) => s + a.rentAmount, 0);

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
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2a5298 100%)',
        padding: '20px 20px 24px', color: '#fff', borderRadius: '0 0 20px 20px',
      }}>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '14px' }}>الشقق / Apartments</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          <HeaderStat value={apartments.length.toString()} label="إجمالي" labelEn="Total" />
          <HeaderStat value={occupied.toString()} label="مشغولة" labelEn="Occupied" />
          <HeaderStat value={vacant.toString()} label="شاغرة" labelEn="Vacant" />
          <HeaderStat value={`${totalRent.toLocaleString()}`} label="إيرادات" labelEn="KWD/mo" />
        </div>
      </div>

      {/* Building Visualization */}
      <div style={{ padding: '14px 16px' }}>
        {floorGroups.reverse().map(floor => {
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
                      background: 'var(--warning-light)', color: 'var(--warning)',
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
                    return (
                      <div key={apt.id} style={{
                        background: isOccupied ? 'var(--success-light)' : 'var(--warning-light)',
                        borderRadius: '10px', padding: '10px',
                        border: `1.5px solid ${isOccupied ? 'var(--success)' : 'var(--warning)'}`,
                        textAlign: 'center',
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '18px', color: isOccupied ? 'var(--success)' : 'var(--warning)' }}>
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
                          <div style={{ fontSize: '11px', color: 'var(--warning)', marginTop: '4px', fontWeight: 600 }}>شاغرة / Vacant</div>
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
    </div>
  );
}

function HeaderStat({ value, label, labelEn }: { value: string; label: string; labelEn: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 6px', textAlign: 'center' }}>
      <div style={{ fontSize: '18px', fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: '9px', opacity: 0.9 }}>{label}</div>
    </div>
  );
}
