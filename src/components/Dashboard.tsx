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

  const expired = tenants.filter(tt => {
    if (!tt.leaseEnd) return false;
    return new Date(tt.leaseEnd) < now;
  });

  const expiringSoon = tenants.filter(tt => {
    if (!tt.leaseEnd) return false;
    const end = new Date(tt.leaseEnd);
    const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
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

  const dateLocale = lang === 'ar' ? 'ar-KW' : 'en-US';

  return (
    <div style={{ padding: '16px', paddingBottom: '8px' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>{t('companyName', lang)}</h1>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {now.toLocaleDateString(dateLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Top row: Occupancy + Collection donuts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <DonutChart pct={occupancyPct} color="var(--success)" size={80} />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{t('occupancyRate', lang)}</div>
          <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '2px' }}>{occupied}/{apartments.length} {t('apt', lang)}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <DonutChart pct={collectionRate} color="var(--primary)" size={80} />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{t('monthlyCollection', lang)}</div>
          <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '2px' }}>{collectedThisMonth.toLocaleString()} / {totalRent.toLocaleString()}</div>
        </div>
      </div>

      {/* Mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
        <MiniStat label={t('occupied', lang)} value={occupied} color="var(--success)" />
        <MiniStat label={t('vacant', lang)} value={vacant} color="#8b5cf6" />
        <MiniStat label={t('flagged', lang)} value={flagged} color="var(--danger)" />
        <MiniStat label={t('tenants', lang)} value={tenants.length} color="var(--primary)" />
      </div>

      {/* Revenue */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{t('monthlyRevenue', lang)}</span>
          <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--success)' }}>{totalRent.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400 }}>{t('kwd', lang)}</span></span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
          <span>{t('paid', lang)}: {paidTenantIds.size}</span>
          <span>{t('unpaid', lang)}: {tenants.length - paidTenantIds.size}</span>
        </div>
        <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '4px', width: `${collectionRate}%`,
            background: collectionRate >= 80 ? 'var(--success)' : collectionRate >= 50 ? 'var(--warning)' : 'var(--danger)',
            transition: 'width 0.5s',
          }} />
        </div>
      </div>

      {/* 6-month chart */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)', marginBottom: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>{t('collectionLast6', lang)}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '100px' }}>
          {last6Months.map((m, i) => {
            const h = maxCollected > 0 ? Math.max((m.collected / maxCollected) * 80, 4) : 4;
            const isCurrent = i === 5;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ fontSize: '9px', fontWeight: 600, color: m.collected > 0 ? 'var(--text)' : 'var(--text-muted)' }}>
                  {m.collected > 0 ? m.collected.toLocaleString() : '-'}
                </div>
                <div style={{
                  width: '100%', height: `${h}px`, borderRadius: '4px 4px 0 0',
                  background: isCurrent ? 'var(--primary)' : m.collected > 0 ? 'var(--success)' : 'var(--border)',
                  opacity: isCurrent ? 1 : 0.7,
                }} />
                <div style={{ fontSize: '9px', color: isCurrent ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isCurrent ? 700 : 400 }}>
                  {m.month.slice(0, 5)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
        <QuickBtn icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" label={t('newTenant', lang)} onClick={() => onNavigate('apartments')} />
        <QuickBtn icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" label={t('rentReceipt', lang)} onClick={() => onNavigate('financial')} />
        <QuickBtn icon="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" label={t('financialStatement', lang)} onClick={() => onNavigate('financial')} />
      </div>

      {/* Expired Contracts Alert */}
      {expired.length > 0 && (
        <div style={{ background: 'var(--danger-light)', borderRadius: '12px', padding: '12px 14px', marginBottom: '10px', borderInlineStart: '3px solid var(--danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--danger)' }}>
              {t('expiredContracts', lang)} ({expired.length})
            </span>
            <button onClick={() => onNavigate('financial')} style={{ fontSize: '11px', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>{t('viewAll', lang)}</button>
          </div>
          {expired.slice(0, 4).map(tt => (
            <div key={tt.id} style={{ fontSize: '12px', padding: '2px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span>{tt.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>{t('apt', lang)} {apartments.find(a => a.id === tt.apartmentId)?.number}</span>
            </div>
          ))}
        </div>
      )}

      {/* Expiring Soon Alert */}
      {expiringSoon.length > 0 && (
        <div style={{ background: 'var(--warning-light)', borderRadius: '12px', padding: '12px 14px', marginBottom: '10px', borderInlineStart: '3px solid var(--warning)' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--warning)', marginBottom: '6px' }}>
            {t('expiringSoon', lang)} ({expiringSoon.length})
          </div>
          {expiringSoon.slice(0, 3).map(tt => {
            const days = Math.ceil((new Date(tt.leaseEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return (
              <div key={tt.id} style={{ fontSize: '12px', padding: '2px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>{tt.name}</span>
                <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{days} {t('days', lang)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Payments */}
      {recentPayments.length > 0 && (
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '12px' }}>
          <div style={{ padding: '10px 14px', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('recentPayments', lang)}</span>
            <button onClick={() => onNavigate('financial')} style={{ fontSize: '11px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>{t('viewAll', lang)}</button>
          </div>
          {recentPayments.map(p => {
            const tenant = tenants.find(tt => tt.id === p.tenantId);
            return (
              <div key={p.id} style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '12px' }}>{tenant?.name || '-'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{p.date}</div>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '13px' }}>{p.amount} {t('kwd', lang)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DonutChart({ pct, color, size }: { pct: number; color: string; size: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s' }}
      />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: '16px', fontWeight: 700, fill: 'var(--text)' }}>
        {pct}%
      </text>
    </svg>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '10px 6px', textAlign: 'center', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '20px', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

function QuickBtn({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
      padding: '14px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
      color: 'var(--primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
    }}>
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d={icon} />
      </svg>
      {label}
    </button>
  );
}
