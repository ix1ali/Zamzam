import { Tenant, Payment, Apartment, Expense, Eviction, AuditLog, User } from './types';
import { initialTenants, initialApartments } from './data';
import { supabase, toSnake, toCamel } from './supabase';

const TENANTS_KEY = 'zamzam_tenants';
const PAYMENTS_KEY = 'zamzam_payments';
const APARTMENTS_KEY = 'zamzam_apartments';
const EXPENSES_KEY = 'zamzam_expenses';
const EVICTIONS_KEY = 'zamzam_evictions';
const AUDIT_LOG_KEY = 'zamzam_audit_log';
const USERS_KEY = 'zamzam_users';
const CURRENT_USER_KEY = 'zamzam_current_user';
const SYNCED_KEY = 'zamzam_synced';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ── Supabase sync ──

async function dbFetch<T>(table: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('*');
  if (error) { console.error(`DB fetch ${table}:`, error); return []; }
  return (data || []).map(row => toCamel<T>(row as Record<string, unknown>));
}

async function dbUpsert(table: string, item: Record<string, unknown>) {
  const row = toSnake(item);
  const { error } = await supabase.from(table).upsert(row, { onConflict: 'id' });
  if (error) console.error(`DB upsert ${table}:`, error);
}

async function dbDelete(table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) console.error(`DB delete ${table}:`, error);
}

async function dbBulkInsert(table: string, items: Record<string, unknown>[]) {
  const rows = items.map(toSnake);
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
  if (error) console.error(`DB bulk insert ${table}:`, error);
}

export async function syncFromSupabase(): Promise<void> {
  if (!isBrowser()) return;

  try {
    const [tenants, apartments, payments, expenses, evictions, users, logs] = await Promise.all([
      dbFetch<Tenant>('tenants'),
      dbFetch<Apartment>('apartments'),
      dbFetch<Payment>('payments'),
      dbFetch<Expense>('expenses'),
      dbFetch<Eviction>('evictions'),
      dbFetch<User>('users'),
      dbFetch<AuditLog>('audit_log'),
    ]);

    if (apartments.length === 0) {
      await seedInitialData();
      return;
    }

    localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants));
    localStorage.setItem(APARTMENTS_KEY, JSON.stringify(apartments.map(a => ({
      ...a, notes: a.notes || '', flagged: a.flagged ?? false, flagReason: a.flagReason || '',
    }))));
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    localStorage.setItem(EVICTIONS_KEY, JSON.stringify(evictions));
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
    localStorage.setItem(SYNCED_KEY, 'true');
  } catch (err) {
    console.error('Sync from Supabase failed:', err);
  }
}

async function seedInitialData() {
  await dbBulkInsert('apartments', initialApartments as unknown as Record<string, unknown>[]);
  await dbBulkInsert('tenants', initialTenants as unknown as Record<string, unknown>[]);

  localStorage.setItem(APARTMENTS_KEY, JSON.stringify(initialApartments.map(a => ({
    ...a, notes: a.notes || '', flagged: a.flagged ?? false, flagReason: a.flagReason || '',
  }))));
  localStorage.setItem(TENANTS_KEY, JSON.stringify(initialTenants));
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify([]));
  localStorage.setItem(EXPENSES_KEY, JSON.stringify([]));
  localStorage.setItem(EVICTIONS_KEY, JSON.stringify([]));
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify([]));
  localStorage.setItem(SYNCED_KEY, 'true');
}

// ── Tenants ──

export function getTenants(): Tenant[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(TENANTS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function saveTenants(tenants: Tenant[]) {
  if (!isBrowser()) return;
  localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants));
  dbBulkInsert('tenants', tenants as unknown as Record<string, unknown>[]);
}

export function addTenant(tenant: Tenant) {
  const tenants = getTenants();
  tenants.push(tenant);
  localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants));
  dbUpsert('tenants', tenant as unknown as Record<string, unknown>);
  const apartments = getApartments();
  const apt = apartments.find(a => a.id === tenant.apartmentId);
  if (apt) {
    apt.status = 'occupied';
    apt.tenantId = tenant.id;
    apt.rentAmount = tenant.rentAmount;
    saveApartments(apartments);
  }
  logAction('create', 'tenant', tenant.id, `Added tenant: ${tenant.name}`);
}

