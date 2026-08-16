'use client';

import { useState, useEffect, useCallback } from 'react';
import { Expense } from '@/lib/types';
import { getTenants, getExpenses, addExpense, updateExpense, deleteExpense, generateId } from '@/lib/store';
import { printFinancialStatement } from '@/lib/pdf';

const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export default function FinancialView() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalRent, setTotalRent] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);

  const reload = useCallback(() => {
    setTotalRent(getTenants().reduce((s, t) => s + t.rentAmount, 0));
    setExpenses(getExpenses());
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const monthExpenses = expenses.filter(e => e.month === months[selectedMonth] && e.year === selectedYear);
  const generalExpenses = monthExpenses.filter(e => e.type === 'general');
  const electricityExpenses = monthExpenses.filter(e => e.type === 'electricity');
  const salaryExpenses = monthExpenses.filter(e => e.type === 'salary');

  const totalGeneral = generalExpenses.reduce((s, e) => s + e.amount, 0);
  const totalElectricity = electricityExpenses.reduce((s, e) => s + e.amount, 0);
  const totalSalaries = salaryExpenses.reduce((s, e) => s + e.amount, 0);
  const totalExpensesAmount = totalGeneral + totalElectricity + totalSalaries;
  const netProfit = totalRent - totalExpensesAmount;
  const shareReda = netProfit / 2;
  const shareAbbas = netProfit / 2;

  const expensePct = totalRent > 0 ? Math.round((totalExpensesAmount / totalRent) * 100) : 0;

  const selectStyle: React.CSSProperties = {
    padding: '8px 10px', borderRadius: '8px',
    border: '1px solid var(--border)', background: 'var(--bg-card)',
    color: 'var(--text)', fontSize: '13px', outline: 'none',
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>الكشف المالي</h1>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{months[selectedMonth]} {selectedYear}</div>
        </div>
        <button onClick={() => printFinancialStatement(months[selectedMonth], selectedYear)} style={{
          background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '7px 12px', fontSize: '12px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/></svg>
          طباعة
        </button>
      </div>

      {/* Month/Year selectors */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} style={{ ...selectStyle, flex: 1 }}>
          {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{ ...selectStyle, width: '80px' }}>
          {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Income */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>إجمالي الإيجارات</span>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success)' }}>{totalRent.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400 }}>د.ك</span></span>
        </div>
      </div>

      {/* Expenses Summary */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>المصروفات</span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--danger)' }}>{totalExpensesAmount.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400 }}>د.ك</span></span>
        </div>
        {/* expense bar */}
        <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
          <div style={{ height: '100%', width: `${Math.min(expensePct, 100)}%`, borderRadius: '3px', background: expensePct > 80 ? 'var(--danger)' : expensePct > 50 ? 'var(--warning)' : 'var(--success)' }} />
        </div>
        <ExpRow label="المصروفات العامة" value={totalGeneral} color="var(--danger)" />
        <ExpRow label="الكهرباء" value={totalElectricity} color="var(--warning)" />
        <ExpRow label="الرواتب" value={totalSalaries} color="var(--text-muted)" />
      </div>

      {/* Net Profit */}
      <div style={{
        background: netProfit >= 0 ? 'var(--success-light)' : 'var(--danger-light)',
        borderRadius: '12px', padding: '14px',
        border: `1px solid ${netProfit >= 0 ? 'var(--success)' : 'var(--danger)'}`,
        marginBottom: '10px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 700 }}>صافي الربح</span>
          <span style={{ fontSize: '22px', fontWeight: 700, color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {netProfit.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400 }}>د.ك</span>
          </span>
        </div>
      </div>

      {/* Shares */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)', marginBottom: '14px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>توزيع الأرباح</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '12px', textAlign: 'center', borderTop: '3px solid var(--primary)' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>{shareReda.toLocaleString()}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>د.ك</div>
            <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>حصة رضا السلمان</div>
          </div>
          <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '12px', textAlign: 'center', borderTop: '3px solid var(--accent)' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent)' }}>{shareAbbas.toLocaleString()}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>د.ك</div>
            <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>حصة عباس السلمان</div>
          </div>
        </div>
      </div>

      {/* Add Expense */}
      <button onClick={() => { setEditExpense(null); setShowForm(true); }} style={{
        width: '100%', padding: '10px', borderRadius: '10px', border: '1px dashed var(--border)',
        background: 'var(--bg-card)', color: 'var(--primary)', fontSize: '13px', fontWeight: 600,
        cursor: 'pointer', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
      }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
        إضافة مصروف
      </button>

      {/* Expenses Sections */}
      <ExpenseList title="المصروفات العامة" items={generalExpenses} total={totalGeneral} color="var(--danger)"
        onEdit={(e) => { setEditExpense(e); setShowForm(true); }}
        onDelete={(id) => { deleteExpense(id); reload(); }}
      />
      <ExpenseList title="الكهرباء" items={electricityExpenses} total={totalElectricity} color="var(--warning)"
        onEdit={(e) => { setEditExpense(e); setShowForm(true); }}
        onDelete={(id) => { deleteExpense(id); reload(); }}
      />
      <ExpenseList title="الرواتب" items={salaryExpenses} total={totalSalaries} color="var(--text-muted)"
        onEdit={(e) => { setEditExpense(e); setShowForm(true); }}
        onDelete={(id) => { deleteExpense(id); reload(); }}
      />

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

function ExpRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 600, color }}>{value.toLocaleString()} د.ك</span>
    </div>
  );
}

function ExpenseList({ title, items, total, color, onEdit, onDelete }: {
  title: string; items: Expense[]; total: number; color: string;
  onEdit: (e: Expense) => void; onDelete: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '10px' }}>
      <div style={{ padding: '10px 14px', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <span>{title}</span>
        <span style={{ color }}>{total.toLocaleString()} د.ك</span>
      </div>
      {items.map(e => (
        <div key={e.id} style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: '13px' }}>{e.description}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{e.date}{e.notes ? ` — ${e.notes}` : ''}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 600, color, fontSize: '13px' }}>{e.amount} د.ك</span>
            <button onClick={() => onEdit(e)} style={{
              background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px',
              padding: '3px 6px', cursor: 'pointer', fontSize: '11px', color: 'var(--primary)',
            }}>تعديل</button>
            <button onClick={() => { if (confirm('حذف؟')) onDelete(e.id); }} style={{
              background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px',
              padding: '3px 6px', cursor: 'pointer', fontSize: '11px', color: 'var(--danger)',
            }}>حذف</button>
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
        maxWidth: '500px', padding: '20px', maxHeight: '85vh', overflowY: 'auto',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px' }}>{expense ? 'تعديل مصروف' : 'إضافة مصروف'}</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <select style={inputStyle} value={type} onChange={e => setType(e.target.value as Expense['type'])}>
            <option value="general">مصروفات عامة</option>
            <option value="electricity">كهرباء</option>
            <option value="salary">رواتب</option>
          </select>
          <input style={inputStyle} value={description} onChange={e => setDescription(e.target.value)} required placeholder="وصف المصروف" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input style={inputStyle} type="number" step="0.001" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="المبلغ" />
            <input style={{ ...inputStyle, direction: 'ltr' }} type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <textarea style={{ ...inputStyle, minHeight: '40px', resize: 'vertical' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="ملاحظات" />
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button type="submit" style={{
              flex: 1, padding: '11px', borderRadius: '8px', border: 'none',
              background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}>{expense ? 'تحديث' : 'إضافة'}</button>
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
