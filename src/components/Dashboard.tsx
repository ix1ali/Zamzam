'use client';

import { useEffect, useState } from 'react';
import { Tenant, Apartment, Payment, TabId } from '@/lib/types';
import { getTenants, getApartments, getPayments } from '@/lib/store';
import { floors } from '@/lib/data';

const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export default function Dashboard({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
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
  const totalRent = tenants.reduce((sum, t) => sum + t.rentAmount, 0);

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

  const expired = tenants.filter(t => {
    if (!t.leaseEnd) return false;
    return new Date(t.leaseEnd) < now;
  });

  const expiringSoon = tenants.filter(t => {
    if (!t.leaseEnd) return false;
    const end = new Date(t.leaseEnd);
    const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 90;
  });

  const floorData = floors.map(f => {
    const floorApts = apartments.filter(a => a.floor === f.key);
    const floorOccupied = floorApts.filter(a => a.status === 'occupied').length;
    return { label: f.label, total: floorApts.length, occupied: floorOccupied };
  }).filter(f => f.total > 0);

  const recentPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(currentYear, currentMonth - (5 - i), 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const monthPayments = payments.filter(p => {
      const pd = new Date(p.date);
      return pd.getMonth() === m && pd.getFullYear() === y;
    });
    return { month: months[m], collected: monthPayments.reduce((s, p) => s + p.amount, 0) };
  });
  const maxCollected = Math.max(...last6Months.map(m => m.collected), 1);

  const occupancyPct = apartments.length > 0 ? Math.round((occupied / apartments.length) * 100) : 0;

  return (
    <div style={{ padding: '16px', paddingBottom: '8px' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>عمارة زمزم</h1>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {now.toLocaleDateString('ar-KW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Top row: Occupancy ring + Collection ring */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <DonutChart pct={occupancyPct} color="var(--success)" size={80} />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>نسبة الإشغال</div>
          <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '2px' }}>{occupied}/{apartments.length} شقة</div>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <DonutChart pct={collectionRate} color="var(--primary)" size={80} />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>التحصيل الشهري</div>
          <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '2px' }}>{collectedThisMonth.toLocaleString()} / {totalRent.toLocaleString()}</div>
        </div>
      </div>

      {/* Stat cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
        <MiniStat label="مشغولة" value={occupied} color="var(--success)" />
        <MiniStat label="شاغرة" value={vacant} color="#8b5cf6" />
        <MiniStat label="معلّمة" value={flagged} color="var(--danger)" />
        <MiniStat label="مستأجرين" value={tenants.length} color="var(--primary)" />
      </div>

      {/* Revenue card */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>الإيرادات الشهرية</span>
          <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--success)' }}>{totalRent.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400 }}>د.ك</span></span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
          <span>دفعوا: {paidTenantIds.size}</span>
          <span>لم يدفعوا: {tenants.length - paidTenantIds.size}</span>
        </div>
        <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '4px', width: `${collectionRate}%`,
            background: collectionRate >= 80 ? 'var(--success)' : collectionRate >= 50 ? 'var(--warning)' : 'var(--danger)',
            transition: 'width 0.5s',
          }} />
        </div>
      </div>

      {/* 6-month collection chart */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)', marginBottom: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>التحصيل - آخر 6 أشهر</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '100px' }}>
          {last6Months.map((m, i) => {
            const h = maxCollected > 0 ? Math.max((m.collected / maxCollected) * 80, 4) : 4;
            const isCurrentMonth = i === 5;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ fontSize: '9px', fontWeight: 600, color: m.collected > 0 ? 'var(--text)' : 'var(--text-muted)' }}>
                  {m.collected > 0 ? m.collected.toLocaleString() : '-'}
                </div>
                <div style={{
                  width: '100%', height: `${h}px`, borderRadius: '4px 4px 0 0',
                  background: isCurrentMonth ? 'var(--primary)' : m.collected > 0 ? 'var(--success)' : 'var(--border)',
                  opacity: isCurrentMonth ? 1 : 0.7,
                }} />
                <div style={{ fontSize: '9px', color: isCurrentMonth ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isCurrentMonth ? 700 : 400 }}>
                  {m.month.slice(0, 5)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floor overview */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)', marginBottom: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>الأدوار</div>
        {[...floorData].reverse().map((f, i) => {
          const pct = f.total > 0 ? (f.occupied / f.total) * 100 : 0;
          const vacantCount = f.total - f.occupied;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, width: '50px', textAlign: 'right' }}>{f.label}</span>
              <div style={{ flex: 1, height: '14px', background: 'var(--bg)', borderRadius: '7px', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  height: '100%', borderRadius: '7px',
                  width: `${pct}%`,
                  background: pct === 100 ? 'var(--success)' : 'var(--warning)',
                  transition: 'width 0.4s',
                }} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 600, width: '36px', textAlign: 'left', color: vacantCount > 0 ? '#8b5cf6' : 'var(--success)' }}>
                {f.occupied}/{f.total}
              </span>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
        <QuickBtn icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" label="مستأجر جديد" onClick={() => onNavigate('tenants')} />
        <QuickBtn icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" label="وصل إيجار" onClick={() => onNavigate('payments')} />
        <QuickBtn icon="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" label="الكشف المالي" onClick={() => onNavigate('financial')} />
      </div>

      {/* Alerts */}
      {expired.length > 0 && (
        <div style={{ background: 'var(--danger-light)', borderRadius: '12px', padding: '12px 14px', marginBottom: '10px', borderRight: '3px solid var(--danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--danger)' }}>
              عقود منتهية ({expired.length})
            </span>
            <button onClick={() => onNavigate('contracts')} style={{ fontSize: '11px', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>عرض الكل</button>
          </div>
          {expired.slice(0, 4).map(t => (
            <div key={t.id} style={{ fontSize: '12px', padding: '2px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span>{t.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>شقة {apartments.find(a => a.id === t.apartmentId)?.number}</span>
            </div>
          ))}
        </div>
      )}

      {expiringSoon.length > 0 && (
        <div style={{ background: 'var(--warning-light)', borderRadius: '12px', padding: '12px 14px', marginBottom: '10px', borderRight: '3px solid var(--warning)' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--warning)', marginBottom: '6px' }}>
            تنتهي قريبا ({expiringSoon.length})
          </div>
          {expiringSoon.slice(0, 3).map(t => {
            const days = Math.ceil((new Date(t.leaseEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return (
              <div key={t.id} style={{ fontSize: '12px', padding: '2px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>{t.name}</span>
                <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{days} يوم</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Payments */}
      {recentPayments.length > 0 && (
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '12px' }}>
          <div style={{ padding: '10px 14px', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>آخر الدفعات</span>
            <button onClick={() => onNavigate('payments')} style={{ fontSize: '11px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>عرض الكل</button>
          </div>
          {recentPayments.map(p => {
            const tenant = tenants.find(t => t.id === p.tenantId);
            return (
              <div key={p.id} style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '12px' }}>{tenant?.name || '-'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{p.date}</div>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '13px' }}>{p.amount} د.ك</span>
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
