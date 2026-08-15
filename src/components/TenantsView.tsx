'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tenant, Eviction } from '@/lib/types';
import { getTenants, addTenant, updateTenant, deleteTenant, getApartments, addEviction, generateId } from '@/lib/store';
import { printContract, printEvictionNotice } from '@/lib/pdf';
import TenantForm from './TenantForm';

export default function TenantsView() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [evictingTenant, setEvictingTenant] = useState<Tenant | null>(null);

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
    if (confirm('حذف المستأجر؟')) {
      deleteTenant(id);
      reload();
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>المستأجرين</h1>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tenants.length} مستأجر</div>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} style={{
          background: 'var(--primary)', color: '#fff', border: 'none',
          borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
        }}>
          + إضافة
        </button>
      </div>

      <input
        placeholder="بحث بالاسم، الهاتف، الرقم المدني..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: '8px',
          border: '1px solid var(--border)', background: 'var(--bg-card)',
          color: 'var(--text)', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
          marginBottom: '12px',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(t => {
          const apt = apartments.find(a => a.id === t.apartmentId);
          const isExpanded = expanded === t.id;

          return (
            <div key={t.id} style={{
              background: 'var(--bg-card)', borderRadius: '10px',
              border: '1px solid var(--border)', overflow: 'hidden',
            }}>
              <div onClick={() => setExpanded(isExpanded ? null : t.id)} style={{
                padding: '12px 14px', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                    شقة {apt?.number} - {t.floor}
                    {t.phone && <span style={{ marginRight: '8px', direction: 'ltr' as const }}>{t.phone}</span>}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '15px' }}>
                  {t.rentAmount} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>د.ك</span>
                </div>
              </div>

              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border-light)' }}>
                    <InfoCell label="الرقم المدني" value={t.civilId || '-'} />
                    <InfoCell label="الجنسية" value={t.nationality || '-'} />
                    <InfoCell label="المهنة" value={t.profession || '-'} />
                    <InfoCell label="طريقة الدفع" value={t.paymentMethod || '-'} />
                    <InfoCell label="بداية العقد" value={t.leaseStart || '-'} />
                    <InfoCell label="نهاية العقد" value={t.leaseEnd || '-'} />
                  </div>

                  <div style={{ padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    <Btn label="تعديل" onClick={() => { setEditing(t); setShowForm(true); }} />
                    <Btn label="طباعة عقد" onClick={() => printContract(t)} />
                    {t.phone && <Btn label="واتساب" onClick={() => window.open(`https://wa.me/965${t.phone.replace(/\D/g, '')}`, '_blank')} />}
                    <Btn label="إخلاء" onClick={() => setEvictingTenant(t)} color="var(--danger)" />
                    <Btn label="حذف" onClick={() => handleDelete(t.id)} color="var(--danger)" />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
            لا توجد نتائج
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

      {evictingTenant && (
        <EvictionModal
          tenant={evictingTenant}
          onConfirm={(reason, notes) => {
            const apt = apartments.find(a => a.id === evictingTenant.apartmentId);
            const eviction: Eviction = {
              id: generateId(),
              tenantId: evictingTenant.id,
              tenantName: evictingTenant.name,
              apartmentId: evictingTenant.apartmentId,
              apartmentNumber: apt?.number || '',
              floor: evictingTenant.floor,
              reason,
              date: new Date().toISOString().split('T')[0],
              notes,
            };
            addEviction(eviction);
            printEvictionNotice(evictingTenant);
            setEvictingTenant(null);
            reload();
          }}
          onCancel={() => setEvictingTenant(null)}
        />
      )}
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', padding: '8px 14px' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{label}</div>
      <div style={{ fontSize: '13px', marginTop: '1px' }}>{value}</div>
    </div>
  );
}

function Btn({ label, onClick, color }: { label: string; onClick: () => void; color?: string }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} style={{
      padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)',
      background: 'var(--bg)', color: color || 'var(--text)', fontSize: '12px', cursor: 'pointer',
    }}>
      {label}
    </button>
  );
}

function EvictionModal({ tenant, onConfirm, onCancel }: {
  tenant: Tenant;
  onConfirm: (reason: string, notes: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-card)', borderRadius: '16px 16px 0 0', width: '100%',
        maxWidth: '500px', padding: '20px',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px', color: 'var(--danger)' }}>تسجيل إخلاء</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
          إخلاء {tenant.name} — الشقة ستصبح شاغرة. السجلات السابقة لن تُحذف.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input style={inputStyle} value={reason} onChange={e => setReason(e.target.value)} placeholder="سبب الإخلاء *" />
          <textarea style={{ ...inputStyle, minHeight: '50px', resize: 'vertical' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="ملاحظات" />
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button onClick={() => { if (reason.trim()) onConfirm(reason, notes); }} style={{
              flex: 1, padding: '11px', borderRadius: '8px', border: 'none',
              background: 'var(--danger)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              opacity: reason.trim() ? 1 : 0.5,
            }}>تأكيد الإخلاء</button>
            <button onClick={onCancel} style={{
              padding: '11px 20px', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', cursor: 'pointer',
            }}>إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  );
}
