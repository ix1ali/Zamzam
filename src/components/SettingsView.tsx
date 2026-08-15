'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuditLog, User } from '@/lib/types';
import { getAuditLog, clearAuditLog, getUsers, addUser, deleteUser, getCurrentUser, logoutUser, generateId } from '@/lib/store';

export default function SettingsView({ onLogout }: { onLogout: () => void }) {
  const [activeSection, setActiveSection] = useState<'audit' | 'users'>('audit');
  const [auditLog, setAuditLog] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);

  const reload = useCallback(() => {
    setAuditLog(getAuditLog());
    setUsers(getUsers());
    setCurrentUser(getCurrentUser());
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  const actionLabels: Record<string, string> = {
    create: 'إنشاء', update: 'تعديل', delete: 'حذف',
    login: 'دخول', logout: 'خروج', eviction: 'إخلاء',
  };

  const entityLabels: Record<string, string> = {
    tenant: 'مستأجر', apartment: 'شقة', payment: 'دفعة', expense: 'مصروف',
    contract: 'عقد', eviction: 'إخلاء', user: 'مستخدم', system: 'النظام',
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>الإعدادات</h1>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{currentUser?.name || ''}</div>
        </div>
        <button onClick={handleLogout} style={{
          background: 'var(--bg-card)', color: 'var(--danger)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
        }}>خروج</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
        <button onClick={() => setActiveSection('audit')} style={{
          flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer',
          fontWeight: 600, fontSize: '13px',
          background: activeSection === 'audit' ? 'var(--primary)' : 'var(--bg-card)',
          color: activeSection === 'audit' ? '#fff' : 'var(--text)',
        }}>سجل النشاط</button>
        <button onClick={() => setActiveSection('users')} style={{
          flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer',
          fontWeight: 600, fontSize: '13px',
          background: activeSection === 'users' ? 'var(--primary)' : 'var(--bg-card)',
          color: activeSection === 'users' ? '#fff' : 'var(--text)',
        }}>المستخدمين</button>
      </div>

      {activeSection === 'audit' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{auditLog.length} سجل</span>
            {auditLog.length > 0 && (
              <button onClick={() => { if (confirm('مسح سجل النشاط؟')) { clearAuditLog(); reload(); } }} style={{
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px',
                padding: '5px 10px', fontSize: '11px', color: 'var(--danger)', cursor: 'pointer',
              }}>مسح الكل</button>
            )}
          </div>

          {auditLog.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>لا توجد سجلات</div>
          ) : (
            <div style={{ background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              {auditLog.slice(0, 50).map(log => (
                <div key={log.id} style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px' }}>
                        <span style={{
                          display: 'inline-block', padding: '1px 5px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, marginLeft: '4px',
                          background: log.action === 'delete' ? 'var(--danger-light)' : log.action === 'create' ? 'var(--success-light, #e6f7f1)' : 'var(--primary-light)',
                          color: log.action === 'delete' ? 'var(--danger)' : log.action === 'create' ? 'var(--success)' : 'var(--primary)',
                        }}>{actionLabels[log.action] || log.action}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{entityLabels[log.entityType] || log.entityType}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{log.details}</div>
                    </div>
                    <div style={{ textAlign: 'left', fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      <div>{new Date(log.timestamp).toLocaleDateString('ar-KW')}</div>
                      <div>{new Date(log.timestamp).toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeSection === 'users' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{users.length} مستخدم</span>
            <button onClick={() => setShowAddUser(true)} style={{
              background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}>+ إضافة</button>
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {users.map(u => (
              <div key={u.id} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '13px' }}>{u.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{u.username} — {u.role === 'admin' ? 'مدير' : 'مستخدم'}</div>
                </div>
                {u.id !== currentUser?.id && u.id !== 'admin1' && (
                  <button onClick={() => { if (confirm(`حذف المستخدم ${u.name}؟`)) { deleteUser(u.id); reload(); } }} style={{
                    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px',
                    padding: '4px 8px', fontSize: '11px', color: 'var(--danger)', cursor: 'pointer',
                  }}>حذف</button>
                )}
              </div>
            ))}
          </div>

          {showAddUser && (
            <AddUserForm
              onSave={(u) => { addUser(u); setShowAddUser(false); reload(); }}
              onCancel={() => setShowAddUser(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

function AddUserForm({ onSave, onCancel }: { onSave: (u: User) => void; onCancel: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: generateId(), username, password, name, role,
      createdAt: new Date().toISOString(),
    });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-card)', borderRadius: '16px 16px 0 0', width: '100%',
        maxWidth: '500px', padding: '20px',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px' }}>إضافة مستخدم</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} required placeholder="الاسم الكامل" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input style={{ ...inputStyle, direction: 'ltr' }} value={username} onChange={e => setUsername(e.target.value)} required placeholder="اسم المستخدم" />
            <input style={{ ...inputStyle, direction: 'ltr' }} type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="كلمة المرور" />
          </div>
          <select style={inputStyle} value={role} onChange={e => setRole(e.target.value as 'admin' | 'user')}>
            <option value="user">مستخدم</option>
            <option value="admin">مدير</option>
          </select>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button type="submit" style={{
              flex: 1, padding: '11px', borderRadius: '8px', border: 'none',
              background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}>إضافة</button>
            <button type="button" onClick={onCancel} style={{
              padding: '11px 20px', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', cursor: 'pointer',
            }}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}
