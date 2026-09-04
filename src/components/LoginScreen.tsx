'use client';

import { useState } from 'react';
import { User } from '@/lib/types';
import { getLang, t } from '@/lib/i18n';

export default function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const lang = getLang();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem('zamzam_current_user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.error || t('invalidCredentials', lang));
        setLoading(false);
      }
    } catch {
      setError(t('invalidCredentials', lang));
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #0f1923 0%, #1e3a5f 40%, #2d5a8e 70%, #1e3a5f 100%)',
      padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,1) 35px, rgba(255,255,255,1) 36px)`,
      }} />

      {/* Glow orbs */}
      <div style={{
        position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,162,39,0.15) 0%, transparent 70%)',
        top: '-80px', right: '-80px',
      }} />
      <div style={{
        position: 'absolute', width: '250px', height: '250px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(90,156,245,0.1) 0%, transparent 70%)',
        bottom: '-60px', left: '-60px',
      }} />

      {/* Logo section */}
      <div style={{
        textAlign: 'center', marginBottom: '32px', position: 'relative',
        animation: 'fadeInUp 0.6s ease-out',
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '20px', margin: '0 auto 16px',
          background: 'linear-gradient(135deg, rgba(201,162,39,0.2) 0%, rgba(201,162,39,0.05) 100%)',
          border: '1px solid rgba(201,162,39,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 9h.01M15 9h.01M9 13h.01M15 13h.01" />
          </svg>
        </div>
        <div style={{
          fontSize: '24px', fontWeight: 800, color: '#fff',
          letterSpacing: '-0.3px', lineHeight: 1.3,
        }}>شركة جوهرة السلمان</div>
        <div style={{
          fontSize: '14px', color: 'rgba(201,162,39,0.9)', marginTop: '4px',
          fontWeight: 600, letterSpacing: '0.5px',
        }}>العقارية</div>
        <div style={{
          fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '8px',
          letterSpacing: '1px', textTransform: 'uppercase',
        }}>نظام إدارة العقارات</div>
      </div>

      {/* Login card */}
      <div style={{
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderRadius: '24px', padding: '32px 24px',
        width: '100%', maxWidth: '380px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 24px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        animation: 'fadeInUp 0.6s ease-out 0.15s both',
        position: 'relative',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
              marginBottom: '6px', display: 'block',
            }}>{t('username', lang)}</label>
            <input
              style={{
                width: '100%', padding: '14px 16px', borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                direction: 'ltr',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="admin"
              autoComplete="username"
              onFocus={e => { e.target.style.borderColor = 'rgba(201,162,39,0.4)'; e.target.style.background = 'rgba(255,255,255,0.09)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
            />
          </div>
          <div>
            <label style={{
              fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
              marginBottom: '6px', display: 'block',
            }}>{t('password', lang)}</label>
            <input
              style={{
                width: '100%', padding: '14px 16px', borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                direction: 'ltr',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
              onFocus={e => { e.target.style.borderColor = 'rgba(201,162,39,0.4)'; e.target.style.background = 'rgba(255,255,255,0.09)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(248,81,73,0.12)', color: '#f85149',
              padding: '10px 14px', borderRadius: '12px', fontSize: '13px',
              textAlign: 'center', border: '1px solid rgba(248,81,73,0.2)',
              animation: 'scaleIn 0.2s ease-out',
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            padding: '14px', borderRadius: '14px', border: 'none',
            background: 'linear-gradient(135deg, #c9a227 0%, #dbb742 100%)',
            color: '#1a1a2e', fontSize: '15px', fontWeight: 700,
            cursor: loading ? 'wait' : 'pointer', marginTop: '4px',
            boxShadow: '0 4px 16px rgba(201,162,39,0.3)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            opacity: loading ? 0.7 : 1,
            letterSpacing: '0.3px',
          }}
          onMouseDown={e => { if (!loading) (e.target as HTMLElement).style.transform = 'scale(0.98)'; }}
          onMouseUp={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
          >
            {loading ? '...' : t('login', lang)}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '32px', textAlign: 'center',
        animation: 'fadeIn 0.8s ease-out 0.4s both',
      }}>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>
          سجل تجاري 479748
        </div>
      </div>
    </div>
  );
}
