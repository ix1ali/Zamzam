import { Tenant, Payment, Apartment } from './types';
import { initialTenants, initialApartments } from './data';

const TENANTS_KEY = 'zamzam_tenants';
const PAYMENTS_KEY = 'zamzam_payments';
const APARTMENTS_KEY = 'zamzam_apartments';

function isBrowser() {
  return typeof window !== 'undefined';
}

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
  }
  saveTenants(tenants.filter(t => t.id !== id));
}

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
}

export function getApartments(): Apartment[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(APARTMENTS_KEY);
  if (!data) {
    localStorage.setItem(APARTMENTS_KEY, JSON.stringify(initialApartments));
    return initialApartments;
  }
  return JSON.parse(data);
}

export function saveApartments(apartments: Apartment[]) {
  if (!isBrowser()) return;
  localStorage.setItem(APARTMENTS_KEY, JSON.stringify(apartments));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