export function updateTenant(updated: Tenant) {
  const tenants = getTenants();
  const idx = tenants.findIndex(t => t.id === updated.id);
  if (idx !== -1) {
    const oldAptId = tenants[idx].apartmentId;
    tenants[idx] = updated;
    localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants));
    dbUpsert('tenants', updated as unknown as Record<string, unknown>);
    if (oldAptId !== updated.apartmentId) {
      const apartments = getApartments();
      const oldApt = apartments.find(a => a.id === oldAptId);
      if (oldApt) {
        oldApt.status = 'vacant';
        oldApt.tenantId = null;
      }
      const newApt = apartments.find(a => a.id === updated.apartmentId);
      if (newApt) {
        newApt.status = 'occupied';
        newApt.tenantId = updated.id;
        newApt.rentAmount = updated.rentAmount;
      }
      saveApartments(apartments);
    }
    logAction('update', 'tenant', updated.id, `Updated tenant: ${updated.name}`);
  }
}

export function deleteTenant(id: string) {
  const tenants = getTenants();
  const tenant = tenants.find(t => t.id === id);
  if (tenant) {
    const apartments = getApartments();
    const apt = apartments.find(a => a.id === tenant.apartmentId);
    if (apt) {
      apt.status = 'vacant';
      apt.tenantId = null;
    }
    saveApartments(apartments);
    logAction('delete', 'tenant', id, `Deleted tenant: ${tenant.name}`);
  }
  localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants.filter(t => t.id !== id)));
  dbDelete('tenants', id);
}

// ── Payments ──

export function getPayments(): Payment[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(PAYMENTS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function savePayments(payments: Payment[]) {
  if (!isBrowser()) return;
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
}

export function addPayment(payment: Payment) {
  const payments = getPayments();
  payments.push(payment);
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  dbUpsert('payments', payment as unknown as Record<string, unknown>);
  logAction('create', 'payment', payment.id, `Payment recorded: ${payment.amount} KD for tenant ${payment.tenantId}`);
}

export function deletePayment(id: string) {
  const payments = getPayments();
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments.filter(p => p.id !== id)));
  dbDelete('payments', id);
  logAction('delete', 'payment', id, `Deleted payment: ${id}`);
}

// ── Apartments ──

export function getApartments(): Apartment[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(APARTMENTS_KEY);
  if (!data) return [];
  const parsed = JSON.parse(data) as Apartment[];
  return parsed.map(a => ({
    ...a, notes: a.notes || '', flagged: a.flagged ?? false, flagReason: a.flagReason || '',
  }));
}

export function saveApartments(apartments: Apartment[]) {
  if (!isBrowser()) return;
  localStorage.setItem(APARTMENTS_KEY, JSON.stringify(apartments));
  dbBulkInsert('apartments', apartments as unknown as Record<string, unknown>[]);
}

export function updateApartment(updated: Apartment) {
  const apartments = getApartments();
  const idx = apartments.findIndex(a => a.id === updated.id);
  if (idx !== -1) {
    apartments[idx] = updated;
    localStorage.setItem(APARTMENTS_KEY, JSON.stringify(apartments));
    dbUpsert('apartments', updated as unknown as Record<string, unknown>);
    logAction('update', 'apartment', updated.id, `Updated apartment: ${updated.number}`);
  }
}

export function addApartment(apt: Apartment) {
  const apartments = getApartments();
  apartments.push(apt);
  localStorage.setItem(APARTMENTS_KEY, JSON.stringify(apartments));
  dbUpsert('apartments', apt as unknown as Record<string, unknown>);
  logAction('create', 'apartment', apt.id, `Added apartment: ${apt.number} (${apt.floor})`);
}

export function deleteApartment(id: string) {
  const apartments = getApartments();
  const apt = apartments.find(a => a.id === id);
  if (apt && apt.status === 'occupied') return false;
  localStorage.setItem(APARTMENTS_KEY, JSON.stringify(apartments.filter(a => a.id !== id)));
  dbDelete('apartments', id);
  if (apt) logAction('delete', 'apartment', id, `Deleted apartment: ${apt.number}`);
  return true;
}

