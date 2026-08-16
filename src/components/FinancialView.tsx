'use client';

import { useState, useEffect, useCallback } from 'react';
import { Expense, Payment, Tenant } from '@/lib/types';
import { getTenants, getExpenses, addExpense, updateExpense, deleteExpense, getPayments, addPayment, deletePayment, getApartments, updateTenant, generateId } from '@/lib/store';
import { printFinancialStatement, printReceipt, printMonthlyStatement, printContract } from '@/lib/pdf';
import { getLang, t, getMonths, monthsAr } from '@/lib/i18n';

type SubTab = 'statement' | 'receipts' | 'contracts';

export default function FinancialView() {
  const lang = getLang();
  const months = getMonths(lang);

  const [subTab, setSubTab] = useState<SubTab>('statement');

  const subTabs: { id: SubTab; label: string }[] = [
    { id: 'statement', label: t('statement', lang) },
    { id: 'receipts', label: t('receipts', lang) },
    { id: 'contracts', label: t('contracts', lang) },
  ];

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 10px' }}>{t('navFinancial', lang)}</h1>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', background: 'var(--bg)', borderRadius: '10px', padding: '3px' }}>
        {subTabs.map(tab => (
          <button key={tab.id} onClick={() => setSubTab(tab.id)} style={{
            flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '12px',
            background: subTab === tab.id ? 'var(--bg-card)' : 'transparent',
            color: subTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow: subTab === tab.id ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s',
          }}>{tab.label}</button>
        ))}
      </div>

      {subTab === 'statement' && <StatementSection lang={lang} months={months} />}
      {subTab === 'receipts' && <ReceiptsSection lang={lang} months={months} />}
      {subTab === 'contracts' && <ContractsSection lang={lang} />}
    </div>
  );
}

