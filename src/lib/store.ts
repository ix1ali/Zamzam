import { Tenant, Payment, Apartment, Expense, Eviction, AuditLog, User } from './types';
import { initialTenants, initialApartments } from './data';

const TENANTS_KEY = 'zamzam_tenants';
const PAYMENTS_KEY = 'zamzam_payments';
const APARTMENTS_KEY = 'zamzam_apartments';
const EXPENSES_KEY = 'zamzam_expenses';
const EVICTIONS_KEY = 'zamzam_evictions';
const AUDIT_LOG_KEY = 'zamzam_audit_log';
const USERS_KEY = 'zamzam_users';
const CURRENT_USER_KEY = 'zamzam_current_user';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ── Tenants ──

export function getTenants(): Tenant[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(TENANTS_KEY);
  if (!data) {
    localStorage.setItem(TENANTS_KEY, JSON.stringify(initialTenants));
    return initialTenants;
  }
  return JSON.parse(data);
}

export function saveTenants(tenants: Tenant[]) {
  if (!isBrowser()) return;
  localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants));
}

export function addTenant(tenant: Tenant) {
  const tenants = getTenants();
  tenants.push(tenant);
  saveTenants(tenants);
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
    saveTenants(tenants);
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
  saveTenants(tenants.filter(t => t.id !== id));
}

// ── Payments ──

export function getPayments(): Payment[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(PAYMENTS_KEY);
  if (!data) {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify([]));
    return [];
  }
  return JSON.parse(data);
}

export function savePayments(payments: Payment[]) {
  if (!isBrowser()) return;
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
}

export function addPayment(payment: Payment) {
  const payments = getPayments();
  payments.push(payment);
  savePayments(payments);
  logAction('create', 'payment', payment.id, `Payment recorded: ${payment.amount} KD for tenant ${payment.tenantId}`);
}

export function deletePayment(id: string) {
  const payments = getPayments();
  savePayments(payments.filter(p => p.id !== id));
  logAction('delete', 'payment', id, `Deleted payment: ${id}`);
}

// ── Apartments ──

export function getApartments(): Apartment[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(APARTMENTS_KEY);
  if (!data) {
    const withDefaults = initialApartments.map(a => ({
      ...a,
      notes: a.notes || '',
      flagged: a.flagged || false,
      flagReason: a.flagReason || '',
    }));
    localStorage.setItem(APARTMENTS_KEY, JSON.stringify(withDefaults));
    return withDefaults;
  }
  const parsed = JSON.parse(data) as Apartment[];
  return parsed.map(a => ({
    ...a,
    notes: a.notes || '',
    flagged: a.flagged ?? false,
    flagReason: a.flagReason || '',
  }));
}

export function saveApartments(apartments: Apartment[]) {
  if (!isBrowser()) return;
  localStorage.setItem(APARTMENTS_KEY, JSON.stringify(apartments));
}

export function updateApartment(updated: Apartment) {
  const apartments = getApartments();
  const idx = apartments.findIndex(a => a.id === updated.id);
  if (idx !== -1) {
    apartments[idx] = updated;
    saveApartments(apartments);
    logAction('update', 'apartment', updated.id, `Updated apartment: ${updated.number}`);
  }
}

export function addApartment(apt: Apartment) {
  const apartments = getApartments();
  apartments.push(apt);
  saveApartments(apartments);
  logAction('create', 'apartment', apt.id, `Added apartment: ${apt.number} (${apt.floor})`);
}

export function deleteApartment(id: string) {
  const apartments = getApartments();
  const apt = apartments.find(a => a.id === id);
  if (apt && apt.status === 'occupied') return false;
  saveApartments(apartments.filter(a => a.id !== id));
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
  saveExpenses(expenses);
  logAction('create', 'expense', expense.id, `Added expense: ${expense.description} - ${expense.amount} KD`);
}

export function updateExpense(updated: Expense) {
  const expenses = getExpenses();
  const idx = expenses.findIndex(e => e.id === updated.id);
  if (idx !== -1) {
    expenses[idx] = updated;
    saveExpenses(expenses);
    logAction('update', 'expense', updated.id, `Updated expense: ${updated.description}`);
  }
}

export function deleteExpense(id: string) {
  const expenses = getExpenses();
  saveExpenses(expenses.filter(e => e.id !== id));
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
  saveEvictions(evictions);
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
  saveAuditLog(logs);
}

export function clearAuditLog() {
  if (!isBrowser()) return;
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify([]));
}

// ── Users ──

export function getUsers(): User[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(USERS_KEY);
  if (!data) {
    const defaultAdmin: User = {
      id: 'admin1',
      username: 'admin',
      password: 'admin123',
      name: 'مدير النظام',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
    return [defaultAdmin];
  }
  return JSON.parse(data);
}

export function saveUsers(users: User[]) {
  if (!isBrowser()) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function addUser(user: User) {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
  logAction('create', 'user', user.id, `Added user: ${user.name}`);
}

export function deleteUser(id: string) {
  const users = getUsers();
  saveUsers(users.filter(u => u.id !== id));
  logAction('delete', 'user', id, `Deleted user: ${id}`);
}

export function loginUser(username: string, password: string): User | null {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
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
