import { Tenant, Payment } from './types';
import { getApartments } from './store';

export function printReceipt(tenant: Tenant, payment: Payment) {
  const apt = getApartments().find(a => a.id === tenant.apartmentId);
  const w = window.open('', '_blank', 'width=400,height=600');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<title>وصل إيجار - ${tenant.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Arial, sans-serif; padding: 24px; color: #1a1a2e; direction: rtl; max-width: 400px; margin: 0 auto; }
  .header { text-align: center; border-bottom: 3px double #1e3a5f; padding-bottom: 16px; margin-bottom: 20px; }
  .header h1 { font-size: 22px; color: #1e3a5f; margin-bottom: 4px; }
  .header p { font-size: 12px; color: #666; }
  .label { font-size: 12px; color: #888; margin-bottom: 2px; }
  .value { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
  .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #ddd; }
  .amount { text-align: center; margin: 20px 0; padding: 16px; background: #f0f7ff; border-radius: 10px; }
  .amount .num { font-size: 32px; font-weight: 700; color: #1e3a5f; }
  .amount .unit { font-size: 14px; color: #666; }
  .footer { text-align: center; margin-top: 24px; padding-top: 16px; border-top: 2px solid #1e3a5f; font-size: 11px; color: #888; }
  .sig { display: flex; justify-content: space-between; margin-top: 40px; }
  .sig div { text-align: center; width: 40%; }
  .sig .line { border-top: 1px solid #333; margin-top: 40px; padding-top: 4px; font-size: 12px; }
  @media print { body { padding: 16px; } }
</style></head><body>
<div class="header">
  <h1>🏢 عمارة زمزم</h1>
  <p>Zamzam Building</p>
  <p style="margin-top:8px;font-size:14px;font-weight:600;">وصل استلام إيجار</p>
  <p>Rent Receipt</p>
</div>

<div class="label">رقم الوصل / Receipt No.</div>
<div class="value">${payment.id.slice(-8).toUpperCase()}</div>

<div class="row"><span>التاريخ / Date</span><span>${payment.date}</span></div>
<div class="row"><span>المستأجر / Tenant</span><span>${tenant.name}</span></div>
<div class="row"><span>الشقة / Apt.</span><span>${apt?.number || '-'} - الدور ${tenant.floor}</span></div>
<div class="row"><span>عن شهر / For Month</span><span>${payment.month} ${payment.year}</span></div>
<div class="row"><span>طريقة الدفع / Method</span><span>${payment.method}</span></div>
${payment.notes ? `<div class="row"><span>ملاحظات / Notes</span><span>${payment.notes}</span></div>` : ''}

<div class="amount">
  <div class="num">${payment.amount}</div>
  <div class="unit">دينار كويتي / KWD</div>
</div>

<div class="sig">
  <div><div class="line">توقيع المستلم<br>Receiver</div></div>
  <div><div class="line">توقيع المستأجر<br>Tenant</div></div>
</div>

<div class="footer">
  <p>عمارة زمزم - Zamzam Building</p>
</div>

<script>setTimeout(()=>window.print(),500)</script>
</body></html>`);
  w.document.close();
}

export function printMonthlyStatement(
  tenants: Tenant[],
  payments: Payment[],
  month: string,
  year: number,
) {
  const apartments = getApartments();
  const paidIds = new Set(payments.map(p => p.tenantId));
  const totalExpected = tenants.reduce((s, t) => s + t.rentAmount, 0);
  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);

  const rows = tenants.map(t => {
    const apt = apartments.find(a => a.id === t.apartmentId);
    const pmt = payments.find(p => p.tenantId === t.id);
    return `<tr>
      <td>${apt?.number || '-'}</td>
      <td>${t.floor}</td>
      <td>${t.name}</td>
      <td>${t.rentAmount}</td>
      <td style="color:${pmt ? '#0d9f6e' : '#dc3545'};font-weight:600">${pmt ? pmt.amount : '-'}</td>
      <td>${pmt ? pmt.date : '-'}</td>
      <td style="color:${pmt ? '#0d9f6e' : '#dc3545'}">${pmt ? '✓ مدفوع' : '✗ غير مدفوع'}</td>
    </tr>`;
  }).join('');

  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<title>كشف إيجارات ${month} ${year}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Arial, sans-serif; padding: 24px; color: #1a1a2e; direction: rtl; }
  .header { text-align: center; margin-bottom: 24px; }
  .header h1 { font-size: 24px; color: #1e3a5f; }
  .header h2 { font-size: 16px; color: #666; margin-top: 4px; }
  .stats { display: flex; gap: 16px; margin-bottom: 20px; justify-content: center; }
  .stat { padding: 12px 24px; border-radius: 10px; text-align: center; }
  .stat .n { font-size: 22px; font-weight: 700; }
  .stat .l { font-size: 12px; color: #666; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #1e3a5f; color: #fff; padding: 10px 8px; text-align: right; }
  td { padding: 8px; border-bottom: 1px solid #e2e6ea; }
  tr:nth-child(even) { background: #f8f9fb; }
  .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #888; border-top: 2px solid #1e3a5f; padding-top: 12px; }
  @media print { body { padding: 12px; font-size: 11px; } .stats .stat { padding: 8px 16px; } }
</style></head><body>
<div class="header">
  <h1>🏢 عمارة زمزم - Zamzam Building</h1>
  <h2>كشف إيجارات شهر ${month} ${year} / Monthly Rent Statement</h2>
  <p style="font-size:12px;color:#888;margin-top:8px">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-KW')}</p>
</div>

<div class="stats">
  <div class="stat" style="background:#e6f7f1"><div class="n" style="color:#0d9f6e">${totalCollected}</div><div class="l">المحصّل / Collected (KWD)</div></div>
  <div class="stat" style="background:#fde8ea"><div class="n" style="color:#dc3545">${totalExpected - totalCollected}</div><div class="l">المتبقي / Remaining (KWD)</div></div>
  <div class="stat" style="background:#e8eef6"><div class="n" style="color:#1e3a5f">${totalExpected}</div><div class="l">الإجمالي / Total (KWD)</div></div>
  <div class="stat" style="background:#faf3e0"><div class="n" style="color:#e67e22">${tenants.length > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0}%</div><div class="l">نسبة التحصيل / Rate</div></div>
</div>

<table>
  <thead><tr>
    <th>الشقة<br>Apt.</th>
    <th>الدور<br>Floor</th>
    <th>المستأجر<br>Tenant</th>
    <th>الإيجار<br>Rent</th>
    <th>المدفوع<br>Paid</th>
    <th>تاريخ الدفع<br>Date</th>
    <th>الحالة<br>Status</th>
  </tr></thead>
  <tbody>${rows}</tbody>
  <tfoot><tr style="background:#1e3a5f;color:#fff;font-weight:700">
    <td colspan="3">الإجمالي / Total</td>
    <td>${totalExpected}</td>
    <td>${totalCollected}</td>
    <td colspan="2">${paidIds.size} من ${tenants.length} مستأجر</td>
  </tr></tfoot>
</table>

<div class="footer">
  <p>عمارة زمزم - Zamzam Building Management System</p>
</div>

<script>setTimeout(()=>window.print(),500)</script>
</body></html>`);
  w.document.close();
}

export function printContract(tenant: Tenant) {
  const apt = getApartments().find(a => a.id === tenant.apartmentId);
  const w = window.open('', '_blank', 'width=700,height=900');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<title>عقد إيجار - ${tenant.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Arial, sans-serif; padding: 32px; color: #1a1a2e; direction: rtl; max-width: 700px; margin: 0 auto; line-height: 1.8; }
  .header { text-align: center; border-bottom: 3px double #1e3a5f; padding-bottom: 20px; margin-bottom: 24px; }
  .header h1 { font-size: 26px; color: #1e3a5f; }
  .header h2 { font-size: 18px; color: #d4a853; margin-top: 4px; }
  .field { display: flex; margin-bottom: 6px; }
  .field .lbl { font-weight: 600; min-width: 140px; color: #1e3a5f; }
  .section { margin: 20px 0 12px; font-size: 16px; font-weight: 700; color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 6px; }
  .sig { display: flex; justify-content: space-between; margin-top: 60px; }
  .sig div { text-align: center; width: 35%; }
  .sig .line { border-top: 1px solid #333; margin-top: 50px; padding-top: 6px; font-size: 13px; }
  .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #888; }
  @media print { body { padding: 20px; } }
</style></head><body>
<div class="header">
  <h1>🏢 عمارة زمزم</h1>
  <h2>عقد إيجار / Lease Agreement</h2>
</div>

<div class="section">بيانات المستأجر / Tenant Information</div>
<div class="field"><span class="lbl">الاسم / Name:</span><span>${tenant.name}</span></div>
<div class="field"><span class="lbl">الرقم المدني / Civil ID:</span><span>${tenant.civilId || '-'}</span></div>
<div class="field"><span class="lbl">الجنسية / Nationality:</span><span>${tenant.nationality || '-'}</span></div>
<div class="field"><span class="lbl">المهنة / Profession:</span><span>${tenant.profession || '-'}</span></div>
<div class="field"><span class="lbl">الهاتف / Phone:</span><span>${tenant.phone || '-'}</span></div>

<div class="section">بيانات الوحدة / Unit Information</div>
<div class="field"><span class="lbl">الشقة / Apartment:</span><span>${apt?.number || '-'}</span></div>
<div class="field"><span class="lbl">الدور / Floor:</span><span>${tenant.floor}</span></div>

<div class="section">بيانات العقد / Lease Details</div>
<div class="field"><span class="lbl">بداية العقد / Start:</span><span>${tenant.leaseStart || '-'}</span></div>
<div class="field"><span class="lbl">نهاية العقد / End:</span><span>${tenant.leaseEnd || '-'}</span></div>
<div class="field"><span class="lbl">مدة العقد / Duration:</span><span>${tenant.leaseDuration || '-'}</span></div>
<div class="field"><span class="lbl">الإيجار الشهري / Rent:</span><span style="font-weight:700;color:#1e3a5f">${tenant.rentAmount} د.ك / KWD</span></div>
<div class="field"><span class="lbl">طريقة الدفع / Payment:</span><span>${tenant.paymentMethod || '-'}</span></div>

<div class="sig">
  <div><div class="line">المؤجر / Landlord</div></div>
  <div><div class="line">المستأجر / Tenant</div></div>
  <div><div class="line">الشاهد / Witness</div></div>
</div>

<div class="footer"><p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-KW')}</p></div>

<script>setTimeout(()=>window.print(),500)</script>
</body></html>`);
  w.document.close();
}

export function printEvictionNotice(tenant: Tenant) {
  const apt = getApartments().find(a => a.id === tenant.apartmentId);
  const w = window.open('', '_blank', 'width=700,height=600');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<title>طلب إخلاء - ${tenant.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Arial, sans-serif; padding: 32px; color: #1a1a2e; direction: rtl; max-width: 700px; margin: 0 auto; line-height: 2; }
  .header { text-align: center; border-bottom: 3px double #dc3545; padding-bottom: 20px; margin-bottom: 24px; }
  .header h1 { font-size: 24px; color: #1e3a5f; }
  .header h2 { font-size: 18px; color: #dc3545; margin-top: 8px; }
  .content { font-size: 15px; }
  .sig { display: flex; justify-content: space-between; margin-top: 60px; }
  .sig div { text-align: center; width: 40%; }
  .sig .line { border-top: 1px solid #333; margin-top: 50px; padding-top: 6px; font-size: 13px; }
  @media print { body { padding: 20px; } }
</style></head><body>
<div class="header">
  <h1>🏢 عمارة زمزم - Zamzam Building</h1>
  <h2>إشعار إخلاء / Eviction Notice</h2>
</div>
<div class="content">
  <p>التاريخ / Date: ${new Date().toLocaleDateString('ar-KW')}</p>
  <br>
  <p>السيد/ة / Mr./Ms.: <strong>${tenant.name}</strong></p>
  <p>المستأجر في الشقة رقم / Tenant of Apt. No.: <strong>${apt?.number || '-'}</strong> - الدور / Floor: <strong>${tenant.floor}</strong></p>
  <br>
  <p>نحيطكم علماً بأنه يتعين عليكم إخلاء الشقة المذكورة أعلاه وذلك بسبب:</p>
  <p>You are hereby notified to vacate the above-mentioned apartment due to:</p>
  <br>
  <p style="border-bottom:1px dashed #ccc;padding-bottom:30px">............................................................................</p>
  <br>
  <p>آخر موعد للإخلاء / Vacate by: ............................................</p>
</div>
<div class="sig">
  <div><div class="line">إدارة العمارة<br>Management</div></div>
  <div><div class="line">المستأجر<br>Tenant</div></div>
</div>
<script>setTimeout(()=>window.print(),500)</script>
</body></html>`);
  w.document.close();
}