// ── Expenses ──

export function getExpenses(): Expense[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(EXPENSES_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function saveExpenses(expenses: Expense[]) {
  if (!isBrowser()) return;
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}

export function addExpense(expense: Expense) {
  const expenses = getExpenses();
  expenses.push(expense);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  dbUpsert('expenses', expense as unknown as Record<string, unknown>);
  logAction('create', 'expense', expense.id, `Added expense: ${expense.description} - ${expense.amount} KD`);
}

export function updateExpense(updated: Expense) {
  const expenses = getExpenses();
  const idx = expenses.findIndex(e => e.id === updated.id);
  if (idx !== -1) {
    expenses[idx] = updated;
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    dbUpsert('expenses', updated as unknown as Record<string, unknown>);
    logAction('update', 'expense', updated.id, `Updated expense: ${updated.description}`);
  }
}

export function deleteExpense(id: string) {
  const expenses = getExpenses();
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses.filter(e => e.id !== id)));
  dbDelete('expenses', id);
  logAction('delete', 'expense', id, `Deleted expense: ${id}`);
}

// ── Evictions ──

export function getEvictions(): Eviction[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(EVICTIONS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function saveEvictions(evictions: Eviction[]) {
  if (!isBrowser()) return;
  localStorage.setItem(EVICTIONS_KEY, JSON.stringify(evictions));
}

export function addEviction(eviction: Eviction) {
  const evictions = getEvictions();
  evictions.push(eviction);
  localStorage.setItem(EVICTIONS_KEY, JSON.stringify(evictions));
  dbUpsert('evictions', eviction as unknown as Record<string, unknown>);
  const apartments = getApartments();
  const apt = apartments.find(a => a.id === eviction.apartmentId);
  if (apt) {
    apt.status = 'vacant';
    apt.tenantId = null;
    saveApartments(apartments);
  }
  logAction('eviction', 'eviction', eviction.id, `Eviction: ${eviction.tenantName} from apt ${eviction.apartmentNumber}`);
}

// ── Audit Log ──

export function getAuditLog(): AuditLog[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(AUDIT_LOG_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function saveAuditLog(logs: AuditLog[]) {
  if (!isBrowser()) return;
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
}

export function logAction(
  action: AuditLog['action'],
  entityType: AuditLog['entityType'],
  entityId: string,
  details: string
) {
  const user = getCurrentUser();
  const entry: AuditLog = {
    id: generateId(),
    userId: user?.id || 'system',
    userName: user?.name || 'النظام',
    action,
    entityType,
    entityId,
    details,
    timestamp: new Date().toISOString(),
  };
  const logs = getAuditLog();
  logs.unshift(entry);
  if (logs.length > 500) logs.length = 500;
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
  dbUpsert('audit_log', entry as unknown as Record<string, unknown>);
}

export function clearAuditLog() {
  if (!isBrowser()) return;
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify([]));
  supabase.from('audit_log').delete().neq('id', '').then(() => {});
}

// ── Users ──

export function getUsers(): User[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(USERS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function saveUsers(users: User[]) {
  if (!isBrowser()) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function addUser(user: User) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  dbUpsert('users', user as unknown as Record<string, unknown>);
  logAction('create', 'user', user.id, `Added user: ${user.name}`);
}

export function deleteUser(id: string) {
  const users = getUsers();
  localStorage.setItem(USERS_KEY, JSON.stringify(users.filter(u => u.id !== id)));
  dbDelete('users', id);
  logAction('delete', 'user', id, `Deleted user: ${id}`);
}

export function loginUser(username: string, password: string): User | null {
  const users = getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  if (user) {
    if (isBrowser()) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
    logAction('login', 'system', user.id, `User logged in: ${user.name}`);
    return user;
  }
  return null;
}

export function logoutUser() {
  const user = getCurrentUser();
  if (user) {
    logAction('logout', 'system', user.id, `User logged out: ${user.name}`);
  }
  if (isBrowser()) {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function getCurrentUser(): User | null {
  if (!isBrowser()) return null;
  const data = localStorage.getItem(CURRENT_USER_KEY);
  if (!data) return null;
  return JSON.parse(data);
}
