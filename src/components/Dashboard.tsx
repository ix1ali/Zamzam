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
  const occupancyRate = apartments.length > 0 ? Math.round((occupied / apartments.length) * 100) : 0;

  const now = new Date();
  const expiringSoon = tenants.filter(t => {
    if (!t.leaseEnd) return false;
    const end = new Date(t.leaseEnd);
    const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 90;
  });

  const expired = tenants.filter(t => {
    if (!t.leaseEnd) return false;
    return new Date(t.leaseEnd) < now;
  });

  const currentMonthPayments = payments.filter(p => {
    const d = new Date(p.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const collectedThisMonth = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  const collectionRate = totalRent > 0 ? Math.round((collectedThisMonth / totalRent) * 100) : 0;

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2a5298 100%)',
        padding: '24px 20px 28px', color: '#fff',
        borderRadius: '0 0 24px 24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>🏢 عمارة زمزم</div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>Zamzam Building Management</div>
          </div>
          <div style={{ textAlign: 'left', fontSize: '11px', opacity: 0.7 }}>
            {now.toLocaleDateString('ar-KW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Quick Stats in header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '20px' }}>
          <QuickStat value={apartments.length.toString()} label="شقة" labelEn="Units" />
          <QuickStat value={occupied.toString()} label="مشغولة" labelEn="Occupied" />
          <QuickStat value={vacant.toString()} label="شاغرة" labelEn="Vacant" />
          <QuickStat value={`${occupancyRate}%`} label="إشغال" labelEn="Rate" />
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {/* Revenue Card */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: '18px',
          boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
          marginTop: '-16px', marginBottom: '14px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>الإيرادات الشهرية / Monthly Revenue</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--primary)' }}>{totalRent.toLocaleString()} <span style={{ fontSize: '14px' }}>د.ك</span></div>
            </div>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: `conic-gradient(var(--success) ${collectionRate * 3.6}deg, var(--border-light) 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, color: 'var(--success)',
              }}>{collectionRate}%</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <MiniStat label="محصّل / Collected" value={`${collectedThisMonth.toLocaleString()} د.ك`} color="var(--success)" />
            <MiniStat label="متبقي / Remaining" value={`${(totalRent - collectedThisMonth).toLocaleString()} د.ك`} color="var(--danger)" />
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
          <ActionBtn label="مستأجر جديد" labelEn="New Tenant" icon="+" color="var(--primary)" onClick={() => onNavigate('tenants')} />
          <ActionBtn label="تسجيل دفعة" labelEn="Add Payment" icon="💰" color="var(--success)" onClick={() => onNavigate('payments')} />
          <ActionBtn label="عرض العقود" labelEn="Contracts" icon="📄" color="var(--accent)" onClick={() => onNavigate('contracts')} />
        </div>

        {/* Alerts */}
        {expired.length > 0 && (
          <AlertCard
            title={`عقود منتهية / Expired (${expired.length})`}
            color="var(--danger)"
            bg="var(--danger-light)"
            items={expired.slice(0, 4).map(t => ({
              name: t.name,
              detail: `شقة ${apartments.find(a => a.id === t.apartmentId)?.number}`,
            }))}
            onViewAll={() => onNavigate('contracts')}
          />
        )}

        {expiringSoon.length > 0 && (
          <AlertCard
            title={`تنتهي قريبا / Expiring Soon (${expiringSoon.length})`}
            color="var(--warning)"
            bg="var(--warning-light)"
            items={expiringSoon.slice(0, 4).map(t => {
              const days = Math.ceil((new Date(t.leaseEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              return { name: t.name, detail: `${days} يوم` };
            })}
            onViewAll={() => onNavigate('contracts')}
          />
        )}

        {/* Recent Tenants */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius)', overflow: 'hidden',
          boxShadow: 'var(--shadow)', border: '1px solid var(--border)', marginBottom: '14px',
        }}>
          <div style={{ padding: '14px 16px', fontWeight: 600, fontSize: '14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>آخر المستأجرين / Recent Tenants</span>
            <button onClick={() => onNavigate('tenants')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>عرض الكل</button>
          </div>
          {tenants.slice(-5).reverse().map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '14px' }}>{t.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px' }}>
                  شقة {apartments.find(a => a.id === t.apartmentId)?.number} - {t.floor}
                </div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>{t.rentAmount} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>د.ك</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickStat({ value, label, labelEn }: { value: string; label: string; labelEn: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 6px', textAlign: 'center' }}>
      <div style={{ fontSize: '20px', fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: '10px', opacity: 0.9, marginTop: '2px' }}>{label}</div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ flex: 1, background: 'var(--bg)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
      <div style={{ fontSize: '15px', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

function ActionBtn({ label, labelEn, icon, color, onClick }: { label: string; labelEn: string; icon: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
      padding: '14px 8px', textAlign: 'center', cursor: 'pointer',
      boxShadow: 'var(--shadow-sm)', transition: 'transform 0.15s',
    }}>
      <div style={{ fontSize: '22px', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontSize: '12px', fontWeight: 600, color }}>{label}</div>
      <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{labelEn}</div>
    </button>
  );
}

function AlertCard({ title, color, bg, items, onViewAll }: {
  title: string; color: string; bg: string;
  items: { name: string; detail: string }[];
  onViewAll: () => void;
}) {
  return (
    <div style={{
      background: bg, borderRadius: 'var(--radius)', padding: '14px 16px',
      marginBottom: '14px', borderRight: `4px solid ${color}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color }}>{title}</span>
        <button onClick={onViewAll} style={{ background: 'none', border: 'none', color, fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>عرض الكل</button>
      </div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '5px 0', borderBottom: i < items.length - 1 ? `1px solid ${color}22` : 'none' }}>
          <span>{item.name}</span>
          <span style={{ color, fontWeight: 600 }}>{item.detail}</span>
        </div>
      ))}
    </div>
  );
}
