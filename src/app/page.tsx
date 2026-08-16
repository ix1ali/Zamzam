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
        minHeight: '100dvh',
        background: 'linear-gradient(160deg, #0f1923 0%, #1e3a5f 40%, #2d5a8e 70%, #1e3a5f 100%)',
      }}>
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 16px',
            background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
            </svg>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>شركة جوهرة السلمان العقارية</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '6px', letterSpacing: '1px' }}>نظام إدارة العقارات</div>
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
