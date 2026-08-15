'use client';

import { TabId } from '@/lib/types';

const tabs: { id: TabId; label: string; labelEn: string; icon: string }[] = [
  { id: 'dashboard', label: 'الرئيسية', labelEn: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'tenants', label: 'المستأجرين', labelEn: 'Tenants', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
  { id: 'apartments', label: 'الشقق', labelEn: 'Units', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'payments', label: 'الدفعات', labelEn: 'Payments', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'contracts', label: 'العقود', labelEn: 'Contracts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];

export default function BottomNav({ active, onChange }: { active: TabId; onChange: (tab: TabId) => void }) {
  return (
    <nav className="no-print" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--bg-nav)', borderTop: '1px solid var(--border)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '4px 0 env(safe-area-inset-bottom, 6px)',
      zIndex: 50, boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px 10px', borderRadius: '12px',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'all 0.2s',
              ...(isActive ? { background: 'var(--primary-light)' } : {}),
            }}
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={isActive ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d={tab.icon} />
            </svg>
            <span style={{ fontSize: '9px', fontWeight: isActive ? 700 : 400, lineHeight: 1.2 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
