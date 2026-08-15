'use client';

import { useState, useEffect, useCallback } from 'react';
import { Payment, Tenant } from '@/lib/types';
import { getPayments, addPayment, deletePayment, getTenants, generateId, getApartments } from '@/lib/store';
import { printReceipt, printMonthlyStatement } from '@/lib/pdf';

const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export default function PaymentsView() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const reload = useCallback(() => {
    setPayments(getPayments());
    setTenants(getTenants());
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const monthPayments = payments.filter(p => {
    const d = new Date(p.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const totalExpected = tenants.reduce((s, t) => s + t.rentAmount, 0);
  const totalCollected = monthPayments.reduce((s, p) => s + p.amount, 0);
  const remaining = totalExpected - totalCollected;
  const rate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const paidTenantIds = new Set(monthPayments.map(p => p.tenantId));
  const unpaidTenants = tenants.filter(t => !paidTenantIds.has(t.id));
  const apartments = getApartments();

  const selectStyle: React.CSSProperties = {
    padding: '8px 10px', borderRadius: '8px',
    border: '1px solid var(--border)', background: 'var(--bg-card)',
    color: 'var(--text)', fontSize: '13px', outline: 'none',
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>وصولات الإيجار</h1>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{months[selectedMonth]} {selectedYear}</div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => printMonthlyStatement(tenants, monthPayments, months[selectedMonth], selectedYear)} style={{
            background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '7px 10px', fontSize: '12px', cursor: 'pointer',
          }}>كشف</button>
          <button onClick={() => setShowForm(true)} style={{
            background: 'var(--primary)', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          }}>+ وصل</button>
        </div>
      </div>

      {/* Month/Year selectors */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} style={{ ...selectStyle, flex: 1 }}>
          {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{ ...selectStyle, width: '80px' }}>
          {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
        <StatBox label="محصّل" value={totalCollected} color="var(--success)" />
        <StatBox label="متبقي" value={remaining} color="var(--danger)" />
        <StatBox label="النسبة" value={`${rate}%`} color={rate >= 80 ? 'var(--success)' : rate >= 50 ? 'var(--warning)' : 'var(--danger)'} />
      </div>

      {/* Progress */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '10px 14px', border: '1px solid var(--border)', marginBottom: '12px' }}>
        <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '3px', width: `${rate}%`,
            background: rate >= 80 ? 'var(--success)' : rate >= 50 ? 'var(--warning)' : 'var(--danger)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '4px', color: 'var(--text-muted)' }}>
          <span>{paidTenantIds.size} دفعوا</span>
          <span>{unpaidTenants.length} لم يدفعوا</span>
        </div>
      </div>

      {/* Recorded Payments */}
      {monthPayments.length > 0 && (
        <div style={{ background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '12px' }}>
          <div style={{ padding: '10px 14px', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <span>الدفعات المسجلة ({monthPayments.length})</span>
            <span style={{ color: 'var(--success)' }}>{totalCollected} د.ك</span>
          </div>
          {monthPayments.map(p => {
            const tenant = tenants.find(t => t.id === p.tenantId);
            const apt = tenant ? apartments.find(a => a.id === tenant.apartmentId) : null;
            return (
              <div key={p.id} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '13px' }}>{tenant?.name || 'غير معروف'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>شقة {apt?.number} — {p.method} — {p.date}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '13px' }}>{p.amount} د.ك</span>
                  {tenant && (
                    <button onClick={() => printReceipt(tenant, p)} style={{
                      background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px',
                      padding: '3px 6px', cursor: 'pointer', fontSize: '11px', color: 'var(--text-muted)',
                    }}>طباعة</button>
                  )}
                  <button onClick={() => { if (confirm('حذف هذا الوصل؟')) { deletePayment(p.id); reload(); } }} style={{
                    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px',
                    padding: '3px 6px', cursor: 'pointer', fontSize: '11px', color: 'var(--danger)',
                  }}>حذف</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Unpaid */}
      {unpaidTenants.length > 0 && (
        <div style={{ background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden', borderRight: '3px solid var(--danger)' }}>
          <div style={{ padding: '10px 14px', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid var(--border)', color: 'var(--danger)', display: 'flex', justifyContent: 'space-between' }}>
            <span>لم يدفعوا ({unpaidTenants.length})</span>
            <span>{remaining.toLocaleString()} د.ك</span>
          </div>
          {unpaidTenants.map(t => {
            const apt = apartments.find(a => a.id === t.apartmentId);
            return (
              <div key={t.id} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '13px' }}>{t.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>شقة {apt?.number} — {t.floor}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '13px' }}>{t.rentAmount} د.ك</span>
                  {t.phone && (
                    <a href={`https://wa.me/965${t.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{
                      background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px',
                      padding: '3px 6px', fontSize: '11px', color: 'var(--success)', textDecoration: 'none',
                    }}>واتساب</a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <PaymentForm
          tenants={tenants}
          onSave={(p) => { addPayment(p); setShowForm(false); reload(); }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '10px', textAlign: 'center', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '18px', fontWeight: 700, color }}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

function PaymentForm({ tenants, onSave, onCancel }: { tenants: Tenant[]; onSave: (p: Payment) => void; onCancel: () => void }) {
  const [tenantId, setTenantId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('نقدا');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const selectedTenant = tenants.find(t => t.id === tenantId);
  const apartments = getApartments();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = new Date(date);
    onSave({
      id: generateId(), tenantId, amount: Number(amount),
      month: d.toLocaleDateString('ar', { month: 'long' }),
      year: d.getFullYear(), date, method, notes,
    });
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>وصل إيجار جديد</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <select style={inputStyle} value={tenantId} onChange={e => {
            setTenantId(e.target.value);
            const t = tenants.find(t => t.id === e.target.value);
            if (t) setAmount(t.rentAmount.toString());
          }} required>
            <option value="">اختر المستأجر</option>
            {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          {selectedTenant && (
            <div style={{ background: 'var(--bg)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>شقة {apartments.find(a => a.id === selectedTenant.apartmentId)?.number} — {selectedTenant.floor}</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{selectedTenant.rentAmount} د.ك</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input style={inputStyle} type="number" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="المبلغ" />
            <input style={{ ...inputStyle, direction: 'ltr' }} type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>

          <select style={inputStyle} value={method} onChange={e => setMethod(e.target.value)}>
            <option value="نقدا">نقدا</option>
            <option value="شيك">شيك</option>
            <option value="تحويل">تحويل بنكي</option>
          </select>

          <textarea style={{ ...inputStyle, minHeight: '40px', resize: 'vertical' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="ملاحظات" />

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button type="submit" style={{
              flex: 1, padding: '11px', borderRadius: '8px', border: 'none',
              background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}>تسجيل</button>
            <button type="button" onClick={onCancel} style={{
              padding: '11px 20px', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', cursor: 'pointer',
            }}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}
