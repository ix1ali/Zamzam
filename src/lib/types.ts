export interface Tenant {
  id: string;
  name: string;
  civilId: string;
  nationality: string;
  profession: string;
  phone: string;
  apartmentId: string;
  floor: string;
  rentAmount: number;
  leaseStart: string;
  leaseEnd: string;
  leaseDuration: string;
  paymentMethod: string;
  registrationDate: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  amount: number;
  month: string;
  year: number;
  date: string;
  method: string;
  notes: string;
}

export interface Apartment {
  id: string;
  number: string;
  floor: string;
  status: 'occupied' | 'vacant';
  tenantId: string | null;
  rentAmount: number;
  notes: string;
  flagged: boolean;
  flagReason: string;
}

export interface Expense {
  id: string;
  type: 'general' | 'electricity' | 'salary';
  description: string;
  amount: number;
  month: string;
  year: number;
  date: string;
  notes: string;
}

export interface Eviction {
  id: string;
  tenantId: string;
  tenantName: string;
  apartmentId: string;
  apartmentNumber: string;
  floor: string;
  reason: string;
  date: string;
  notes: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'eviction';
  entityType: 'tenant' | 'apartment' | 'payment' | 'expense' | 'contract' | 'eviction' | 'user' | 'system';
  entityId: string;
  details: string;
  timestamp: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'user' | 'guard';
  createdAt: string;
}

export type TabId = 'dashboard' | 'apartments' | 'financial' | 'settings';
