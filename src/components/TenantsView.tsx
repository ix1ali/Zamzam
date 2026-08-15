'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tenant } from '@/lib/types';
import { getTenants, addTenant, updateTenant, deleteTenant, getApartments } from '@/lib/store';
import { printContract, printEvictionNotice } from '@/lib/pdf';
import TenantForm from './TenantForm';

export default function TenantsView() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const reload = useCallback(() => setTenants(getTenants()), []);
  useEffect(() => { reload(); }, [reload]);

  const filtered = tenants.filter(t =>
    t.name.includes(search) || t.phone.includes(search) || t.civilId.includes(search) ||
    t.nationality.includes(search) || t.floor.includes(search)
  );

  const apartments = getApartments();

  const handleSave = (tenant: Tenant) => {
    if (editing) updateTenant(tenant); else addTenant(tenant);
    setShowForm(false);
    setEditing(null);
    reload();
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستأجر؟\nAre you sure you want to delete this tenant?')) {
      deleteTenant(id);
      reload();
    }
  };

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2a5298 100%)',
        padding: '20px', color: '#fff', borderRadius: '0 0 20px 20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>المستأجرين / Tenants</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>{tenants.length} مستأجر</div>
          </div>
          <button onClick={() => { setEditing(null); setShowForm(true); }} style={{
            background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}>
            + إضافة جديد
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <input
            placeholder="بحث... Search by name, phone, ID, nationality"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px 10px 36px', borderRadius: '10px',
              border: 'none', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
            }}
          />
          <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map(t => {
          const apt = apartments.find(a => a.id === t.apartmentId);
          const isExpanded = expanded === t.id;
          const hasLease = !!(t.leaseStart && t.leaseEnd);
          const isExpired = hasLease && new Date(t.leaseEnd) < new Date();

          return (
            <div key={t.id} style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius)', overflow: 'hidden',
              boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
              borderRight: `4px solid ${isExpired ? 'var(--danger)' : hasLease ? 'var(--success)' : 'var(--text-muted)'}`,
            }}>
              <div onClick={() => setExpanded(isExpanded ? null : t.id)} style={{ padding: '14px 16px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{t.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '3px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span>🏠 {apt?.number} - {t.floor}</span>
                      {t.nationality && <span>🌍 {t.nationality}</span>}
                      {t.phone && <span style={{ direction: 'ltr' }}>📱 {t.phone}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'left', minWidth: '70px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '16px' }}>{t.rentAmount}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>د.ك / KWD</div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border-light)', padding: '1px' }}>
                    <InfoCell label="الرقم المدني / Civil ID" value={t.civilId || '-'} />
                    <InfoCell label="الجنسية / Nationality" value={t.nationality || '-'} />
                    <InfoCell label="الهاتف / Phone" value={t.phone || '-'} />
                    <InfoCell label="طريقة الدفع / Payment" value={t.paymentMethod || '-'} />
                    <InfoCell label="بداية العقد / Lease Start" value={t.leaseStart || '-'} />
                    <InfoCell label="نهاية العقد / Lease End" value={t.leaseEnd || '-'} />
                    <InfoCell label="المهنة / Profession" value={t.profession || '-'} span />
                  </div>

                  <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    <ActionBtn label="تعديل / Edit" color="var(--primary)" bg="var(--primary-light)" onClick={() => { setEditing(t); setShowForm(true); }} />
                    <ActionBtn label="حذف / Delete" color="var(--danger)" bg="var(--danger-light)" onClick={() => handleDelete(t.id)} />
                    {t.phone && (
                      <ActionBtn label="واتساب / WhatsApp" color="#25d366" bg="#e6faf0" onClick={() => window.open(`https://wa.me/965${t.phone.replace(/\D/g, '')}`, '_blank')} />
                    )}
                    {t.phone && (
                      <ActionBtn label="اتصال / Call" color="var(--success)" bg="var(--success-light)" onClick={() => window.open(`tel:${t.phone}`, '_self')} />
                    )}
                    <ActionBtn label="طباعة عقد / Print Contract" color="var(--accent)" bg="var(--accent-light)" onClick={() => printContract(t)} />
                    <ActionBtn label="إشعار إخلاء / Eviction" color="var(--danger)" bg="var(--danger-light)" onClick={() => printEvictionNotice(t)} />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔍</div>
            <div style={{ fontSize: '14px' }}>لا توجد نتائج / No results found</div>
          </div>
        )}
      </div>

      {showForm && (
        <TenantForm
          tenant={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function InfoCell({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div style={{ background: 'var(--bg-card)', padding: '10px 14px', ...(span ? { gridColumn: 'span 2' } : {}) }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontWeight: 500, fontSize: '13px' }}>{value}</div>
    </div>
  );
}

function ActionBtn({ label, color, bg, onClick }: { label: string; color: string; bg: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px', borderRadius: '8px', border: `1px solid ${color}30`,
      background: bg, color, fontSize: '11px', fontWeight: 600, cursor: 'pointer',
      textAlign: 'center',
    }}>
      {label}
    </button>
  );
}
