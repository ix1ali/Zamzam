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
    create: 'إنشاء',
    update: 'تعديل',
    delete: 'حذف',
    login: 'دخول',
    logout: 'خروج',
    eviction: 'إخلاء',
  };

  const entityLabels: Record<string, string> = {
    tenant: 'مستأجر',
    apartment: 'شقة',
    payment: 'دفعة',
    expense: 'مصروف',
    contract: 'عقد',
    eviction: 'إخلاء',
    user: 'مستخدم',
    system: 'النظام',
  };

  return (
    <div style={{ padding: '0' }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2a5298 100%)',
        padding: '20px 20px 24px', color: '#fff', borderRadius: '0 0 20px 20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>الإعدادات / Settings</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>{currentUser?.name || ''}</div>
          </div>
          <button onClick={handleLogout} style={{
            background: 'rgba(220,53,69,0.3)', color: '#fff', border: '1px solid rgba(220,53,69,0.5)',
            borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          }}>
            خروج / Logout
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setActiveSection('audit')} style={{
            flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
            background: activeSection === 'audit' ? '#fff' : 'rgba(255,255,255,0.15)',
            color: activeSection === 'audit' ? '#1e3a5f' : '#fff',
          }}>سجل النشاط</button>
          <button onClick={() => setActiveSection('users')} style={{
            flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
            background: activeSection === 'users' ? '#fff' : 'rgba(255,255,255,0.15)',
            color: activeSection === 'users' ? '#1e3a5f' : '#fff',
          }}>المستخدمين</button>
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {activeSection === 'audit' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>سجل النشاط / Activity Log ({auditLog.length})</span>
              {auditLog.length > 0 && (
                <button onClick={() => { if (confirm('مسح سجل النشاط؟')) { clearAuditLog(); reload(); } }} style={{
                  background: 'var(--danger-light)', border: 'none', borderRadius: '8px',
                  padding: '6px 12px', fontSize: '12px', color: 'var(--danger)', cursor: 'pointer', fontWeight: 600,
                }}>مسح الكل</button>
              )}
            </div>

            {auditLog.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
                <div>لا توجد سجلات</div>
              </div>
            ) : (
              <div style={{
                background: 'var(--bg-card)', borderRadius: 'var(--radius)', overflow: 'hidden',
                boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
              }}>
                {auditLog.slice(0, 50).map(log => (
                  <div key={log.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500 }}>
                          <span style={{
                            display: 'inline-block', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, marginLeft: '6px',
                            background: log.action === 'delete' ? 'var(--danger-light)' : log.action === 'create' ? 'var(--success-light, #e6f7f1)' : 'var(--primary-light)',
                            color: log.action === 'delete' ? 'var(--danger)' : log.action === 'create' ? 'var(--success)' : 'var(--primary)',
                          }}>{actionLabels[log.action] || log.action}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{entityLabels[log.entityType] || log.entityType}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{log.details}</div>
                      </div>
                      <div style={{ textAlign: 'left', fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginRight: '8px' }}>
                        <div>{new Date(log.timestamp).toLocaleDateString('ar-KW')}</div>
                        <div>{new Date(log.timestamp).toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' })}</div>
                        <div style={{ fontSize: '9px' }}>{log.userName}</div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>المستخدمين / Users ({users.length})</span>
              <button onClick={() => setShowAddUser(true)} style={{
                background: 'var(--primary-light)', border: 'none', borderRadius: '8px',
                padding: '6px 12px', fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600,
              }}>+ إضافة مستخدم</button>
            </div>

            <div style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius)', overflow: 'hidden',
              boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
            }}>
              {users.map(u => (
                <div key={u.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '14px' }}>{u.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {u.username} - {u.role === 'admin' ? 'مدير' : 'مستخدم'}
                    </div>
                  </div>
                  {u.id !== currentUser?.id && u.id !== 'admin1' && (
                    <button onClick={() => { if (confirm(`حذف المستخدم ${u.name}؟`)) { deleteUser(u.id); reload(); } }} style={{
                      background: 'var(--danger-light)', border: 'none', borderRadius: '6px',
                      padding: '4px 10px', fontSize: '11px', color: 'var(--danger)', cursor: 'pointer',
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
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-card)', borderRadius: '24px 24px 0 0', width: '100%',
        maxWidth: '500px', padding: '24px 20px',
      }}>
        <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px' }}>إضافة مستخدم / Add User</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>الاسم / Name *</label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} required placeholder="الاسم الكامل" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>اسم المستخدم *</label>
              <input style={{ ...inputStyle, direction: 'ltr' }} value={username} onChange={e => setUsername(e.target.value)} required placeholder="username" />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>كلمة المرور *</label>
              <input style={{ ...inputStyle, direction: 'ltr' }} type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="password" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>الصلاحية / Role</label>
            <select style={inputStyle} value={role} onChange={e => setRole(e.target.value as 'admin' | 'user')}>
              <option value="user">مستخدم / User</option>
              <option value="admin">مدير / Admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" style={{
              flex: 1, padding: '13px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #1e3a5f, #2a5298)', color: '#fff',
              fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            }}>إضافة / Add</button>
            <button type="button" onClick={onCancel} style={{
              padding: '13px 24px', borderRadius: '12px', border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text)', fontSize: '15px', cursor: 'pointer',
            }}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}
