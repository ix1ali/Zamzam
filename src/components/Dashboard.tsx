'use client';

import { useEffect, useState } from 'react';
import { Tenant, Apartment, Payment, TabId } from '@/lib/types';
import { getTenants, getApartments, getPayments } from '@/lib/store';
import { getLang, t, getMonths, monthsAr } from '@/lib/i18n';

export default function Dashboard({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const lang = getLang();
  const months = getMonths(lang);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    setTenants(getTenants());
    setApartments(getApartments());
    setPayments(getPayments());
  }, []);

  const occupied = apartments.filter(a => a.status === 'occupied').length;
  const vacant = apartments.filter(a => a.status === 'vacant').length;
  const flagged = apartments.filter(a => a.flagged).length;
  const totalRent = tenants.reduce((sum, tt) => sum + tt.rentAmount, 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentMonthPayments = payments.filter(p => {
    const d = new Date(p.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const collectedThisMonth = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  const collectionRate = totalRent > 0 ? Math.round((collectedThisMonth / totalRent) * 100) : 0;
  const paidTenantIds = new Set(currentMonthPayments.map(p => p.tenantId));

  const expired = tenants.filter(tt => tt.leaseEnd && new Date(tt.leaseEnd) < now);
  const expiringSoon = tenants.filter(tt => {
    if (!tt.leaseEnd) return false;
    const diff = (new Date(tt.leaseEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 90;
  });

  const recentPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(currentYear, currentMonth - (5 - i), 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const mp = payments.filter(p => {
      const pd = new Date(p.date);
      return pd.getMonth() === m && pd.getFullYear() === y;
    });
    return { month: months[m], collected: mp.reduce((s, p) => s + p.amount, 0) };
  });
  const maxCollected = Math.max(...last6Months.map(m => m.collected), 1);
  const occupancyPct = apartments.length > 0 ? Math.round((occupied / apartments.length) * 100) : 0;

  const card: React.CSSProperties = {
    background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
  };

  return (
    <div style={{ padding: '16px', paddingBottom: '8px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--gradient-primary)', borderRadius: '20px', padding: '20px',
        marginBottom: '16px', position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(30,58,95,0.25)',
        animation: 'fadeInUp 0.4s ease-out',
      }}>
        <div style={{
          position: 'absolute', top: '-30px', left: '-30px',
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'rgba(201,162,39,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20px', right: '-20px',
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-0.3px' }}>
                {t('companyName', lang)}
              </h1>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '4px' }}>
                {now.toLocaleDateString('ar-KW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <div style={{
              background: 'rgba(201,162,39,0.15)', borderRadius: '12px', padding: '8px',
              border: '1px solid rgba(201,162,39,0.25)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
              </svg>
            </div>
          </div>
          <div style={{
            display: 'flex', gap: '16px', marginTop: '16px',
          }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>{totalRent.toLocaleString()}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{t('kwd', lang)} / {t('monthlyRevenue', lang)}</div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.12)' }} />
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#c9a227' }}>{collectionRate}%</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{t('monthlyCollection', lang)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px', animation: 'fadeInUp 0.4s ease-out 0.1s both' }}>
        {[
          { label: t('occupied', lang), value: occupied, color: 'var(--success)', bg: 'var(--success-light)' },
          { label: t('vacant', lang), value: vacant, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
          { label: t('flagged', lang), value: flagged, color: 'var(--danger)', bg: 'var(--danger-light)' },
          { label: t('tenants', lang), value: tenants.length, color: 'var(--primary)', bg: 'var(--primary-light)' },
        ].map((s, i) => (
          <div key={i} onClick={() => onNavigate('apartments')} style={{
            ...card, padding: '12px 6px', textAlign: 'center', cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseDown={e => { (e.currentTarget).style.transform = 'scale(0.96)'; }}
          onMouseUp={e => { (e.currentTarget).style.transform = 'scale(1)'; }}
          onMouseLeave={e => { (e.currentTarget).style.transform = 'scale(1)'; }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px', margin: '0 auto 6px',
              background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: s.color }}>{s.value}</span>
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Donut charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px', animation: 'fadeInUp 0.4s ease-out 0.15s both' }}>
        <div onClick={() => onNavigate('apartments')} style={{ ...card, padding: '16px', textAlign: 'center', cursor: 'pointer' }}>
          <DonutChart pct={occupancyPct} color="var(--success)" trackColor="var(--success-light)" size={90} />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 500 }}>{t('occupancyRate', lang)}</div>
          <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '2px' }}>{occupied}/{apartments.length} {t('apt', lang)}</div>
        </div>
        <div onClick={() => onNavigate('financial')} style={{ ...card, padding: '16px', textAlign: 'center', cursor: 'pointer' }}>
          <DonutChart pct={collectionRate} color="var(--primary)" trackColor="var(--primary-light)" size={90} />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 500 }}>{t('monthlyCollection', lang)}</div>
          <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '2px' }}>{collectedThisMonth.toLocaleString()} / {totalRent.toLocaleString()}</div>
        </div>
      </div>

      {/* Revenue card */}
      <div style={{ ...card, padding: '16px', marginBottom: '14px', animation: 'fadeInUp 0.4s ease-out 0.2s both' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700 }}>{t('monthlyRevenue', lang)}</span>
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--success)' }}>{totalRent.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400 }}>{t('kwd', lang)}</span></span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          <span>{t('paid', lang)}: {paidTenantIds.size}</span>
          <span>{t('unpaid', lang)}: {tenants.length - paidTenantIds.size}</span>
        </div>
        <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '8px', width: `${collectionRate}%`,
            background: collectionRate >= 80 ? 'var(--gradient-success)' : collectionRate >= 50 ? 'var(--warning)' : 'var(--danger)',
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>

      {/* 6-month chart */}
      <div style={{ ...card, padding: '16px', marginBottom: '14px', animation: 'fadeInUp 0.4s ease-out 0.25s both' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '14px' }}>{t('collectionLast6', lang)}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '110px' }}>
          {last6Months.map((m, i) => {
            const h = maxCollected > 0 ? Math.max((m.collected / maxCollected) * 85, 4) : 4;
            const isCurrent = i === 5;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ fontSize: '8px', fontWeight: 700, color: m.collected > 0 ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                  {m.collected > 0 ? m.collected.toLocaleString() : '-'}
                </div>
                <div style={{
                  width: '100%', height: `${h}px`,
                  borderRadius: '6px 6px 2px 2px',
                  background: isCurrent ? 'var(--gradient-primary)' : m.collected > 0 ? 'var(--success)' : 'var(--border)',
                  opacity: isCurrent ? 1 : 0.6,
                  boxShadow: isCurrent ? '0 4px 12px rgba(30,58,95,0.2)' : 'none',
                  transition: 'height 0.4s ease',
                }} />
                <div style={{
                  fontSize: '9px', fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                }}>
                  {m.month.slice(0, 5)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px', animation: 'fadeInUp 0.4s ease-out 0.3s both' }}>
        {[
          { icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', label: t('newTenant', lang), tab: 'apartments' as TabId, color: 'var(--primary)', bg: 'var(--primary-light)' },
          { icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', label: t('rentReceipt', lang), tab: 'financial' as TabId, color: 'var(--success)', bg: 'var(--success-light)' },
          { icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', label: t('financialStatement', lang), tab: 'financial' as TabId, color: 'var(--accent)', bg: 'var(--accent-light)' },
        ].map((btn, i) => (
          <button key={i} onClick={() => onNavigate(btn.tab)} style={{
            ...card, padding: '14px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
            color: btn.color, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseDown={e => { (e.currentTarget).style.transform = 'scale(0.96)'; }}
          onMouseUp={e => { (e.currentTarget).style.transform = 'scale(1)'; }}
          onMouseLeave={e => { (e.currentTarget).style.transform = 'scale(1)'; }}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '12px', background: btn.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={btn.icon} /></svg>
            </div>
            {btn.label}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {expired.length > 0 && (
        <div style={{
          ...card, padding: '14px', marginBottom: '10px',
          borderInlineStart: '4px solid var(--danger)',
          background: 'var(--danger-light)',
          animation: 'fadeInUp 0.4s ease-out 0.35s both',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--danger)' }}>
                {t('expiredContracts', lang)} ({expired.length})
              </span>
            </div>
            <button onClick={() => onNavigate('financial')} style={{ fontSize: '11px', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>{t('viewAll', lang)}</button>
          </div>
          {expired.slice(0, 4).map(tt => (
            <div key={tt.id} style={{ fontSize: '12px', padding: '3px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 500 }}>{tt.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>{t('apt', lang)} {apartments.find(a => a.id === tt.apartmentId)?.number}</span>
            </div>
          ))}
        </div>
      )}

      {expiringSoon.length > 0 && (
        <div style={{
          ...card, padding: '14px', marginBottom: '10px',
          borderInlineStart: '4px solid var(--warning)',
          background: 'var(--warning-light)',
          animation: 'fadeInUp 0.4s ease-out 0.4s both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--warning)' }}>
              {t('expiringSoon', lang)} ({expiringSoon.length})
            </span>
          </div>
          {expiringSoon.slice(0, 3).map(tt => {
            const days = Math.ceil((new Date(tt.leaseEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return (
              <div key={tt.id} style={{ fontSize: '12px', padding: '3px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500 }}>{tt.name}</span>
                <span style={{ color: 'var(--warning)', fontWeight: 700 }}>{days} {t('days', lang)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Payments */}
      {recentPayments.length > 0 && (
        <div style={{ ...card, overflow: 'hidden', marginBottom: '14px', animation: 'fadeInUp 0.4s ease-out 0.45s both' }}>
          <div style={{ padding: '12px 16px', fontWeight: 700, fontSize: '13px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '7px',
                background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="12" height="12" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <span>{t('recentPayments', lang)}</span>
            </div>
            <button onClick={() => onNavigate('financial')} style={{ fontSize: '11px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>{t('viewAll', lang)}</button>
          </div>
          {recentPayments.map(p => {
            const tenant = tenants.find(tt => tt.id === p.tenantId);
            return (
              <div key={p.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{tenant?.name || '-'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px' }}>{p.date}</div>
                </div>
                <span style={{ fontWeight: 800, color: 'var(--success)', fontSize: '14px' }}>{p.amount} <span style={{ fontSize: '10px', fontWeight: 400 }}>{t('kwd', lang)}</span></span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DonutChart({ pct, color, trackColor, size }: { pct: number; color: string; trackColor: string; size: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth="10" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x={size / 2} y={size / 2 - 2} textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: '18px', fontWeight: 800, fill: 'var(--text)' }}>
        {pct}%
      </text>
    </svg>
  );
}
