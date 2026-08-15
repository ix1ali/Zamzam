import { Tenant, Payment } from './types';
import { getApartments, getTenants, getExpenses } from './store';

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
  <h1>عمارة زمزم</h1>
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
  <h1>عمارة زمزم - Zamzam Building</h1>
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
  const w = window.open('', '_blank', 'width=800,height=1100');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<title>عقد إيجار - ${tenant.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Traditional Arabic', 'Simplified Arabic', 'Segoe UI', Arial, sans-serif; padding: 40px 50px; color: #000; direction: rtl; max-width: 800px; margin: 0 auto; line-height: 2; font-size: 15px; }
  .header { text-align: center; margin-bottom: 20px; }
  .header h1 { font-size: 20px; font-weight: 700; }
  .header h2 { font-size: 24px; font-weight: 700; margin: 10px 0; text-decoration: underline; }
  .company { font-size: 14px; margin-bottom: 4px; }
  .fields { margin: 16px 0; }
  .field-row { display: flex; gap: 20px; margin-bottom: 4px; font-size: 14px; }
  .field-row .lbl { font-weight: 700; }
  .field-row .val { border-bottom: 1px dotted #333; flex: 1; min-width: 100px; }
  .clauses { margin-top: 16px; }
  .clause { margin-bottom: 8px; text-align: justify; font-size: 14px; }
  .clause-num { font-weight: 700; display: inline; }
  .signatures { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; }
  .sig-block { text-align: center; width: 40%; }
  .sig-block .title { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
  .sig-block .name { font-size: 13px; margin-bottom: 40px; }
  .sig-block .line { border-top: 1px solid #000; padding-top: 4px; font-size: 12px; }
  @media print { body { padding: 30px 40px; } @page { size: A4; margin: 15mm; } }
</style></head><body>

<div class="header">
  <div class="company">Real Estate / Redha & Abbas AlSalman</div>
  <div class="company">شركة جوهرة السلمان العقارية</div>
  <h2>عقد إيجار</h2>
</div>

<div class="fields">
  <div class="field-row">
    <span class="lbl">الرقم المدني:</span>
    <span class="val">${tenant.civilId || '_______________'}</span>
    <span class="lbl">رقم الهاتف:</span>
    <span class="val">${tenant.phone || '_______________'}</span>
  </div>
  <div class="field-row">
    <span class="lbl">القيمة الايجارية الشهرية:</span>
    <span class="val">${tenant.rentAmount} K.D</span>
    <span class="lbl">الشقة:</span>
    <span class="val">${apt?.number || '___'}</span>
    <span class="lbl">الدور:</span>
    <span class="val">${tenant.floor}</span>
  </div>
  <div class="field-row">
    <span class="lbl">اسم المستأجر:</span>
    <span class="val">${tenant.name}</span>
  </div>
  <div class="field-row">
    <span class="lbl">بداية العقد:</span>
    <span class="val">${tenant.leaseStart || '___/___/______'}</span>
    <span class="lbl">نهاية العقد:</span>
    <span class="val">${tenant.leaseEnd || '___/___/______'}</span>
    <span class="lbl">المدة:</span>
    <span class="val">${tenant.leaseDuration || '___________'}</span>
  </div>
</div>

<div class="clauses">
  <div class="clause"><span class="clause-num">1- </span>لا يزيد عدد السكان في الشقة عن عدد ........................ اشخاص.</div>

  <div class="clause"><span class="clause-num">2- </span>في حالة رغبة المستأجر اخلاء الشقة يجب عليه ابلاغ المؤجر قبل شهر من تاريخ الاخلاء و تسليم الشقة بنفس حالتها عند الاستلام و يكون ابلاغ المؤجر قبل يوم 25 من الشهر على ان يكون الاخلاء في نهاية الشهر و ليس في اوله.</div>

  <div class="clause"><span class="clause-num">3- </span>عدم التدخين او وضع اغراض في ممر العمارة.</div>

  <div class="clause"><span class="clause-num">4- </span>في حالة تأخر المستأجر عن دفع الإيجار في الموعد المحدد يعتبر العقد لاغياً من تلقاء نفسه دون الحاجة لأي إجراء قانوني أو تنبيه.</div>

  <div class="clause"><span class="clause-num">5- </span>يقر المستأجر بأنه عاين الشقة المؤجرة له معاينة تامة نافية للجهالة ورضي بحالتها الراهنة.</div>

  <div class="clause"><span class="clause-num">6- </span>يتعهد المستأجر بالمحافظة على الشقة و يلتزم بإصلاح ما يتلف بها على نفقته الخاصة نتيجة سوء الاستعمال.</div>

  <div class="clause"><span class="clause-num">7- </span>تقوم الحكومة بدفع قيمة الماء و الكهرباء حاليا ولكن اذا تم الغاء هذا القرار من قبل الحكومة مستقبلا يلتزم المستأجر بدفع ما يخص شقته من استهلاك الماء و الكهرباء أو أي زيادة أو ضرائب أو رسوم اضافية.</div>

  <div class="clause"><span class="clause-num">8- </span>عفش الشقة يعتبر ضمانة مقابل الايجار لحين اخلاء الشقة و تسليم المفتاح و تسوية كافة المستحقات.</div>

  <div class="clause"><span class="clause-num">9- </span>لا يحق للمستأجر التنازل عن الشقة أو تأجيرها من الباطن أو السماح للغير بالسكن فيها بدون إذن المؤجر.</div>

  <div class="clause"><span class="clause-num">10- </span>على المستأجر احترام الجيران والتقيد بالعادات والتقاليد الاسلامية وعدم ارتكاب اي فعل يتنافى مع الاداب العامة وعدم تربية الحيوانات في الشقة او العمارة.</div>

  <div class="clause"><span class="clause-num">11- </span>في حال عدم سداد الايجار يتم فرض مبلغ 200 د.ك كرسوم ادارية.</div>

  <div class="clause"><span class="clause-num">12- </span>في حالة ما اذا صدر قرار بهدم العقار او اعادة بنائه او ترميمه واحتاج ذلك الى اخلاء المستأجر يلتزم المستأجر بإخلاء الشقة خلال شهر واحد من تاريخ الإخطار دون مطالبة بأي تعويض.</div>

  <div class="clause"><span class="clause-num">13- </span>أي مخالفة لأي بند من بنود هذا العقد يعتبر العقد لاغياً من تلقاء نفسه دون الحاجة لأي إجراء قانوني.</div>

  <div class="clause"><span class="clause-num">14- </span>يقر المستأجر بأن عنوانه القانوني هو عنوان الشقة المؤجرة له و أي اخطار او اعلان يوجه اليه على هذا العنوان يعتبر صحيحاً.</div>

  <div class="clause"><span class="clause-num">15- </span>يلتزم المستأجر بدفع مبلغ 5 د.ك شهرياً رسوم تنظيف العمارة.</div>

  <div class="clause"><span class="clause-num">16- </span>حُرر هذا العقد من نسختين لكل طرف نسخة للعمل بموجبها و في حالة حدوث أي خلاف تكون محاكم الكويت هي المختصة.</div>
</div>

<div class="signatures">
  <div class="sig-block">
    <div class="title">الطرف الأول (المؤجر)</div>
    <div class="name">شركة جوهرة السلمان العقارية</div>
    <div class="line">التوقيع</div>
  </div>
  <div class="sig-block">
    <div class="title">الطرف الثاني (المستأجر)</div>
    <div class="name">${tenant.name}</div>
    <div class="line">التوقيع</div>
  </div>
</div>

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
  body { font-family: 'Traditional Arabic', 'Simplified Arabic', 'Segoe UI', Arial, sans-serif; padding: 40px 50px; color: #000; direction: rtl; max-width: 700px; margin: 0 auto; line-height: 2; }
  .header { text-align: center; border-bottom: 3px double #1e3a5f; padding-bottom: 20px; margin-bottom: 24px; }
  .header h1 { font-size: 22px; color: #1e3a5f; }
  .header h2 { font-size: 20px; color: #dc3545; margin-top: 8px; }
  .content { font-size: 15px; }
  .sig { display: flex; justify-content: space-between; margin-top: 60px; }
  .sig div { text-align: center; width: 40%; }
  .sig .line { border-top: 1px solid #333; margin-top: 50px; padding-top: 6px; font-size: 13px; }
  @media print { body { padding: 30px 40px; } @page { size: A4; margin: 15mm; } }
</style></head><body>
<div class="header">
  <div style="font-size:14px">شركة جوهرة السلمان العقارية</div>
  <h1>عمارة زمزم</h1>
  <h2>طلب إخلاء</h2>
</div>
<div class="content">
  <p>التاريخ: ${new Date().toLocaleDateString('ar-KW')}</p>
  <br>
  <p>السيد/ة: <strong>${tenant.name}</strong></p>
  <p>الرقم المدني: <strong>${tenant.civilId || '_______________'}</strong></p>
  <p>المستأجر في الشقة رقم: <strong>${apt?.number || '-'}</strong> - الدور: <strong>${tenant.floor}</strong></p>
  <br>
  <p>نحيطكم علماً بأنه يتعين عليكم إخلاء الشقة المذكورة أعلاه وذلك بسبب:</p>
  <p style="border-bottom:1px dashed #ccc;padding-bottom:30px;margin-top:10px">............................................................................</p>
  <br>
  <p>آخر موعد للإخلاء: ............................................</p>
  <br>
  <p>علماً بأنه في حال عدم الإخلاء في الموعد المحدد سيتم اتخاذ الإجراءات القانونية اللازمة.</p>
</div>
<div class="sig">
  <div><div class="line">إدارة العمارة<br>شركة جوهرة السلمان العقارية</div></div>
  <div><div class="line">المستأجر<br>${tenant.name}</div></div>
</div>
<script>setTimeout(()=>window.print(),500)</script>
</body></html>`);
  w.document.close();
}

export function printFinancialStatement(month: string, year: number) {
  const tenants = getTenants();
  const expenses = getExpenses();
  const monthExpenses = expenses.filter(e => e.month === month && e.year === year);

  const totalRent = tenants.reduce((s, t) => s + t.rentAmount, 0);
  const generalExpenses = monthExpenses.filter(e => e.type === 'general');
  const electricityExpenses = monthExpenses.filter(e => e.type === 'electricity');
  const salaryExpenses = monthExpenses.filter(e => e.type === 'salary');
  const totalGeneral = generalExpenses.reduce((s, e) => s + e.amount, 0);
  const totalElectricity = electricityExpenses.reduce((s, e) => s + e.amount, 0);
  const totalSalaries = salaryExpenses.reduce((s, e) => s + e.amount, 0);
  const totalExpensesAmount = totalGeneral + totalElectricity + totalSalaries;
  const netProfit = totalRent - totalExpensesAmount;
  const shareEach = netProfit / 2;

  const w = window.open('', '_blank', 'width=700,height=900');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<title>كشف مالي - ${month} ${year}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Arial, sans-serif; padding: 32px; color: #1a1a2e; direction: rtl; max-width: 700px; margin: 0 auto; }
  .header { text-align: center; border-bottom: 3px double #1e3a5f; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 22px; color: #1e3a5f; }
  .header h2 { font-size: 16px; color: #666; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th { background: #1e3a5f; color: #fff; padding: 10px 12px; text-align: right; font-size: 13px; }
  td { padding: 8px 12px; border-bottom: 1px solid #e2e6ea; font-size: 13px; }
  .total-row { background: #f0f7ff; font-weight: 700; }
  .section-header { background: #e8eef6; font-weight: 600; }
  .profit-row { background: #e6f7f1; font-weight: 700; font-size: 15px; }
  .loss-row { background: #fde8ea; font-weight: 700; font-size: 15px; }
  .share { margin-top: 20px; padding: 16px; background: #f8f9fb; border-radius: 10px; border: 1px solid #e2e6ea; }
  .share h3 { font-size: 14px; color: #1e3a5f; margin-bottom: 10px; }
  .share .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
  .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #888; border-top: 2px solid #1e3a5f; padding-top: 12px; }
  @media print { body { padding: 20px; } @page { size: A4; margin: 15mm; } }
</style></head><body>
<div class="header">
  <h1>عمارة زمزم - Zamzam Building</h1>
  <h2>الكشف المالي - ${month} ${year}</h2>
  <p style="font-size:12px;color:#888;margin-top:8px">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-KW')}</p>
</div>

<table>
  <thead><tr><th>البيان</th><th>المبلغ (د.ك)</th></tr></thead>
  <tbody>
    <tr class="total-row"><td>إجمالي الإيجارات الشهرية</td><td>${totalRent.toLocaleString()}</td></tr>
    <tr class="section-header"><td colspan="2">المصروفات العامة</td></tr>
    ${generalExpenses.map(e => `<tr><td style="padding-right:24px">${e.description}</td><td>${e.amount.toLocaleString()}</td></tr>`).join('')}
    ${generalExpenses.length === 0 ? '<tr><td colspan="2" style="color:#888;font-style:italic">لا توجد مصروفات</td></tr>' : ''}
    <tr class="section-header"><td colspan="2">الكهرباء</td></tr>
    ${electricityExpenses.map(e => `<tr><td style="padding-right:24px">${e.description}</td><td>${e.amount.toLocaleString()}</td></tr>`).join('')}
    ${electricityExpenses.length === 0 ? '<tr><td colspan="2" style="color:#888;font-style:italic">لا توجد</td></tr>' : ''}
    <tr class="section-header"><td colspan="2">الرواتب</td></tr>
    ${salaryExpenses.map(e => `<tr><td style="padding-right:24px">${e.description}</td><td>${e.amount.toLocaleString()}</td></tr>`).join('')}
    ${salaryExpenses.length === 0 ? '<tr><td colspan="2" style="color:#888;font-style:italic">لا توجد</td></tr>' : ''}
    <tr class="total-row"><td>إجمالي المصروفات</td><td>${totalExpensesAmount.toLocaleString()}</td></tr>
    <tr class="${netProfit >= 0 ? 'profit-row' : 'loss-row'}"><td>صافي الربح</td><td>${netProfit.toLocaleString()}</td></tr>
  </tbody>
</table>

<div class="share">
  <h3>توزيع الأرباح (50/50)</h3>
  <div class="row"><span>الطرف الأول</span><span style="font-weight:700">${shareEach.toLocaleString()} د.ك</span></div>
  <div class="row"><span>الطرف الثاني</span><span style="font-weight:700">${shareEach.toLocaleString()} د.ك</span></div>
</div>

<div class="footer"><p>عمارة زمزم - Zamzam Building Management System</p></div>
<script>setTimeout(()=>window.print(),500)</script>
</body></html>`);
  w.document.close();
}