/* ── Statement Section ── */
function StatementSection({ lang, months }: { lang: import('@/lib/i18n').Lang; months: string[] }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalRent, setTotalRent] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);

  const reload = useCallback(() => {
    setTotalRent(getTenants().reduce((s, tt) => s + tt.rentAmount, 0));
    setExpenses(getExpenses());
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const monthExpenses = expenses.filter(e => e.month === monthsAr[selectedMonth] && e.year === selectedYear);
  const generalExp = monthExpenses.filter(e => e.type === 'general');
  const electricityExp = monthExpenses.filter(e => e.type === 'electricity');
  const salaryExp = monthExpenses.filter(e => e.type === 'salary');

  const totalGeneral = generalExp.reduce((s, e) => s + e.amount, 0);
  const totalElectricity = electricityExp.reduce((s, e) => s + e.amount, 0);
  const totalSalaries = salaryExp.reduce((s, e) => s + e.amount, 0);
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
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{months[selectedMonth]} {selectedYear}</div>
        <button onClick={() => printFinancialStatement(monthsAr[selectedMonth], selectedYear)} style={{
          background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '7px 12px', fontSize: '12px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/></svg>
          {t('print', lang)}
        </button>
      </div>

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
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{t('totalRent', lang)}</span>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success)' }}>{totalRent.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400 }}>{t('kwd', lang)}</span></span>
        </div>
      </div>

      {/* Expenses */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{t('expenses', lang)}</span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--danger)' }}>{totalExpensesAmount.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400 }}>{t('kwd', lang)}</span></span>
        </div>
        <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
          <div style={{ height: '100%', width: `${Math.min(expensePct, 100)}%`, borderRadius: '3px', background: expensePct > 80 ? 'var(--danger)' : expensePct > 50 ? 'var(--warning)' : 'var(--success)' }} />
        </div>
        <ExpRow label={t('generalExpenses', lang)} value={totalGeneral} color="var(--danger)" l={lang} />
        <ExpRow label={t('electricity', lang)} value={totalElectricity} color="var(--warning)" l={lang} />
        <ExpRow label={t('salaries', lang)} value={totalSalaries} color="var(--text-muted)" l={lang} />
      </div>

      {/* Net Profit */}
      <div style={{
        background: netProfit >= 0 ? 'var(--success-light)' : 'var(--danger-light)',
        borderRadius: '12px', padding: '14px',
        border: `1px solid ${netProfit >= 0 ? 'var(--success)' : 'var(--danger)'}`,
        marginBottom: '10px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 700 }}>{t('netProfit', lang)}</span>
          <span style={{ fontSize: '22px', fontWeight: 700, color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {netProfit.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400 }}>{t('kwd', lang)}</span>
          </span>
        </div>
      </div>

      {/* Shares */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)', marginBottom: '14px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>{t('profitDist', lang)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '12px', textAlign: 'center', borderTop: '3px solid var(--primary)' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>{shareReda.toLocaleString()}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{t('kwd', lang)}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>{t('shareReda', lang)}</div>
          </div>
          <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '12px', textAlign: 'center', borderTop: '3px solid var(--accent)' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent)' }}>{shareAbbas.toLocaleString()}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{t('kwd', lang)}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>{t('shareAbbas', lang)}</div>
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
        {t('addExpense', lang)}
      </button>

      <ExpenseList title={t('generalExpenses', lang)} items={generalExp} total={totalGeneral} color="var(--danger)" lang={lang}
        onEdit={(e) => { setEditExpense(e); setShowForm(true); }}
        onDelete={(id) => { deleteExpense(id); reload(); }}
      />
      <ExpenseList title={t('electricity', lang)} items={electricityExp} total={totalElectricity} color="var(--warning)" lang={lang}
        onEdit={(e) => { setEditExpense(e); setShowForm(true); }}
        onDelete={(id) => { deleteExpense(id); reload(); }}
      />
      <ExpenseList title={t('salaries', lang)} items={salaryExp} total={totalSalaries} color="var(--text-muted)" lang={lang}
        onEdit={(e) => { setEditExpense(e); setShowForm(true); }}
        onDelete={(id) => { deleteExpense(id); reload(); }}
      />

      {showForm && (
        <ExpenseForm
          expense={editExpense}
          month={monthsAr[selectedMonth]}
          year={selectedYear}
          lang={lang}
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
    </>
  );
}

/* ── Receipts Section ── */
function ReceiptsSection({ lang, months }: { lang: import('@/lib/i18n').Lang; months: string[] }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const reload = useCallback(() => { setPayments(getPayments()); setTenants(getTenants()); }, []);
  useEffect(() => { reload(); }, [reload]);

  const monthPayments = payments.filter(p => {
    const d = new Date(p.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const totalExpected = tenants.reduce((s, tt) => s + tt.rentAmount, 0);
  const totalCollected = monthPayments.reduce((s, p) => s + p.amount, 0);
  const remaining = totalExpected - totalCollected;
  const rate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;
  const paidTenantIds = new Set(monthPayments.map(p => p.tenantId));
  const unpaidTenants = tenants.filter(tt => !paidTenantIds.has(tt.id));
  const apartments = getApartments();

  const selectStyle: React.CSSProperties = {
    padding: '8px 10px', borderRadius: '8px',
    border: '1px solid var(--border)', background: 'var(--bg-card)',
    color: 'var(--text)', fontSize: '13px', outline: 'none',
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{months[selectedMonth]} {selectedYear}</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => printMonthlyStatement(tenants, monthPayments, monthsAr[selectedMonth], selectedYear)} style={{
            background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '7px 10px', fontSize: '12px', cursor: 'pointer',
          }}>{t('monthlyStatement', lang)}</button>
          <button onClick={() => setShowForm(true)} style={{
            background: 'var(--primary)', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          }}>{t('newReceipt', lang)}</button>
        </div>
      </div>

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
        <StatBox label={t('collected', lang)} value={totalCollected} color="var(--success)" l={lang} />
        <StatBox label={t('remaining', lang)} value={remaining} color="var(--danger)" l={lang} />
        <StatBox label={t('rate', lang)} value={`${rate}%`} color={rate >= 80 ? 'var(--success)' : rate >= 50 ? 'var(--warning)' : 'var(--danger)'} l={lang} isText />
      </div>

      {/* Progress */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '10px 14px', border: '1px solid var(--border)', marginBottom: '12px' }}>
        <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: '3px', width: `${rate}%`, background: rate >= 80 ? 'var(--success)' : rate >= 50 ? 'var(--warning)' : 'var(--danger)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '4px', color: 'var(--text-muted)' }}>
          <span>{paidTenantIds.size} {t('paid', lang)}</span>
          <span>{unpaidTenants.length} {t('unpaid', lang)}</span>
        </div>
      </div>

      {/* Recorded Payments */}
      {monthPayments.length > 0 && (
        <div style={{ background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '12px' }}>
          <div style={{ padding: '10px 14px', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <span>{t('recordedPayments', lang)} ({monthPayments.length})</span>
            <span style={{ color: 'var(--success)' }}>{totalCollected} {t('kwd', lang)}</span>
          </div>
          {monthPayments.map(p => {
            const tenant = tenants.find(tt => tt.id === p.tenantId);
            const apt = tenant ? apartments.find(a => a.id === tenant.apartmentId) : null;
            return (
              <div key={p.id} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '13px' }}>{tenant?.name || '-'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{t('apt', lang)} {apt?.number} — {p.method} — {p.date}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '13px' }}>{p.amount} {t('kwd', lang)}</span>
                  {tenant && (
                    <button onClick={() => printReceipt(tenant, p)} style={{
                      background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px',
                      padding: '3px 6px', cursor: 'pointer', fontSize: '11px', color: 'var(--text-muted)',
                    }}>{t('print', lang)}</button>
                  )}
                  <button onClick={() => { if (confirm(lang === 'ar' ? 'حذف هذا الوصل؟' : 'Delete this receipt?')) { deletePayment(p.id); reload(); } }} style={{
                    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px',
                    padding: '3px 6px', cursor: 'pointer', fontSize: '11px', color: 'var(--danger)',
                  }}>{t('delete', lang)}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Unpaid */}
      {unpaidTenants.length > 0 && (
        <div style={{ background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden', borderInlineStart: '3px solid var(--danger)' }}>
          <div style={{ padding: '10px 14px', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid var(--border)', color: 'var(--danger)', display: 'flex', justifyContent: 'space-between' }}>
            <span>{t('notPaid', lang)} ({unpaidTenants.length})</span>
            <span>{remaining.toLocaleString()} {t('kwd', lang)}</span>
          </div>
          {unpaidTenants.map(tt => {
            const apt = apartments.find(a => a.id === tt.apartmentId);
            return (
              <div key={tt.id} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '13px' }}>{tt.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{t('apt', lang)} {apt?.number} — {tt.floor}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '13px' }}>{tt.rentAmount} {t('kwd', lang)}</span>
                  {tt.phone && (
                    <a href={`https://wa.me/965${tt.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{
                      background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px',
                      padding: '3px 6px', fontSize: '11px', color: 'var(--success)', textDecoration: 'none',
                    }}>{t('whatsapp', lang)}</a>
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
          lang={lang}
          onSave={(p) => { addPayment(p); setShowForm(false); reload(); }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </>
  );
}

/* ── Contracts Section (with Renew/Delete) ── */
function ContractsSection({ lang }: { lang: import('@/lib/i18n').Lang }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'expiring' | 'expired' | 'no-contract'>('all');
  const [renewingTenant, setRenewingTenant] = useState<Tenant | null>(null);

  const reload = useCallback(() => { setTenants(getTenants()); }, []);
  useEffect(() => { reload(); }, [reload]);

  const apartments = getApartments();
  const now = new Date();

  const categorize = (tt: Tenant) => {
    if (!tt.leaseStart || !tt.leaseEnd) return 'no-contract';
    const end = new Date(tt.leaseEnd);
    if (end < now) return 'expired';
    const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 90) return 'expiring';
    return 'active';
  };

  const filtered = filter === 'all' ? tenants : tenants.filter(tt => categorize(tt) === filter);

  const counts = {
    all: tenants.length,
    active: tenants.filter(tt => categorize(tt) === 'active').length,
    expiring: tenants.filter(tt => categorize(tt) === 'expiring').length,
    expired: tenants.filter(tt => categorize(tt) === 'expired').length,
    'no-contract': tenants.filter(tt => categorize(tt) === 'no-contract').length,
  };

  const filters: { id: typeof filter; label: string; color: string }[] = [
    { id: 'all', label: t('all', lang), color: 'var(--primary)' },
    { id: 'active', label: t('active', lang), color: 'var(--success)' },
    { id: 'expiring', label: t('expiringSoon', lang), color: 'var(--warning)' },
    { id: 'expired', label: t('expired', lang), color: 'var(--danger)' },
    { id: 'no-contract', label: t('noContract', lang), color: 'var(--text-muted)' },
  ];

  const statusStyle = (cat: string) => {
    switch (cat) {
      case 'active': return { color: 'var(--success)', label: t('contractActive', lang) };
      case 'expiring': return { color: 'var(--warning)', label: t('contractExpiring', lang) };
      case 'expired': return { color: 'var(--danger)', label: t('contractExpired', lang) };
      default: return { color: 'var(--text-muted)', label: t('noContract', lang) };
    }
  };

  const handleRenew = (tt: Tenant, newStart: string, newEnd: string) => {
    updateTenant({ ...tt, leaseStart: newStart, leaseEnd: newEnd });
    setRenewingTenant(null);
    reload();
  };

  return (
    <>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
        {counts.active} {t('active', lang)} — {counts.expiring} {t('expiringSoon', lang)} — {counts.expired} {t('expired', lang)}
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600,
            whiteSpace: 'nowrap', border: '1px solid',
            background: filter === f.id ? f.color : 'var(--bg-card)',
            color: filter === f.id ? '#fff' : f.color,
            borderColor: filter === f.id ? f.color : 'var(--border)',
            cursor: 'pointer',
          }}>
            {f.label} ({counts[f.id]})
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(tt => {
          const cat = categorize(tt);
          const info = statusStyle(cat);
          const apt = apartments.find(a => a.id === tt.apartmentId);
          const daysLeft = tt.leaseEnd ? Math.ceil((new Date(tt.leaseEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

          return (
            <div key={tt.id} style={{
              background: 'var(--bg-card)', borderRadius: '10px',
              border: '1px solid var(--border)', overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{tt.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{t('apt', lang)} {apt?.number} — {tt.floor}</div>
                  </div>
                  <span style={{ color: info.color, fontSize: '11px', fontWeight: 700 }}>{info.label}</span>
                </div>

                {tt.leaseStart && tt.leaseEnd ? (
                  <div style={{ display: 'flex', gap: '8px', fontSize: '12px', marginBottom: '8px' }}>
                    <div style={{ background: 'var(--bg)', padding: '6px 10px', borderRadius: '6px', flex: 1 }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{t('from', lang)} </span>
                      <span style={{ fontWeight: 600 }}>{tt.leaseStart}</span>
                    </div>
                    <div style={{ background: 'var(--bg)', padding: '6px 10px', borderRadius: '6px', flex: 1 }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{t('to', lang)} </span>
                      <span style={{ fontWeight: 600 }}>{tt.leaseEnd}</span>
                    </div>
                    {daysLeft !== null && (
                      <div style={{ padding: '6px 10px', borderRadius: '6px', fontWeight: 700, color: info.color, fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                        {daysLeft > 0 ? `${daysLeft} ${t('days', lang)}` : t('contractExpired', lang)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{t('noContractDetails', lang)}</div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>
                    {tt.rentAmount} <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>{t('kwd', lang)}</span>
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(cat === 'expired' || cat === 'expiring' || cat === 'no-contract') && (
                      <button onClick={() => setRenewingTenant(tt)} style={{
                        background: 'var(--success)', border: 'none', borderRadius: '6px',
                        padding: '5px 10px', cursor: 'pointer', fontSize: '12px', color: '#fff', fontWeight: 600,
                      }}>{lang === 'ar' ? 'تجديد' : 'Renew'}</button>
                    )}
                    <button onClick={() => printContract(tt)} style={{
                      background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px',
                      padding: '5px 10px', cursor: 'pointer', fontSize: '12px', color: 'var(--primary)', fontWeight: 600,
                    }}>{t('printContract', lang)}</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>{t('noContracts', lang)}</div>
        )}
      </div>

      {renewingTenant && (
        <RenewContractForm tenant={renewingTenant} lang={lang} onRenew={handleRenew} onCancel={() => setRenewingTenant(null)} />
      )}
    </>
  );
}

/* ── Renew Contract Form ── */
function RenewContractForm({ tenant, lang, onRenew, onCancel }: {
  tenant: Tenant; lang: import('@/lib/i18n').Lang;
  onRenew: (t: Tenant, start: string, end: string) => void;
  onCancel: () => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(nextYear);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    direction: 'ltr' as const,
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
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px' }}>{lang === 'ar' ? 'تجديد العقد' : 'Renew Contract'}</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>{tenant.name}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>{t('leaseStart', lang)}</label>
            <input style={inputStyle} type="date" value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>{t('leaseEnd', lang)}</label>
            <input style={inputStyle} type="date" value={end} onChange={e => setEnd(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button onClick={() => onRenew(tenant, start, end)} style={{
              flex: 1, padding: '11px', borderRadius: '8px', border: 'none',
              background: 'var(--success)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}>{lang === 'ar' ? 'تجديد' : 'Renew'}</button>
            <button onClick={onCancel} style={{
              padding: '11px 20px', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', cursor: 'pointer',
            }}>{t('cancel', lang)}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Shared Components ── */

function ExpRow({ label, value, color, l }: { label: string; value: number; color: string; l: import('@/lib/i18n').Lang }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 600, color }}>{value.toLocaleString()} {t('kwd', l)}</span>
    </div>
  );
}

function StatBox({ label, value, color, l, isText }: { label: string; value: number | string; color: string; l: import('@/lib/i18n').Lang; isText?: boolean }) {
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '10px', textAlign: 'center', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '18px', fontWeight: 700, color }}>{isText ? value : (typeof value === 'number' ? value.toLocaleString() : value)}</div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

function ExpenseList({ title, items, total, color, lang, onEdit, onDelete }: {
  title: string; items: Expense[]; total: number; color: string; lang: import('@/lib/i18n').Lang;
  onEdit: (e: Expense) => void; onDelete: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '10px' }}>
      <div style={{ padding: '10px 14px', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <span>{title}</span>
        <span style={{ color }}>{total.toLocaleString()} {t('kwd', lang)}</span>
      </div>
      {items.map(e => (
        <div key={e.id} style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: '13px' }}>{e.description}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{e.date}{e.notes ? ` — ${e.notes}` : ''}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 600, color, fontSize: '13px' }}>{e.amount} {t('kwd', lang)}</span>
            <button onClick={() => onEdit(e)} style={{
              background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px',
              padding: '3px 6px', cursor: 'pointer', fontSize: '11px', color: 'var(--primary)',
            }}>{t('edit', lang)}</button>
            <button onClick={() => { if (confirm(lang === 'ar' ? 'حذف؟' : 'Delete?')) onDelete(e.id); }} style={{
              background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px',
              padding: '3px 6px', cursor: 'pointer', fontSize: '11px', color: 'var(--danger)',
            }}>{t('delete', lang)}</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExpenseForm({ expense, month, year, lang, onSave, onCancel }: {
  expense: Expense | null; month: string; year: number; lang: import('@/lib/i18n').Lang;
  onSave: (e: Expense) => void; onCancel: () => void;
}) {
  const [type, setType] = useState<Expense['type']>(expense?.type || 'general');
  const [description, setDescription] = useState(expense?.description || '');
  const [amount, setAmount] = useState(expense?.amount?.toString() || '');
  const [date, setDate] = useState(expense?.date || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(expense?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: expense?.id || generateId(), type, description, amount: Number(amount), month, year, date, notes });
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
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px' }}>{expense ? t('editExpense', lang) : t('addExpense', lang)}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <select style={inputStyle} value={type} onChange={e => setType(e.target.value as Expense['type'])}>
            <option value="general">{t('generalExpenses', lang)}</option>
            <option value="electricity">{t('electricity', lang)}</option>
            <option value="salary">{t('salaries', lang)}</option>
          </select>
          <input style={inputStyle} value={description} onChange={e => setDescription(e.target.value)} required placeholder={t('expenseDesc', lang)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input style={inputStyle} type="number" step="0.001" value={amount} onChange={e => setAmount(e.target.value)} required placeholder={t('amount', lang)} />
            <input style={{ ...inputStyle, direction: 'ltr' }} type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <textarea style={{ ...inputStyle, minHeight: '40px', resize: 'vertical' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('notes', lang)} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button type="submit" style={{
              flex: 1, padding: '11px', borderRadius: '8px', border: 'none',
              background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}>{expense ? t('update', lang) : t('add', lang)}</button>
            <button type="button" onClick={onCancel} style={{
              padding: '11px 20px', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', cursor: 'pointer',
            }}>{t('cancel', lang)}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PaymentForm({ tenants, lang, onSave, onCancel }: { tenants: Tenant[]; lang: import('@/lib/i18n').Lang; onSave: (p: Payment) => void; onCancel: () => void }) {
  const [tenantId, setTenantId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('نقدا');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const selectedTenant = tenants.find(tt => tt.id === tenantId);
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
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px' }}>{t('rentReceipt', lang)}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <select style={inputStyle} value={tenantId} onChange={e => {
            setTenantId(e.target.value);
            const tt = tenants.find(x => x.id === e.target.value);
            if (tt) setAmount(tt.rentAmount.toString());
          }} required>
            <option value="">{t('selectTenant', lang)}</option>
            {tenants.map(tt => <option key={tt.id} value={tt.id}>{tt.name}</option>)}
          </select>

          {selectedTenant && (
            <div style={{ background: 'var(--bg)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>{t('apt', lang)} {apartments.find(a => a.id === selectedTenant.apartmentId)?.number} — {selectedTenant.floor}</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{selectedTenant.rentAmount} {t('kwd', lang)}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input style={inputStyle} type="number" value={amount} onChange={e => setAmount(e.target.value)} required placeholder={t('amount', lang)} />
            <input style={{ ...inputStyle, direction: 'ltr' }} type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>

          <select style={inputStyle} value={method} onChange={e => setMethod(e.target.value)}>
            <option value="نقدا">{t('cash', lang)}</option>
            <option value="شيك">{t('check', lang)}</option>
            <option value="تحويل">{t('bankTransfer', lang)}</option>
          </select>

          <textarea style={{ ...inputStyle, minHeight: '40px', resize: 'vertical' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('notes', lang)} />

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button type="submit" style={{
              flex: 1, padding: '11px', borderRadius: '8px', border: 'none',
              background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}>{t('register', lang)}</button>
            <button type="button" onClick={onCancel} style={{
              padding: '11px 20px', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', cursor: 'pointer',
            }}>{t('cancel', lang)}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
