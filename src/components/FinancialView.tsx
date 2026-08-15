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
  const shareEach = netProfit / 2;

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
          borderRadius: '8px', padding: '7px 10px', fontSize: '12px', cursor: 'pointer',
        }}>طباعة</button>
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

      {/* Summary Card */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '14px', border: '1px solid var(--border)', marginBottom: '12px' }}>
        <Row label="إجمالي الإيجارات" value={totalRent} color="var(--primary)" />
        <Row label="المصروفات العامة" value={totalGeneral} color="var(--danger)" minus />
        <Row label="الكهرباء" value={totalElectricity} color="var(--warning)" minus />
        <Row label="الرواتب" value={totalSalaries} color="var(--text-muted)" minus />
        <div style={{ borderTop: '2px solid var(--border)', marginTop: '6px', paddingTop: '6px' }}>
          <Row label="إجمالي المصروفات" value={totalExpensesAmount} color="var(--danger)" bold />
        </div>
        <div style={{ borderTop: '2px solid var(--border)', marginTop: '6px', paddingTop: '6px' }}>
          <Row label="صافي الربح" value={netProfit} color={netProfit >= 0 ? 'var(--success)' : 'var(--danger)'} bold />
        </div>
        <div style={{ borderTop: '1px dashed var(--border)', marginTop: '6px', paddingTop: '6px' }}>
          <Row label="حصة الطرف الأول (50%)" value={shareEach} color="var(--primary)" />
          <Row label="حصة الطرف الثاني (50%)" value={shareEach} color="var(--primary)" />
        </div>
      </div>

      {/* Add Expense */}
      <button onClick={() => { setEditExpense(null); setShowForm(true); }} style={{
        width: '100%', padding: '10px', borderRadius: '8px', border: '1px dashed var(--border)',
        background: 'var(--bg-card)', color: 'var(--primary)', fontSize: '13px', fontWeight: 600,
        cursor: 'pointer', marginBottom: '12px',
      }}>
        + إضافة مصروف
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

function Row({ label, value, color, minus, bold }: { label: string; value: number; color: string; minus?: boolean; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: bold ? '14px' : '13px' }}>
      <span style={{ fontWeight: bold ? 700 : 400, color: 'var(--text)' }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 600, color }}>
        {minus && value > 0 ? '- ' : ''}{value.toLocaleString()} د.ك
      </span>
    </div>
  );
}

function ExpenseList({ title, items, total, color, onEdit, onDelete }: {
  title: string; items: Expense[]; total: number; color: string;
  onEdit: (e: Expense) => void; onDelete: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '10px' }}>
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
