'use client';

import { useState } from 'react';
import { loginUser } from '@/lib/store';
import { User } from '@/lib/types';

export default function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = loginUser(username, password);
    if (user) {
      onLogin(user);
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: '12px',
    border: '1px solid #d1d5db', background: '#fff',
    color: '#1a1a2e', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e3a5f 0%, #2a5298 50%, #1e3a5f 100%)',
      padding: '20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '24px', padding: '40px 28px',
        width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏢</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e3a5f' }}>عمارة زمزم</div>
          <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>Zamzam Building Management</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px', display: 'block' }}>اسم المستخدم / Username</label>
            <input
              style={{ ...inputStyle, direction: 'ltr' }}
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="admin"
              autoComplete="username"
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px', display: 'block' }}>كلمة المرور / Password</label>
            <input
              style={{ ...inputStyle, direction: 'ltr' }}
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{ background: '#fde8ea', color: '#dc3545', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" style={{
            padding: '14px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #1e3a5f, #2a5298)', color: '#fff',
            fontSize: '16px', fontWeight: 600, cursor: 'pointer', marginTop: '8px',
          }}>
            دخول / Login
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: '#aaa' }}>
          Zamzam Building Management System
        </div>
      </div>
    </div>
  );
}
