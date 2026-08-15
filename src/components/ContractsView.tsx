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

  const filters: { id: FilterType; label: string; labelEn: string; color: string; icon: string }[] = [
    { id: 'all', label: 'الكل', labelEn: 'All', color: 'var(--primary)', icon: '📋' },
    { id: 'active', label: 'سارية', labelEn: 'Active', color: 'var(--success)', icon: '✅' },
    { id: 'expiring', label: 'تنتهي', labelEn: 'Expiring', color: 'var(--warning)', icon: '⚠️' },
    { id: 'expired', label: 'منتهية', labelEn: 'Expired', color: 'var(--danger)', icon: '❌' },
    { id: 'no-contract', label: 'بدون', labelEn: 'None', color: 'var(--text-muted)', icon: '📝' },
  ];

  const statusInfo = (cat: string) => {
    switch (cat) {
      case 'active': return { bg: 'var(--success-light)', color: 'var(--success)', label: 'ساري / Active', border: 'var(--success)' };
      case 'expiring': return { bg: 'var(--warning-light)', color: 'var(--warning)', label: 'ينتهي قريبا / Expiring', border: 'var(--warning)' };
      case 'expired': return { bg: 'var(--danger-light)', color: 'var(--danger)', label: 'منتهي / Expired', border: 'var(--danger)' };
      default: return { bg: 'var(--bg)', color: 'var(--text-muted)', label: 'بدون عقد / No Contract', border: 'var(--text-muted)' };
    }
  };

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2a5298 100%)',
        padding: '20px 20px 24px', color: '#fff', borderRadius: '0 0 20px 20px',
      }}>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '14px' }}>العقود / Contracts</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{counts.active}</div>
            <div style={{ fontSize: '9px', opacity: 0.8 }}>سارية / Active</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{counts.expiring}</div>
            <div style={{ fontSize: '9px', opacity: 0.8 }}>تنتهي / Expiring</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{counts.expired}</div>
            <div style={{ fontSize: '9px', opacity: 0.8 }}>منتهية / Expired</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{counts['no-contract']}</div>
            <div style={{ fontSize: '9px', opacity: 0.8 }}>بدون / None</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
              whiteSpace: 'nowrap', border: '1.5px solid',
              background: filter === f.id ? f.color : 'var(--bg-card)',
              color: filter === f.id ? '#fff' : f.color,
              borderColor: filter === f.id ? f.color : 'var(--border)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {f.icon} {f.label} ({counts[f.id]})
            </button>
          ))}
        </div>

        {/* Contract Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(t => {
            const cat = categorize(t);
            const style = statusInfo(cat);
            const apt = apartments.find(a => a.id === t.apartmentId);
            const daysLeft = t.leaseEnd ? Math.ceil((new Date(t.leaseEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

            return (
              <div key={t.id} style={{
                background: 'var(--bg-card)', borderRadius: 'var(--radius)', overflow: 'hidden',
                boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
                borderRight: `4px solid ${style.border}`,
              }}>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '15px' }}>{t.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                        🏠 شقة {apt?.number} - الدور {t.floor}
                      </div>
                    </div>
                    <span style={{
                      background: style.bg, color: style.color,
                      padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
                    }}>{style.label}</span>
                  </div>

                  {t.leaseStart && t.leaseEnd ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px', marginBottom: '10px' }}>
                      <div style={{ background: 'var(--bg)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>من / From</div>
                        <div style={{ fontWeight: 600, marginTop: '2px', direction: 'ltr' }}>{t.leaseStart}</div>
                      </div>
                      <div style={{ background: 'var(--bg)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>إلى / To</div>
                        <div style={{ fontWeight: 600, marginTop: '2px', direction: 'ltr' }}>{t.leaseEnd}</div>
                      </div>
                      <div style={{ background: style.bg, padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>المتبقي / Left</div>
                        <div style={{ fontWeight: 700, color: style.color, marginTop: '2px' }}>
                          {daysLeft !== null ? (daysLeft > 0 ? `${daysLeft} يوم` : 'منتهي') : '-'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '10px', background: 'var(--bg)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                      📝 لم يتم تسجيل تفاصيل العقد / No contract details recorded
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>الإيجار / Rent</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '16px' }}>{t.rentAmount} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>د.ك</span></span>
                      <button onClick={() => printContract(t)} style={{
                        background: 'var(--primary-light)', border: 'none', borderRadius: '6px',
                        padding: '5px 10px', cursor: 'pointer', fontSize: '11px', color: 'var(--primary)', fontWeight: 600,
                      }}>🖨️ طباعة</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>📋</div>
              <div style={{ fontSize: '14px' }}>لا توجد عقود / No contracts found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
