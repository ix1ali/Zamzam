'use client';

import { useState, useEffect } from 'react';
import { Tenant } from '@/lib/types';
import { getTenants, getApartments } from '@/lib/store';
import { printContract } from '@/lib/pdf';

type FilterType = 'all' | 'active' | 'expiring' | 'expired' | 'no-contract';

export default function ContractsView() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => { setTenants(getTenants()); }, []);

  const apartments = getApartments();
  const now = new Date();

  const categorize = (t: Tenant) => {
    if (!t.leaseStart || !t.leaseEnd) return 'no-contract';
    const end = new Date(t.leaseEnd);
    if (end < now) return 'expired';
    const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 90) return 'expiring';
    return 'active';
  };

  const filtered = filter === 'all' ? tenants : tenants.filter(t => categorize(t) === filter);

  const counts = {
    all: tenants.length,
    active: tenants.filter(t => categorize(t) === 'active').length,
    expiring: tenants.filter(t => categorize(t) === 'expiring').length,
    expired: tenants.filter(t => categorize(t) === 'expired').length,
    'no-contract': tenants.filter(t => categorize(t) === 'no-contract').length,
  };

  const filters: { id: FilterType; label: string; color: string }[] = [
    { id: 'all', label: 'الكل', color: 'var(--primary)' },
    { id: 'active', label: 'سارية', color: 'var(--success)' },
    { id: 'expiring', label: 'تنتهي قريبا', color: 'var(--warning)' },
    { id: 'expired', label: 'منتهية', color: 'var(--danger)' },
    { id: 'no-contract', label: 'بدون عقد', color: 'var(--text-muted)' },
  ];

  const statusStyle = (cat: string) => {
    switch (cat) {
      case 'active': return { color: 'var(--success)', label: 'ساري' };
      case 'expiring': return { color: 'var(--warning)', label: 'ينتهي قريبا' };
      case 'expired': return { color: 'var(--danger)', label: 'منتهي' };
      default: return { color: 'var(--text-muted)', label: 'بدون عقد' };
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '12px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>العقود</h1>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {counts.active} سارية — {counts.expiring} تنتهي — {counts.expired} منتهية
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600,
            whiteSpace: 'nowrap', border: '1px solid',
            background: filter === f.id ? f.color : 'var(--bg-card)',
            color: filter === f.id ? '#fff' : f.color,
            borderColor: filter === f.id ? f.color : 'var(--border)',
            cursor: 'pointer',
          }}>
            {f.label} ({counts[f.id]})
          </button>
        ))}
      </div>

      {/* Contract Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(t => {
          const cat = categorize(t);
          const info = statusStyle(cat);
          const apt = apartments.find(a => a.id === t.apartmentId);
          const daysLeft = t.leaseEnd ? Math.ceil((new Date(t.leaseEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

          return (
            <div key={t.id} style={{
              background: 'var(--bg-card)', borderRadius: '10px',
              border: '1px solid var(--border)', overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>شقة {apt?.number} — {t.floor}</div>
                  </div>
                  <span style={{ color: info.color, fontSize: '11px', fontWeight: 700 }}>{info.label}</span>
                </div>

                {t.leaseStart && t.leaseEnd ? (
                  <div style={{ display: 'flex', gap: '8px', fontSize: '12px', marginBottom: '8px' }}>
                    <div style={{ background: 'var(--bg)', padding: '6px 10px', borderRadius: '6px', flex: 1 }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>من </span>
                      <span style={{ fontWeight: 600 }}>{t.leaseStart}</span>
                    </div>
                    <div style={{ background: 'var(--bg)', padding: '6px 10px', borderRadius: '6px', flex: 1 }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>إلى </span>
                      <span style={{ fontWeight: 600 }}>{t.leaseEnd}</span>
                    </div>
                    {daysLeft !== null && (
                      <div style={{ padding: '6px 10px', borderRadius: '6px', fontWeight: 700, color: info.color, fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                        {daysLeft > 0 ? `${daysLeft} يوم` : 'منتهي'}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>لم يتم تسجيل تفاصيل العقد</div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>
                    {t.rentAmount} <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>د.ك</span>
                  </span>
                  <button onClick={() => printContract(t)} style={{
                    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px',
                    padding: '5px 10px', cursor: 'pointer', fontSize: '12px', color: 'var(--primary)', fontWeight: 600,
                  }}>طباعة عقد</button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
            لا توجد عقود
          </div>
        )}
      </div>
    </div>
  );
}
