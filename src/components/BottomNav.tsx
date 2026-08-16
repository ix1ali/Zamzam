'use client';

import { TabId } from '@/lib/types';
import { getLang, t } from '@/lib/i18n';

const tabs: { id: TabId; labelKey: string; icon: string }[] = [
  { id: 'dashboard', labelKey: 'navHome', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'apartments', labelKey: 'navApartments', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'financial', labelKey: 'navFinancial', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { id: 'settings', labelKey: 'navSettings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export default function BottomNav({ active, onChange }: { active: TabId; onChange: (tab: TabId) => void }) {
  const lang = getLang();
  return (
    <nav className="no-print" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--bg-nav)', borderTop: '1px solid var(--border)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'stretch',
      zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '2px',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 4px 10px',
              flex: 1,
              position: 'relative',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'color 0.2s',
            }}
          >
            {isActive && (
              <div style={{
                position: 'absolute', top: 0, left: '25%', right: '25%',
                height: '2.5px', borderRadius: '0 0 2px 2px',
                background: 'var(--primary)',
              }} />
            )}
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={isActive ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d={tab.icon} />
            </svg>
            <span style={{ fontSize: '10px', fontWeight: isActive ? 700 : 400, lineHeight: 1 }}>{t(tab.labelKey, lang)}</span>
          </button>
        );
      })}
    </nav>
  );
}
