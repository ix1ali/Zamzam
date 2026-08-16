'use client';

import { useState } from 'react';
import { loginUser } from '@/lib/store';
import { User } from '@/lib/types';
import { getLang, t } from '@/lib/i18n';

export default function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const lang = getLang();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = loginUser(username, password);
    if (user) {
      onLogin(user);
    } else {
      setError(t('invalidCredentials', lang));
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: '10px',
    border: '1px solid #d1d5db', background: '#fff',
    color: '#1a1a2e', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#1e3a5f', padding: '20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '32px 24px',
        width: '100%', maxWidth: '360px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e3a5f' }}>شركة جوهرة السلمان العقارية</div>
          <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>Jawhart Al-Salman Real Estate</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{t('buildingMgmt', lang)}</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '4px', display: 'block' }}>{t('username', lang)}</label>
            <input
              style={{ ...inputStyle, direction: 'ltr' }}
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="admin"
              autoComplete="username"
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '4px', display: 'block' }}>{t('password', lang)}</label>
            <input
              style={{ ...inputStyle, direction: 'ltr' }}
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{ background: '#fde8ea', color: '#dc3545', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" style={{
            padding: '12px', borderRadius: '10px', border: 'none',
            background: '#1e3a5f', color: '#fff',
            fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginTop: '4px',
          }}>
            {t('login', lang)}
          </button>
        </form>
      </div>
    </div>
  );
}
