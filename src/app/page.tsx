'use client';

import { useState, useEffect } from 'react';
import { TabId, User } from '@/lib/types';
import { getCurrentUser } from '@/lib/store';
import { getLang, applyLangDir } from '@/lib/i18n';
import BottomNav from '@/components/BottomNav';
import Dashboard from '@/components/Dashboard';
import ApartmentsView from '@/components/ApartmentsView';
import FinancialView from '@/components/FinancialView';
import SettingsView from '@/components/SettingsView';
import LoginScreen from '@/components/LoginScreen';
import ToastContainer from '@/components/Toast';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
    const saved = getCurrentUser();
    if (saved) setUser(saved);
    const theme = localStorage.getItem('zamzam_theme');
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    applyLangDir(getLang());
  }, []);

  if (!mounted) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100dvh', background: 'var(--bg)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏢</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>شركة جوهرة السلمان العقارية</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Jawhart Al-Salman Real Estate</div>
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
        {activeTab === 'apartments' && <ApartmentsView />}
        {activeTab === 'financial' && <FinancialView />}
        {activeTab === 'settings' && <SettingsView onLogout={() => setUser(null)} />}
      </main>
      <BottomNav active={activeTab} onChange={setActiveTab} />
      <ToastContainer />
    </>
  );
}
