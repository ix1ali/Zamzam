'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tenant, Expense } from '@/lib/types';
import { getTenants, getExpenses, addExpense, updateExpense, deleteExpense, generateId } from '@/lib/store';

const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export default function FinancialView() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);

  const reload = useCallback(() => {
    setTenants(getTenants());
    setExpenses(getExpenses());
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const monthExpenses = expenses.filter(e => e.month === months[selectedMonth] && e.year === selectedYear);
  const generalExpenses = monthExpenses.filter(e => e.type === 'general');
  const electricityExpenses = monthExpenses.filter(e => e.type === 'electricity');
  const salaryExpenses = monthExpenses.filter(e => e.type === 'salary');

  const totalRent = tenants.reduce((s, t) => s + t.rentAmount, 0);
  const totalGeneral = generalExpenses.reduce((s, e) => s + e.amount, 0);
  const totalElectricity = electricityExpenses.reduce((s, e) => s + e.amount, 0);
  const totalSalaries = salaryExpenses.reduce((s, e) => s + e.amount, 0);
  const totalExpensesAmount = totalGeneral + totalElectricity + totalSalaries;
  const netProfit = totalRent - totalExpensesAmount;
  const shareEach = netProfit / 2;

  const printStatement = () => {
    const w = window.open('', '_blank', 'width=700,height=900');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<title>كشف مالي - ${months[selectedMonth]} ${selectedYear}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Arial, sans-serif; padding: 32px; color: #1a1a2e; direction: rtl; max-width: 700px; margin: 0 auto; }
  .header { text-align: center; border-bottom: 3px double #1e3a5f; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 24px; color: #1e3a5f; }
  .header h2 { font-size: 16px; color: #666; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th { background: #1e3a5f; color: #fff; padding: 10px 12px; text-align: right; font-size: 13px; }
  td { padding: 8px 12px; border-bottom: 1px solid #e2e6ea; font-size: 13px; }
  .total-row { background: #f0f7ff; font-weight: 700; }
  .profit-row { background: #e6f7f1; font-weight: 700; font-size: 15px; }
  .loss-row { background: #fde8ea; font-weight: 700; font-size: 15px; }
  .share { margin-top: 20px; padding: 16px; background: #f8f9fb; border-radius: 10px; }
  .share h3 { font-size: 14px; color: #1e3a5f; margin-bottom: 10px; }
  .share .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
  .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #888; border-top: 2px solid #1e3a5f; padding-top: 12px; }
  @media print { body { padding: 16px; } }
</style></head><body>
<div class="header">
  <h1>عمارة زمزم - Zamzam Building</h1>
  <h2>الكشف المالي - ${months[selectedMonth]} ${selectedYear}</h2>
  <p style="font-size:12px;color:#888;margin-top:8px">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-KW')}</p>
</div>

<table>
  <thead><tr><th>البيان</th><th>المبلغ (د.ك)</th></tr></thead>
  <tbody>
    <tr class="total-row"><td>إجمالي الإيجارات الشهرية</td><td>${totalRent.toLocaleString()}</td></tr>
    <tr><td colspan="2" style="background:#1e3a5f;color:#fff;font-weight:600">المصروفات</td></tr>
    ${generalExpenses.map(e => `<tr><td style="padding-right:24px">${e.description}</td><td>${e.amount.toLocaleString()}</td></tr>`).join('')}
    ${generalExpenses.length > 0 ? `<tr style="background:#fff8e1"><td style="font-weight:600">إجمالي المصروفات العامة</td><td style="font-weight:600">${totalGeneral.toLocaleString()}</td></tr>` : ''}
    <tr><td colspan="2" style="background:#e8eef6;font-weight:600">الكهرباء</td></tr>
    ${electricityExpenses.map(e => `<tr><td style="padding-right:24px">${e.description}</td><td>${e.amount.toLocaleString()}</td></tr>`).join('')}
    ${electricityExpenses.length > 0 ? `<tr style="background:#fff8e1"><td style="font-weight:600">إجمالي الكهرباء</td><td style="font-weight:600">${totalElectricity.toLocaleString()}</td></tr>` : ''}
    <tr><td colspan="2" style="background:#e8eef6;font-weight:600">الرواتب</td></tr>
    ${salaryExpenses.map(e => `<tr><td style="padding-right:24px">${e.description}</td><td>${e.amount.toLocaleString()}</td></tr>`).join('')}
    ${salaryExpenses.length > 0 ? `<tr style="background:#fff8e1"><td style="font-weight:600">إجمالي الرواتب</td><td style="font-weight:600">${totalSalaries.toLocaleString()}</td></tr>` : ''}
    <tr class="total-row"><td>إجمالي المصروفات</td><td>${totalExpensesAmount.toLocaleString()}</td></tr>
    <tr class="${netProfit >= 0 ? 'profit-row' : 'loss-row'}"><td>صافي الربح</td><td>${netProfit.toLocaleString()}</td></tr>
  </tbody>
</table>

<div class="share">
  <h3>توزيع الأرباح (50/50)</h3>
  <div class="row"><span>الطرف الأول</span><span style="font-weight:700">${shareEach.toLocaleString()} د.ك</span></div>
  <div class="row"><span>الطرف الثاني</span><span style="font-weight:700">${shareEach.toLocaleString()} د.ك</span></div>
</div>

<div class="footer"><p>عمارة زمزم - Zamzam Building Management System</p></div>
<script>setTimeout(()=>window.print(),500)</script>
</body></html>`);
    w.document.close();
  };

  return (
    <div style={{ padding: '0' }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2a5298 100%)',
        padding: '20px 20px 24px', color: '#fff', borderRadius: '0 0 20px 20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>الكشف المالي</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Financial Statement</div>
          </div>
          <button onClick={printStatement} style={{
            background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '10px', padding: '8px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          }}>
            🖨️ طباعة
          </button>
        </div>

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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{totalRent.toLocaleString()}</div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>إيجارات / Rent</div>
          </div>
          <div style={{ background: netProfit >= 0 ? 'rgba(13,159,110,0.25)' : 'rgba(220,53,69,0.25)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{netProfit.toLocaleString()}</div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>صافي / Net</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* Summary Card */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: '16px',
          boxShadow: 'var(--shadow)', border: '1px solid var(--border)', marginBottom: '14px',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text)' }}>ملخص / Summary</div>
          <SummaryRow label="إجمالي الإيجارات" labelEn="Total Rent" value={totalRent} color="var(--primary)" />
          <SummaryRow label="المصروفات العامة" labelEn="Expenses" value={totalGeneral} color="var(--danger)" minus />
          <SummaryRow label="الكهرباء" labelEn="Electricity" value={totalElectricity} color="var(--warning)" minus />
          <SummaryRow label="الرواتب" labelEn="Salaries" value={totalSalaries} color="var(--accent)" minus />
          <div style={{ borderTop: '2px solid var(--border)', marginTop: '8px', paddingTop: '8px' }}>
            <SummaryRow label="صافي الربح" labelEn="Net Profit" value={netProfit} color={netProfit >= 0 ? 'var(--success)' : 'var(--danger)'} bold />
          </div>
          <div style={{ borderTop: '1px dashed var(--border)', marginTop: '8px', paddingTop: '8px' }}>
            <SummaryRow label="حصة الطرف الأول" labelEn="Share 1 (50%)" value={shareEach} color="var(--primary)" />
            <SummaryRow label="حصة الطرف الثاني" labelEn="Share 2 (50%)" value={shareEach} color="var(--primary)" />
          </div>
        </div>

        {/* Add Expense Button */}
        <button onClick={() => { setEditExpense(null); setShowForm(true); }} style={{
          width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '2px dashed var(--border)',
          background: 'var(--bg-card)', color: 'var(--primary)', fontSize: '14px', fontWeight: 600,
          cursor: 'pointer', marginBottom: '14px',
        }}>
          + إضافة مصروف / Add Expense
        </button>

        {/* Expenses List */}
        <ExpenseSection title="المصروفات العامة / Expenses" items={generalExpenses} total={totalGeneral} color="var(--danger)"
          onEdit={(e) => { setEditExpense(e); setShowForm(true); }}
          onDelete={(id) => { deleteExpense(id); reload(); }}
        />
        <ExpenseSection title="الكهرباء / Electricity" items={electricityExpenses} total={totalElectricity} color="var(--warning)"
          onEdit={(e) => { setEditExpense(e); setShowForm(true); }}
          onDelete={(id) => { deleteExpense(id); reload(); }}
        />
        <ExpenseSection title="الرواتب / Salaries" items={salaryExpenses} total={totalSalaries} color="var(--accent)"
          onEdit={(e) => { setEditExpense(e); setShowForm(true); }}
          onDelete={(id) => { deleteExpense(id); reload(); }}
        />
      </div>

      {showForm && (
        <ExpenseForm
          expense={editExpense}
          month={months[selectedMonth]}
          year={selectedYear}
          onSave={(e) => {
            if (editExpense) updateExpense(e);
            else addExpense(e);
            setShowForm(false);
            setEditExpense(null);
            reload();
          }}
          onCancel={() => { setShowForm(false); setEditExpense(null); }}
        />
      )}
    </div>
  );
}

function SummaryRow({ label, labelEn, value, color, minus, bold }: {
  label: string; labelEn: string; value: number; color: string; minus?: boolean; bold?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
      <span style={{ color: 'var(--text-secondary)', fontWeight: bold ? 700 : 400 }}>{label} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{labelEn}</span></span>
      <span style={{ fontWeight: bold ? 700 : 600, color, fontSize: bold ? '16px' : '13px' }}>
        {minus && value > 0 ? '- ' : ''}{value.toLocaleString()} <span style={{ fontSize: '10px' }}>د.ك</span>
      </span>
    </div>
  );
}

function ExpenseSection({ title, items, total, color, onEdit, onDelete }: {
  title: string; items: Expense[]; total: number; color: string;
  onEdit: (e: Expense) => void; onDelete: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 'var(--radius)', overflow: 'hidden',
      boxShadow: 'var(--shadow)', border: '1px solid var(--border)', marginBottom: '14px',
      borderRight: `4px solid ${color}`,
    }}>
      <div style={{ padding: '12px 16px', fontWeight: 600, fontSize: '14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <span>{title}</span>
        <span style={{ color, fontSize: '13px' }}>{total.toLocaleString()} د.ك</span>
      </div>
      {items.map(e => (
        <div key={e.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: '13px' }}>{e.description}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{e.date}{e.notes ? ` - ${e.notes}` : ''}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 600, color, fontSize: '13px' }}>{e.amount} د.ك</span>
            <button onClick={() => onEdit(e)} style={{ background: 'var(--primary-light)', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px', color: 'var(--primary)' }}>✏️</button>
            <button onClick={() => { if (confirm('حذف؟')) onDelete(e.id); }} style={{ background: 'var(--danger-light)', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px', color: 'var(--danger)' }}>🗑️</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExpenseForm({ expense, month, year, onSave, onCancel }: {
  expense: Expense | null; month: string; year: number;
  onSave: (e: Expense) => void; onCancel: () => void;
}) {
  const [type, setType] = useState<Expense['type']>(expense?.type || 'general');
  const [description, setDescription] = useState(expense?.description || '');
  const [amount, setAmount] = useState(expense?.amount?.toString() || '');
  const [date, setDate] = useState(expense?.date || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(expense?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: expense?.id || generateId(),
      type, description, amount: Number(amount),
      month, year, date, notes,
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
        maxWidth: '500px', padding: '24px 20px', maxHeight: '85vh', overflowY: 'auto',
      }}>
        <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{expense ? 'تعديل مصروف' : 'إضافة مصروف'}</h2>
          <button onClick={onCancel} style={{ background: 'var(--bg)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '18px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>النوع / Type *</label>
            <select style={inputStyle} value={type} onChange={e => setType(e.target.value as Expense['type'])}>
              <option value="general">مصروفات عامة / General</option>
              <option value="electricity">كهرباء / Electricity</option>
              <option value="salary">رواتب / Salary</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>الوصف / Description *</label>
            <input style={inputStyle} value={description} onChange={e => setDescription(e.target.value)} required placeholder="وصف المصروف" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>المبلغ / Amount *</label>
              <input style={inputStyle} type="number" step="0.001" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>التاريخ / Date *</label>
              <input style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }} type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
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
            }}>{expense ? 'تحديث / Update' : 'إضافة / Add'}</button>
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
