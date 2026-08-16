'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuditLog, User } from '@/lib/types';
import { getAuditLog, clearAuditLog, getUsers, addUser, deleteUser, getCurrentUser, logoutUser, generateId, getTenants, getApartments, getPayments, getExpenses, getEvictions } from '@/lib/store';

type Section = 'general' | 'audit' | 'users' | 'data';

export default function SettingsView({ onLogout }: { onLogout: () => void }) {
  const [activeSection, setActiveSection] = useState<Section>('general');
  const [auditLog, setAuditLog] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');

  const reload = useCallback(() => {
    setAuditLog(getAuditLog());
    setUsers(getUsers());
    setCurrentUser(getCurrentUser());
  }, []);

  useEffect(() => {
    reload();
    const saved = localStorage.getItem('zamzam_theme');
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, [reload]);

  const handleThemeChange = (t: 'system' | 'light' | 'dark') => {
    setTheme(t);
    if (t === 'system') {
      localStorage.removeItem('zamzam_theme');
      document.documentElement.removeAttribute('data-theme');
    } else {
      localStorage.setItem('zamzam_theme', t);
      document.documentElement.setAttribute('data-theme', t);
    }
  };

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  const handleExportData = () => {
    const data = {
      tenants: getTenants(),
      apartments: getApartments(),
      payments: getPayments(),
      expenses: getExpenses(),
      evictions: getEvictions(),
      auditLog: getAuditLog(),
      users: getUsers(),
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zamzam-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.tenants) localStorage.setItem('zamzam_tenants', JSON.stringify(data.tenants));
          if (data.apartments) localStorage.setItem('zamzam_apartments', JSON.stringify(data.apartments));
          if (data.payments) localStorage.setItem('zamzam_payments', JSON.stringify(data.payments));
          if (data.expenses) localStorage.setItem('zamzam_expenses', JSON.stringify(data.expenses));
          if (data.evictions) localStorage.setItem('zamzam_evictions', JSON.stringify(data.evictions));
          if (data.users) localStorage.setItem('zamzam_users', JSON.stringify(data.users));
          alert('تم استيراد البيانات بنجاح. سيتم تحديث الصفحة.');
          window.location.reload();
        } catch {
          alert('خطأ في قراءة الملف');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const actionLabels: Record<string, string> = {
    create: 'إنشاء', update: 'تعديل', delete: 'حذف',
    login: 'دخول', logout: 'خروج', eviction: 'إخلاء',
  };

  const entityLabels: Record<string, string> = {
    tenant: 'مستأجر', apartment: 'شقة', payment: 'دفعة', expense: 'مصروف',
    contract: 'عقد', eviction: 'إخلاء', user: 'مستخدم', system: 'النظام',
  };

  const sectionTabs: { id: Section; label: string }[] = [
    { id: 'general', label: 'عام' },
    { id: 'audit', label: 'السجل' },
    { id: 'users', label: 'المستخدمين' },
    { id: 'data', label: 'البيانات' },
  ];

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
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          خروج
        </button>
      </div>

      {/* Section Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', background: 'var(--bg)', borderRadius: '10px', padding: '3px' }}>
        {sectionTabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveSection(tab.id)} style={{
            flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '12px',
            background: activeSection === tab.id ? 'var(--bg-card)' : 'transparent',
            color: activeSection === tab.id ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow: activeSection === tab.id ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* General Settings */}
      {activeSection === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Theme */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>المظهر</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'system' as const, label: 'تلقائي', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' },
                { id: 'light' as const, label: 'فاتح', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' },
                { id: 'dark' as const, label: 'داكن', icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' },
              ].map(t => (
                <button key={t.id} onClick={() => handleThemeChange(t.id)} style={{
                  flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                  border: theme === t.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: theme === t.id ? 'var(--primary-light)' : 'var(--bg)',
                  color: theme === t.id ? 'var(--primary)' : 'var(--text-muted)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  fontWeight: theme === t.id ? 600 : 400, fontSize: '11px',
                }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={t.icon} /></svg>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Building Info */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>معلومات العقار</div>
            <InfoRow label="اسم العقار" value="عمارة زمزم" />
            <InfoRow label="الشركة" value="شركة جوهرة السلمان العقارية" />
            <InfoRow label="السجل التجاري" value="479748" />
            <InfoRow label="الممثل" value="رضا محمد احمد السلمان" />
            <InfoRow label="المنطقة" value="حولي - قطعة 11 - شارع 179 - قسيمة 48" />
            <InfoRow label="عدد الشقق" value={`${getApartments().length} شقة`} />
          </div>

          {/* Quick Stats */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>إحصائيات سريعة</div>
            <InfoRow label="المستأجرين" value={`${getTenants().length}`} />
            <InfoRow label="الدفعات المسجلة" value={`${getPayments().length}`} />
            <InfoRow label="إجمالي الإيجارات" value={`${getTenants().reduce((s, t) => s + t.rentAmount, 0).toLocaleString()} د.ك`} />
          </div>

          {/* App Info */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>حول التطبيق</div>
            <InfoRow label="الإصدار" value="2.0" />
            <InfoRow label="النظام" value="نظام إدارة عمارة زمزم" />
          </div>
        </div>
      )}

      {/* Audit Log */}
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
            <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              {auditLog.slice(0, 50).map(log => (
                <div key={log.id} style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px' }}>
                        <span style={{
                          display: 'inline-block', padding: '1px 5px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, marginLeft: '4px',
                          background: log.action === 'delete' ? 'var(--danger-light)' : log.action === 'create' ? 'var(--success-light)' : 'var(--primary-light)',
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

      {/* Users */}
      {activeSection === 'users' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{users.length} مستخدم</span>
            <button onClick={() => setShowAddUser(true)} style={{
              background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}>+ إضافة</button>
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {users.map(u => (
              <div key={u.id} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: u.role === 'admin' ? 'var(--primary-light)' : 'var(--bg)',
                    color: u.role === 'admin' ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 700, fontSize: '13px',
                  }}>{u.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '13px' }}>{u.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                      {u.username} — <span style={{ color: u.role === 'admin' ? 'var(--primary)' : 'var(--text-muted)' }}>{u.role === 'admin' ? 'مدير' : 'مستخدم'}</span>
                    </div>
                  </div>
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

      {/* Data Management */}
      {activeSection === 'data' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>النسخ الاحتياطي</div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.6 }}>
              قم بتصدير جميع بيانات النظام إلى ملف JSON يمكنك حفظه واستيراده لاحقا.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleExportData} style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)',
                background: 'var(--bg)', color: 'var(--success)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                تصدير البيانات
              </button>
              <button onClick={handleImportData} style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)',
                background: 'var(--bg)', color: 'var(--primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                استيراد البيانات
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: 'var(--danger)' }}>منطقة الخطر</div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.6 }}>
              حذف جميع البيانات وإعادة التطبيق إلى الوضع الافتراضي. لا يمكن التراجع عن هذا الإجراء.
            </p>
            <button onClick={() => {
              if (confirm('هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع!')) {
                if (confirm('تأكيد أخير: سيتم حذف كل شيء!')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }
            }} style={{
              width: '100%', padding: '10px', borderRadius: '8px',
              border: '1px solid var(--danger)', background: 'var(--danger-light)',
              color: 'var(--danger)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}>
              حذف جميع البيانات
            </button>
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>حجم البيانات</div>
            <DataSizeInfo />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function DataSizeInfo() {
  const keys = ['zamzam_tenants', 'zamzam_apartments', 'zamzam_payments', 'zamzam_expenses', 'zamzam_evictions', 'zamzam_audit_log', 'zamzam_users'];
  const labels: Record<string, string> = {
    zamzam_tenants: 'المستأجرين',
    zamzam_apartments: 'الشقق',
    zamzam_payments: 'الدفعات',
    zamzam_expenses: 'المصروفات',
    zamzam_evictions: 'الإخلاءات',
    zamzam_audit_log: 'سجل النشاط',
    zamzam_users: 'المستخدمين',
  };

  let totalBytes = 0;
  const rows = keys.map(key => {
    const data = localStorage.getItem(key);
    const bytes = data ? new Blob([data]).size : 0;
    totalBytes += bytes;
    const count = data ? (JSON.parse(data) as unknown[]).length : 0;
    return { key, label: labels[key], bytes, count };
  });

  const fmt = (b: number) => b < 1024 ? `${b} B` : `${(b / 1024).toFixed(1)} KB`;

  return (
    <div>
      {rows.map(r => (
        <div key={r.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '11px' }}>
          <span style={{ color: 'var(--text-muted)' }}>{r.label} ({r.count})</span>
          <span style={{ fontWeight: 500 }}>{fmt(r.bytes)}</span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid var(--border)', marginTop: '6px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
        <span>الإجمالي</span>
        <span>{fmt(totalBytes)}</span>
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
