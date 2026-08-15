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
}

export type TabId = 'dashboard' | 'tenants' | 'apartments' | 'payments' | 'contracts';
