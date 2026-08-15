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

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2a5298 100%)',
        padding: '20px 20px 24px', color: '#fff', borderRadius: '0 0 20px 20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>وصولات الإيجار / Receipts</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>{months[selectedMonth]} {selectedYear}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => printMonthlyStatement(tenants, monthPayments, months[selectedMonth], selectedYear)} style={{
              background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '10px', padding: '8px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}>
              🖨️ كشف
            </button>
            <button onClick={() => setShowForm(true)} style={{
              background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '10px', padding: '8px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}>
              + وصل
            </button>
          </div>
        </div>

        {/* Month/Year selectors */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} style={{
            flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
            background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '13px',
          }}>
            {months.map((m, i) => <option key={i} value={i} style={{ color: '#333' }}>{m}</option>)}
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{
            width: '80px', padding: '8px', borderRadius: '8px', border: 'none',
            background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '13px',
          }}>
            {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y} style={{ color: '#333' }}>{y}</option>)}
          </select>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{totalCollected.toLocaleString()}</div>
            <div style={{ fontSize: '9px', opacity: 0.8 }}>محصّل / Collected</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{remaining.toLocaleString()}</div>
            <div style={{ fontSize: '9px', opacity: 0.8 }}>متبقي / Remaining</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{rate}%</div>
            <div style={{ fontSize: '9px', opacity: 0.8 }}>نسبة / Rate</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* Progress Bar */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: '14px 16px',
          boxShadow: 'var(--shadow)', border: '1px solid var(--border)', marginBottom: '14px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>التحصيل / Collection Progress</span>
            <span style={{ fontWeight: 700, color: rate >= 80 ? 'var(--success)' : rate >= 50 ? 'var(--warning)' : 'var(--danger)' }}>{rate}%</span>
          </div>
          <div style={{ height: '10px', background: 'var(--bg)', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '5px', transition: 'width 0.5s ease',
              width: `${rate}%`,
              background: rate >= 80 ? 'linear-gradient(90deg, #0d9f6e, #34d399)' : rate >= 50 ? 'linear-gradient(90deg, #e67e22, #f39c12)' : 'linear-gradient(90deg, #dc3545, #e74c3c)',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '6px', color: 'var(--text-muted)' }}>
            <span>{paidTenantIds.size} دفعوا / paid</span>
            <span>{unpaidTenants.length} لم يدفعوا / unpaid</span>
          </div>
        </div>

        {/* Recorded Payments */}
        {monthPayments.length > 0 && (
          <div style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius)', overflow: 'hidden',
            boxShadow: 'var(--shadow)', border: '1px solid var(--border)', marginBottom: '14px',
          }}>
            <div style={{ padding: '12px 16px', fontWeight: 600, fontSize: '14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <span>الدفعات المسجلة / Recorded ({monthPayments.length})</span>
              <span style={{ color: 'var(--success)', fontSize: '13px' }}>{totalCollected} د.ك</span>
            </div>
            {monthPayments.map(p => {
              const tenant = tenants.find(t => t.id === p.tenantId);
              const apt = tenant ? apartments.find(a => a.id === tenant.apartmentId) : null;
              return (
                <div key={p.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '14px' }}>{tenant?.name || 'غير معروف'}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>شقة {apt?.number} - {p.method} - {p.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '14px' }}>{p.amount} د.ك</span>
                    {tenant && (
                      <button onClick={() => printReceipt(tenant, p)} style={{
                        background: 'var(--primary-light)', border: 'none', borderRadius: '6px',
                        padding: '4px 8px', cursor: 'pointer', fontSize: '11px', color: 'var(--primary)',
                      }}>🖨️</button>
                    )}
                    <button onClick={() => { if (confirm('حذف هذا الوصل؟')) { deletePayment(p.id); reload(); } }} style={{
                      background: 'var(--danger-light)', border: 'none', borderRadius: '6px',
                      padding: '4px 8px', cursor: 'pointer', fontSize: '11px', color: 'var(--danger)',
                    }}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Unpaid */}
        {unpaidTenants.length > 0 && (
          <div style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius)', overflow: 'hidden',
            boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
            borderRight: '4px solid var(--danger)',
          }}>
            <div style={{ padding: '12px 16px', fontWeight: 600, fontSize: '14px', borderBottom: '1px solid var(--border)', color: 'var(--danger)', display: 'flex', justifyContent: 'space-between' }}>
              <span>لم يدفعوا / Unpaid ({unpaidTenants.length})</span>
              <span>{remaining.toLocaleString()} د.ك</span>
            </div>
            {unpaidTenants.map(t => {
              const apt = apartments.find(a => a.id === t.apartmentId);
              return (
                <div key={t.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '13px' }}>{t.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>شقة {apt?.number} - {t.floor}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '13px' }}>{t.rentAmount} د.ك</span>
                    {t.phone && (
                      <a href={`https://wa.me/965${t.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{
                        background: '#e6faf0', border: 'none', borderRadius: '6px',
                        padding: '4px 8px', fontSize: '11px', color: '#25d366', textDecoration: 'none',
                      }}>💬</a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-card)', borderRadius: '24px 24px 0 0', width: '100%',
        maxWidth: '500px', padding: '24px 20px',
      }}>
        <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>وصل إيجار / Rent Receipt</h2>
          <button onClick={onCancel} style={{ background: 'var(--bg)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '18px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>المستأجر / Tenant *</label>
            <select style={inputStyle} value={tenantId} onChange={e => {
              setTenantId(e.target.value);
              const t = tenants.find(t => t.id === e.target.value);
              if (t) setAmount(t.rentAmount.toString());
            }} required>
              <option value="">اختر المستأجر / Select tenant</option>
              {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {selectedTenant && (
            <div style={{ background: 'var(--primary-light)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
              <span>شقة {apartments.find(a => a.id === selectedTenant.apartmentId)?.number} - {selectedTenant.floor}</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{selectedTenant.rentAmount} د.ك</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>المبلغ / Amount (KWD) *</label>
              <input style={inputStyle} type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>التاريخ / Date *</label>
              <input style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }} type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>طريقة الدفع / Payment Method</label>
            <select style={inputStyle} value={method} onChange={e => setMethod(e.target.value)}>
              <option value="نقدا">نقدا / Cash</option>
              <option value="شيك">شيك / Check</option>
              <option value="تحويل">تحويل بنكي / Bank Transfer</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>ملاحظات / Notes</label>
            <textarea style={{ ...inputStyle, minHeight: '50px', resize: 'vertical' }} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" style={{
              flex: 1, padding: '13px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #1e3a5f, #2a5298)', color: '#fff',
              fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            }}>تسجيل / Record</button>
            <button type="button" onClick={onCancel} style={{
              padding: '13px 24px', borderRadius: '12px', border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text)', fontSize: '15px', cursor: 'pointer',
            }}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}
