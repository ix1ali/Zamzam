'use client';

import { useEffect, useState } from 'react';
import { Tenant, Apartment, Payment, TabId } from '@/lib/types';
import { getTenants, getApartments, getPayments } from '@/lib/store';

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
  const totalRent = tenants.reduce((sum, t) => sum + t.rentAmount, 0);

  const now = new Date();
  const currentMonthPayments = payments.filter(p => {
    const d = new Date(p.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const collectedThisMonth = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);

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

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>عمارة زمزم</h1>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {now.toLocaleDateString('ar-KW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
        <StatCard label="الشقق" value={`${occupied}/${apartments.length}`} sub="مشغولة" />
        <StatCard label="شاغرة" value={vacant.toString()} sub="متاحة" color={vacant > 0 ? 'var(--danger)' : 'var(--success)'} />
        <StatCard label="الإيجارات" value={`${totalRent.toLocaleString()}`} sub="د.ك / شهري" />
        <StatCard label="محصّل" value={`${collectedThisMonth.toLocaleString()}`} sub={`من ${totalRent.toLocaleString()}`} color="var(--success)" />
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
        <QuickBtn label="مستأجر جديد" onClick={() => onNavigate('tenants')} />
        <QuickBtn label="وصل إيجار" onClick={() => onNavigate('payments')} />
        <QuickBtn label="الكشف المالي" onClick={() => onNavigate('financial')} />
      </div>

      {/* Alerts */}
      {expired.length > 0 && (
        <div style={{ background: 'var(--danger-light)', borderRadius: '10px', padding: '12px 14px', marginBottom: '10px', borderRight: '3px solid var(--danger)' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--danger)', marginBottom: '6px' }}>
            عقود منتهية ({expired.length})
          </div>
          {expired.slice(0, 3).map(t => (
            <div key={t.id} style={{ fontSize: '12px', padding: '2px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span>{t.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>شقة {apartments.find(a => a.id === t.apartmentId)?.number}</span>
            </div>
          ))}
          {expired.length > 3 && <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px', cursor: 'pointer' }} onClick={() => onNavigate('contracts')}>عرض الكل...</div>}
        </div>
      )}

      {expiringSoon.length > 0 && (
        <div style={{ background: 'var(--warning-light)', borderRadius: '10px', padding: '12px 14px', marginBottom: '10px', borderRight: '3px solid var(--warning)' }}>
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
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color?: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '14px', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 700, color: color || 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  );
}

function QuickBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px',
      padding: '12px 8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
      color: 'var(--primary)',
    }}>
      {label}
    </button>
  );
}
