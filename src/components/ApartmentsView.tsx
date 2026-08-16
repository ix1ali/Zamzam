'use client';

import { useState, useEffect, useCallback } from 'react';
import { Apartment, Tenant, Eviction } from '@/lib/types';
import { getApartments, getTenants, updateApartment, deleteTenant, addTenant, updateTenant, addEviction, addApartment, deleteApartment, generateId } from '@/lib/store';
import { printContract, printEvictionNotice, printReceipt } from '@/lib/pdf';
import { floors } from '@/lib/data';
import { getLang, t } from '@/lib/i18n';
import TenantForm from './TenantForm';

type SubTab = 'apartments' | 'tenants';

export default function ApartmentsView() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [subTab, setSubTab] = useState<SubTab>('apartments');
  const [openFloors, setOpenFloors] = useState<Set<string>>(new Set());
  const [editingApt, setEditingApt] = useState<Apartment | null>(null);
  const [showAddApt, setShowAddApt] = useState(false);
  const [search, setSearch] = useState('');
  const lang = getLang();

  const reload = useCallback(() => {
    setApartments(getApartments());
    setTenants(getTenants());
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const occupied = apartments.filter(a => a.status === 'occupied').length;
  const vacant = apartments.filter(a => a.status === 'vacant').length;
  const flaggedCount = apartments.filter(a => a.flagged).length;

  const toggleFloor = (key: string) => {
    const s = new Set(openFloors);
    s.has(key) ? s.delete(key) : s.add(key);
    setOpenFloors(s);
  };

  const filteredApartments = search.trim()
    ? apartments.filter(a => {
        const tenant = tenants.find(tt => tt.id === a.tenantId);
        const q = search.toLowerCase();
        return a.number.toLowerCase().includes(q)
          || a.floor.includes(search)
          || (tenant && (tenant.name.includes(search) || tenant.phone.includes(q) || tenant.civilId.includes(q)));
      })
    : apartments;

  const floorGroups = floors.map(f => ({
    ...f,
    apartments: filteredApartments.filter(a => a.floor === f.key),
  })).filter(f => f.apartments.length > 0);

  const subTabs: { id: SubTab; label: string }[] = [
    { id: 'apartments', label: t('apartments', lang) },
    { id: 'tenants', label: t('tenantsTab', lang) },
  ];

  return (
    <div style={{ padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{t('navApartments', lang)}</h1>
        {subTab === 'apartments' && (
          <button onClick={() => setShowAddApt(true)} style={{
            background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px',
            padding: '7px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            {t('apt', lang)}
          </button>
        )}
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', background: 'var(--bg)', borderRadius: '10px', padding: '3px' }}>
        {subTabs.map(tab => (
          <button key={tab.id} onClick={() => setSubTab(tab.id)} style={{
            flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '13px',
            background: subTab === tab.id ? 'var(--bg-card)' : 'transparent',
            color: subTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow: subTab === tab.id ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s',
          }}>{tab.label}</button>
        ))}
      </div>

      {subTab === 'apartments' && (
        <>
          {/* Search */}
          <input
            placeholder={t('tenantSearch', lang)}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: '8px',
              border: '1px solid var(--border)', background: 'var(--bg-card)',
              color: 'var(--text)', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
              marginBottom: '10px',
            }}
          />

          {/* Legend */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <LegendItem color="var(--success)" label={t('occupied', lang)} count={occupied} />
            <LegendItem color="#8b5cf6" label={t('vacant', lang)} count={vacant} />
            <LegendItem color="var(--danger)" label={t('flagged', lang)} count={flaggedCount} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginInlineStart: 'auto' }}>
              {apartments.length} {t('apt', lang)}
            </span>
          </div>

          {/* Floors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[...floorGroups].reverse().map(floor => {
              const isOpen = openFloors.has(floor.key);
              const floorVacant = floor.apartments.filter(a => a.status === 'vacant').length;
              const floorFlagged = floor.apartments.filter(a => a.flagged).length;
              const floorOccupied = floor.apartments.filter(a => a.status === 'occupied').length;
              const pct = floor.apartments.length > 0 ? (floorOccupied / floor.apartments.length) * 100 : 0;

              let borderColor = 'var(--border)';
              if (floorFlagged > 0) borderColor = 'var(--danger)';
              else if (floorVacant > 0) borderColor = '#8b5cf6';
              else borderColor = 'var(--success)';

              return (
                <div key={floor.key} style={{
                  background: 'var(--bg-card)', borderRadius: '12px',
                  border: '1px solid var(--border)', overflow: 'hidden',
                  borderInlineStart: `3px solid ${borderColor}`,
                }}>
                  <div onClick={() => toggleFloor(floor.key)} style={{
                    padding: '10px 14px', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{floor.label}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>
                        {floor.apartments.length} {t('apt', lang)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {floorFlagged > 0 && (
                        <span style={{ color: 'var(--danger)', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                          {floorFlagged}
                        </span>
                      )}
                      {floorVacant > 0 && (
                        <span style={{ color: '#8b5cf6', fontSize: '11px', fontWeight: 600 }}>{floorVacant} {t('vacant', lang)}</span>
                      )}
                      <div style={{ width: '40px', height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, borderRadius: '3px', background: pct === 100 ? 'var(--success)' : '#8b5cf6' }} />
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{ padding: '8px 12px 12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                      {floor.apartments.map(apt => {
                        const tenant = tenants.find(tt => tt.id === apt.tenantId);
                        const isVacant = apt.status === 'vacant';
                        const isFlagged = apt.flagged;

                        let bgColor = 'var(--bg)';
                        let borderClr = 'var(--success)';
                        let numColor = 'var(--text)';

                        if (isFlagged) {
                          bgColor = 'var(--danger-light)'; borderClr = 'var(--danger)'; numColor = 'var(--danger)';
                        } else if (isVacant) {
                          bgColor = 'rgba(139,92,246,0.1)'; borderClr = '#8b5cf6'; numColor = '#8b5cf6';
                        }

                        return (
                          <div key={apt.id} onClick={() => setEditingApt(apt)} style={{
                            borderRadius: '10px', padding: '10px', textAlign: 'center', cursor: 'pointer',
                            border: `1.5px solid ${borderClr}`, background: bgColor, position: 'relative',
                          }}>
                            {isFlagged && (
                              <span style={{ position: 'absolute', top: '4px', insetInlineStart: '6px' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--danger)" stroke="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><text x="12" y="17" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">!</text></svg>
                              </span>
                            )}
                            <div style={{ fontWeight: 700, fontSize: '18px', color: numColor }}>{apt.number}</div>
                            {tenant ? (
                              <div style={{ fontSize: '9px', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-muted)' }}>
                                {tenant.name.split(' ').slice(0, 2).join(' ')}
                              </div>
                            ) : (
                              <div style={{ fontSize: '10px', color: '#8b5cf6', fontWeight: 600, marginTop: '3px' }}>{t('vacant', lang)}</div>
                            )}
                            {tenant && (
                              <div style={{ fontSize: '9px', color: 'var(--success)', marginTop: '2px', fontWeight: 600 }}>{apt.rentAmount} {t('kwd', lang)}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {subTab === 'tenants' && (
        <TenantsSection tenants={tenants} apartments={apartments} lang={lang} reload={reload} />
      )}

      {editingApt && (
        <ApartmentDetail
          apartment={editingApt}
          tenant={tenants.find(tt => tt.id === editingApt.tenantId) || null}
          lang={lang}
          onSave={(updated) => { updateApartment(updated); setEditingApt(null); reload(); }}
          onEvict={(apt, tenant) => {
            addEviction({
              id: generateId(), tenantId: tenant.id, tenantName: tenant.name,
              apartmentId: apt.id, apartmentNumber: apt.number, floor: apt.floor,
              reason: t('evict', lang), date: new Date().toISOString().split('T')[0], notes: '',
            });
            deleteTenant(tenant.id);
            setEditingApt(null);
            reload();
          }}
          onDeleteTenant={(apt, tenant) => {
            deleteTenant(tenant.id);
            setEditingApt(null);
            reload();
          }}
          onDeleteApt={(apt) => {
            const ok = deleteApartment(apt.id);
            if (!ok) { alert(t('cantDeleteOccupied', lang)); return; }
            setEditingApt(null);
            reload();
          }}
          onClose={() => setEditingApt(null)}
        />
      )}

      {showAddApt && (
        <AddApartmentForm
          lang={lang}
          onSave={(apt) => { addApartment(apt); setShowAddApt(false); reload(); }}
          onCancel={() => setShowAddApt(false)}
        />
      )}
    </div>
  );
}

/* ── Tenants Section (embedded) ── */
function TenantsSection({ tenants, apartments, lang, reload }: {
  tenants: Tenant[]; apartments: Apartment[]; lang: import('@/lib/i18n').Lang; reload: () => void;
}) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [evictingTenant, setEvictingTenant] = useState<Tenant | null>(null);

  const filtered = tenants.filter(tt =>
    tt.name.includes(search) || tt.phone.includes(search) || tt.civilId.includes(search) ||
    tt.nationality.includes(search) || tt.floor.includes(search)
  );

  const handleSave = (tenant: Tenant) => {
    if (editing) updateTenant(tenant); else addTenant(tenant);
    setShowForm(false);
    setEditing(null);
    reload();
  };

  const handleDelete = (id: string) => {
    if (confirm(lang === 'ar' ? 'حذف المستأجر؟' : 'Delete tenant?')) {
      deleteTenant(id);
      reload();
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tenants.length} {t('tenant', lang)}</span>
        <button onClick={() => { setEditing(null); setShowForm(true); }} style={{
          background: 'var(--primary)', color: '#fff', border: 'none',
          borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
        }}>
          + {t('add', lang)}
        </button>
      </div>

      <input
        placeholder={t('tenantSearch', lang)}
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: '8px',
          border: '1px solid var(--border)', background: 'var(--bg-card)',
          color: 'var(--text)', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
          marginBottom: '10px',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(tt => {
          const apt = apartments.find(a => a.id === tt.apartmentId);
          const isExpanded = expanded === tt.id;
          return (
            <div key={tt.id} style={{
              background: 'var(--bg-card)', borderRadius: '10px',
              border: '1px solid var(--border)', overflow: 'hidden',
            }}>
              <div onClick={() => setExpanded(isExpanded ? null : tt.id)} style={{
                padding: '12px 14px', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{tt.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                    {t('apt', lang)} {apt?.number} - {tt.floor}
                    {tt.phone && <span style={{ marginInlineStart: '8px', direction: 'ltr' as const }}>{tt.phone}</span>}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '15px' }}>
                  {tt.rentAmount} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('kwd', lang)}</span>
                </div>
              </div>

              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border-light)' }}>
                    <InfoCell label={t('civilId', lang)} value={tt.civilId || '-'} />
                    <InfoCell label={t('nationality', lang)} value={tt.nationality || '-'} />
                    <InfoCell label={t('profession', lang)} value={tt.profession || '-'} />
                    <InfoCell label={t('paymentMethod', lang)} value={tt.paymentMethod || '-'} />
                    <InfoCell label={t('leaseStart', lang)} value={tt.leaseStart || '-'} />
                    <InfoCell label={t('leaseEnd', lang)} value={tt.leaseEnd || '-'} />
                  </div>
                  <div style={{ padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    <Btn label={t('edit', lang)} onClick={() => { setEditing(tt); setShowForm(true); }} />
                    <Btn label={t('printContract', lang)} onClick={() => printContract(tt)} />
                    {tt.phone && <Btn label={t('whatsapp', lang)} onClick={() => window.open(`https://wa.me/965${tt.phone.replace(/\D/g, '')}`, '_blank')} />}
                    <Btn label={t('evict', lang)} onClick={() => setEvictingTenant(tt)} color="var(--danger)" />
                    <Btn label={t('delete', lang)} onClick={() => handleDelete(tt.id)} color="var(--danger)" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>{t('noResults', lang)}</div>
        )}
      </div>

      {showForm && (
        <TenantForm
          tenant={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {evictingTenant && (
        <EvictionModal
          tenant={evictingTenant}
          lang={lang}
          onConfirm={(reason, notes) => {
            const apt = apartments.find(a => a.id === evictingTenant.apartmentId);
            const eviction: Eviction = {
              id: generateId(), tenantId: evictingTenant.id, tenantName: evictingTenant.name,
              apartmentId: evictingTenant.apartmentId, apartmentNumber: apt?.number || '',
              floor: evictingTenant.floor, reason, date: new Date().toISOString().split('T')[0], notes,
            };
            addEviction(eviction);
            printEvictionNotice(evictingTenant);
            setEvictingTenant(null);
            reload();
          }}
          onCancel={() => setEvictingTenant(null)}
        />
      )}
    </>
  );
}

/* ── Helper Components ── */

function LegendItem({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: color }} />
      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '11px', fontWeight: 600, color }}>{count}</span>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', padding: '8px 14px' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{label}</div>
      <div style={{ fontSize: '13px', marginTop: '1px' }}>{value}</div>
    </div>
  );
}

function Btn({ label, onClick, color }: { label: string; onClick: () => void; color?: string }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} style={{
      padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)',
      background: 'var(--bg)', color: color || 'var(--text)', fontSize: '12px', cursor: 'pointer',
    }}>{label}</button>
  );
}

function ActionBtn({ icon, label, color, onClick }: { icon: string; label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
      background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px',
      padding: '10px 6px', cursor: 'pointer', color, fontSize: '10px', fontWeight: 600,
    }}>
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={icon} /></svg>
      {label}
    </button>
  );
}

/* ── Apartment Detail Modal ── */

function ApartmentDetail({ apartment, tenant, lang, onSave, onEvict, onDeleteTenant, onDeleteApt, onClose }: {
  apartment: Apartment; tenant: Tenant | null; lang: import('@/lib/i18n').Lang;
  onSave: (a: Apartment) => void;
  onEvict: (a: Apartment, t: Tenant) => void;
  onDeleteTenant: (a: Apartment, t: Tenant) => void;
  onDeleteApt: (a: Apartment) => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(apartment.notes || '');
  const [flagged, setFlagged] = useState(apartment.flagged || false);
  const [flagReason, setFlagReason] = useState(apartment.flagReason || '');
  const [showNotes, setShowNotes] = useState(false);

  const isVacant = apartment.status === 'vacant';
  const statusColor = apartment.flagged ? 'var(--danger)' : isVacant ? '#8b5cf6' : 'var(--success)';
  const statusLabel = apartment.flagged ? t('flagged', lang) : isVacant ? t('vacant', lang) : t('occupied', lang);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-card)', borderRadius: '16px 16px 0 0', width: '100%',
        maxWidth: '500px', padding: '20px', maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{t('apt', lang)} {apartment.number}</h2>
            <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>{apartment.floor}</span>
              <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, background: statusColor, color: '#fff' }}>{statusLabel}</span>
            </div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--success)' }}>{apartment.rentAmount} <span style={{ fontSize: '11px', fontWeight: 400 }}>{t('kwd', lang)}</span></div>
        </div>

        {/* Tenant Info */}
        {tenant && (
          <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '14px', borderInlineStart: '3px solid var(--success)' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{tenant.name}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
              {tenant.civilId && <div>{t('civilId', lang)}: <span style={{ color: 'var(--text)' }}>{tenant.civilId}</span></div>}
              {tenant.phone && <div>{t('phone', lang)}: <span style={{ color: 'var(--text)' }}>{tenant.phone}</span></div>}
              {tenant.nationality && <div>{t('nationality', lang)}: <span style={{ color: 'var(--text)' }}>{tenant.nationality}</span></div>}
              {tenant.profession && <div>{t('profession', lang)}: <span style={{ color: 'var(--text)' }}>{tenant.profession}</span></div>}
              {tenant.leaseStart && <div>{t('leaseStart', lang)}: <span style={{ color: 'var(--text)' }}>{tenant.leaseStart}</span></div>}
              {tenant.leaseEnd && <div>{t('leaseEnd', lang)}: <span style={{ color: new Date(tenant.leaseEnd) < new Date() ? 'var(--danger)' : 'var(--text)' }}>{tenant.leaseEnd}</span></div>}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {tenant && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>{t('actions', lang)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              <ActionBtn icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" label={t('rentContract', lang)} color="var(--primary)" onClick={() => printContract(tenant)} />
              <ActionBtn icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" label={t('rentReceipt', lang)} color="var(--success)" onClick={() => {
                const p = { id: '', tenantId: tenant.id, amount: tenant.rentAmount, month: new Date().toLocaleDateString('ar', { month: 'long' }), year: new Date().getFullYear(), date: new Date().toISOString().split('T')[0], method: tenant.paymentMethod || 'نقدا', notes: '' };
                printReceipt(tenant, p);
              }} />
              <ActionBtn icon="M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.97l-7-12a2 2 0 00-3.5 0l-7 12A2 2 0 005.07 19z" label={t('evictionNotice', lang)} color="var(--warning)" onClick={() => printEvictionNotice(tenant)} />
              <ActionBtn icon="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" label={t('evict', lang)} color="var(--danger)" onClick={() => {
                if (confirm(lang === 'ar' ? `إخلاء ${tenant.name}؟` : `Evict ${tenant.name}?`)) onEvict(apartment, tenant);
              }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginTop: '6px' }}>
              {tenant.phone && (
                <a href={`https://wa.me/965${tenant.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px',
                  padding: '10px', color: '#25d366', fontSize: '11px', fontWeight: 600, textDecoration: 'none',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  {t('whatsapp', lang)}
                </a>
              )}
              {tenant.phone && (
                <a href={`tel:${tenant.phone}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px',
                  padding: '10px', color: 'var(--primary)', fontSize: '11px', fontWeight: 600, textDecoration: 'none',
                }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  {t('call', lang)}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Delete tenant */}
        {tenant && (
          <button onClick={() => {
            if (confirm(lang === 'ar' ? `حذف المستأجر ${tenant.name}؟` : `Delete tenant ${tenant.name}?`)) onDeleteTenant(apartment, tenant);
          }} style={{
            width: '100%', padding: '10px', borderRadius: '8px',
            border: '1px solid var(--danger)', background: 'var(--danger-light)',
            color: 'var(--danger)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            {t('deleteTenant', lang)}
          </button>
        )}

        {/* Delete apartment (vacant only) */}
        {isVacant && (
          <button onClick={() => {
            if (confirm(lang === 'ar' ? `حذف شقة ${apartment.number}؟` : `Delete apartment ${apartment.number}?`)) onDeleteApt(apartment);
          }} style={{
            width: '100%', padding: '10px', borderRadius: '8px',
            border: '1px solid var(--danger)', background: 'transparent',
            color: 'var(--danger)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            {t('deleteApt', lang)}
          </button>
        )}

        {/* Notes & Flag section */}
        <button onClick={() => setShowNotes(!showNotes)} style={{
          width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)',
          background: 'var(--bg)', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer',
          marginBottom: showNotes ? '10px' : '0',
        }}>
          {showNotes ? `▲ ${t('hideNotes', lang)}` : `▼ ${t('notesFlags', lang)}`}
        </button>

        {showNotes && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('notes', lang) + '...'} />
            <label style={{ fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: flagged ? 'var(--danger)' : 'var(--text)' }}>
              <input type="checkbox" checked={flagged} onChange={e => setFlagged(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--danger)' }} />
              {t('flagApt', lang)}
            </label>
            {flagged && <input style={{ ...inputStyle, borderColor: 'var(--danger)' }} value={flagReason} onChange={e => setFlagReason(e.target.value)} placeholder={t('flagReason', lang)} />}
            <button onClick={() => onSave({ ...apartment, notes, flagged, flagReason: flagged ? flagReason : '' })} style={{
              width: '100%', padding: '11px', borderRadius: '8px', border: 'none',
              background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}>{t('saveNotes', lang)}</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Add Apartment Form ── */

function AddApartmentForm({ lang, onSave, onCancel }: {
  lang: import('@/lib/i18n').Lang;
  onSave: (apt: Apartment) => void;
  onCancel: () => void;
}) {
  const [number, setNumber] = useState('');
  const [floor, setFloor] = useState(floors[0].key);
  const [rent, setRent] = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: generateId(),
      number: number.trim(),
      floor,
      status: 'vacant',
      tenantId: null,
      rentAmount: Number(rent) || 0,
      notes: '',
      flagged: false,
      flagReason: '',
    });
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
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px' }}>{t('addApt', lang)}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input style={inputStyle} value={number} onChange={e => setNumber(e.target.value)} required placeholder={t('aptNumber', lang)} />
          <select style={inputStyle} value={floor} onChange={e => setFloor(e.target.value)}>
            {floors.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
          <input style={inputStyle} type="number" value={rent} onChange={e => setRent(e.target.value)} placeholder={t('rentAmountLabel', lang)} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button type="submit" style={{
              flex: 1, padding: '11px', borderRadius: '8px', border: 'none',
              background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}>{t('add', lang)}</button>
            <button type="button" onClick={onCancel} style={{
              padding: '11px 20px', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', cursor: 'pointer',
            }}>{t('cancel', lang)}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Eviction Modal ── */

function EvictionModal({ tenant, lang, onConfirm, onCancel }: {
  tenant: Tenant; lang: import('@/lib/i18n').Lang;
  onConfirm: (reason: string, notes: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

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
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px', color: 'var(--danger)' }}>{t('evictionTitle', lang)}</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
          {tenant.name}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input style={inputStyle} value={reason} onChange={e => setReason(e.target.value)} placeholder={t('evictionReason', lang)} />
          <textarea style={{ ...inputStyle, minHeight: '50px', resize: 'vertical' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('notes', lang)} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button onClick={() => { if (reason.trim()) onConfirm(reason, notes); }} style={{
              flex: 1, padding: '11px', borderRadius: '8px', border: 'none',
              background: 'var(--danger)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              opacity: reason.trim() ? 1 : 0.5,
            }}>{t('confirmEviction', lang)}</button>
            <button onClick={onCancel} style={{
              padding: '11px 20px', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', cursor: 'pointer',
            }}>{t('cancel', lang)}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
