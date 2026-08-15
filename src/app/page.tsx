'use client';

import { useState, useEffect } from 'react';
import { TabId, User } from '@/lib/types';
import { getCurrentUser } from '@/lib/store';
import BottomNav from '@/components/BottomNav';
import Dashboard from '@/components/Dashboard';
import TenantsView from '@/components/TenantsView';
import ApartmentsView from '@/components/ApartmentsView';
import PaymentsView from '@/components/PaymentsView';
import ContractsView from '@/components/ContractsView';
import FinancialView from '@/components/FinancialView';
import SettingsView from '@/components/SettingsView';
import LoginScreen from '@/components/LoginScreen';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
    const saved = getCurrentUser();
    if (saved) setUser(saved);
  }, []);

  if (!mounted) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100dvh', background: 'var(--bg)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏢</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>عمارة زمزم</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Zamzam Building</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={(u) => setUser(u)} />;
  }

  return (
    <>
      <main style={{ flex: 1, paddingBottom: '72px' }}>
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'tenants' && <TenantsView />}
        {activeTab === 'apartments' && <ApartmentsView />}
        {activeTab === 'payments' && <PaymentsView />}
        {activeTab === 'contracts' && <ContractsView />}
        {activeTab === 'financial' && <FinancialView />}
        {activeTab === 'settings' && <SettingsView onLogout={() => setUser(null)} />}
      </main>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </>
  );
}
