'use client';

import { useState, useEffect, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMsg {
  id: number;
  text: string;
  type: ToastType;
}

let toastId = 0;
let addToastFn: ((text: string, type?: ToastType) => void) | null = null;

export function showToast(text: string, type: ToastType = 'success') {
  addToastFn?.(text, type);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const addToast = useCallback((text: string, type: ToastType = 'success') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  if (toasts.length === 0) return null;

  const colors: Record<ToastType, { bg: string; border: string; color: string }> = {
    success: { bg: 'var(--success-light)', border: 'var(--success)', color: 'var(--success)' },
    error: { bg: 'var(--danger-light)', border: 'var(--danger)', color: 'var(--danger)' },
    info: { bg: 'var(--primary-light)', border: 'var(--primary)', color: 'var(--primary)' },
  };

  return (
    <div style={{ position: 'fixed', top: '16px', left: '16px', right: '16px', zIndex: 200, display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'none' }}>
      {toasts.map(toast => {
        const c = colors[toast.type];
        return (
          <div key={toast.id} style={{
            background: c.bg, border: `1px solid ${c.border}`, borderRadius: '10px',
            padding: '10px 16px', fontSize: '13px', fontWeight: 600, color: c.color,
            boxShadow: 'var(--shadow-lg)', pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', gap: '8px',
            animation: 'slideDown 0.3s ease-out',
          }}>
            {toast.type === 'success' && <span style={{ fontSize: '16px' }}>&#10003;</span>}
            {toast.type === 'error' && <span style={{ fontSize: '16px' }}>&#10007;</span>}
            {toast.type === 'info' && <span style={{ fontSize: '16px' }}>&#9432;</span>}
            {toast.text}
          </div>
        );
      })}
    </div>
  );
}
