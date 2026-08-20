import { Tenant, Payment } from './types';
import { getApartments, getTenants, getExpenses } from './store';

function amountToArabicWords(amount: number): string {
  const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  const dinar = Math.floor(amount);
  const fils = Math.round((amount - dinar) * 1000);

  if (dinar === 0) return 'صفر دينار كويتي فقط لاغير';

  const parts: string[] = [];

  if (dinar >= 1000) {
    const th = Math.floor(dinar / 1000);
    if (th === 1) parts.push('ألف');
    else if (th === 2) parts.push('ألفان');
    else if (th <= 10) parts.push(ones[th] + ' آلاف');
    const rem = dinar % 1000;
    if (rem > 0) {
      parts.push('و');
      return parts.join(' ') + ' ' + amountWordsPart(rem, hundreds, ones, teens, tens) + ' دينار كويتي فقط لاغير';
    }
    return parts.join(' ') + ' دينار كويتي فقط لاغير';
  }

  return amountWordsPart(dinar, hundreds, ones, teens, tens) + ' دينار كويتي فقط لاغير';
}

function amountWordsPart(n: number, hundreds: string[], ones: string[], teens: string[], tens: string[]): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  if (h > 0) parts.push(hundreds[h]);
  const remainder = n % 100;
  if (remainder > 0) {
    if (parts.length > 0) parts.push('و');
    if (remainder < 10) {
      parts.push(ones[remainder]);
    } else if (remainder >= 10 && remainder < 20) {
      parts.push(teens[remainder - 10]);
    } else {
      const t = Math.floor(remainder / 10);
      const o = remainder % 10;
      if (o > 0) {
        parts.push(ones[o] + ' و' + tens[t]);
      } else {
        parts.push(tens[t]);
      }
    }
  }
  return parts.join(' ');
}

export function printReceipt(tenant: Tenant, payment: Payment) {
  const apt = getApartments().find(a => a.id === tenant.apartmentId);
  const amountWords = amountToArabicWords(payment.amount);
  const dinar = Math.floor(payment.amount);
  const fils = Math.round((payment.amount - dinar) * 1000);
  const isCash = payment.method === 'نقدا';

  const w = window.open('', '_blank', 'width=750,height=600');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<title>وصل ايجار - ${tenant.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Traditional Arabic', 'Simplified Arabic', 'Segoe UI', Arial, sans-serif; padding: 30px; color: #000; direction: rtl; max-width: 750px; margin: 0 auto; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; }
  td, th { border: 1.5px solid #000; padding: 6px 10px; vertical-align: middle; }
  .header-table td { border: none; padding: 4px 8px; }
  .lbl { font-weight: 700; white-space: nowrap; width: 1%; }
  .val { min-width: 80px; }
  .amount-box { border: 2px solid #000; padding: 4px 12px; display: inline-block; min-width: 60px; text-align: center; font-weight: 700; font-size: 16px; }
  @media print { body { padding: 20px; } @page { size: A4; margin: 15mm; } }
</style></head><body>

<!-- Header -->
<table class="header-table" style="margin-bottom:12px;width:100%">
  <tr>
    <td style="text-align:right;width:35%;font-size:13px;line-height:1.6">
      <div style="font-weight:700;font-size:15px">شركة جوهرة السلمان العقارية</div>
      <div>عقار / رضا و عباس السلمان</div>
    </td>
    <td style="text-align:center;width:30%">
      <div style="font-weight:700;font-size:20px;color:#c00">وصل ايجار</div>
      <div style="font-size:13px">Rent Voucher</div>
    </td>
    <td style="text-align:left;width:35%;font-size:12px;line-height:1.6">
      <div style="font-weight:700;font-size:13px">Jawhart Al-Salman Real Estate Company</div>
      <div>Real Estate / Redha, Abbas AlSalman</div>
    </td>
  </tr>
</table>

<!-- Date and Amount boxes -->
<table class="header-table" style="margin-bottom:12px;width:100%">
  <tr>
    <td style="text-align:right;width:50%">
      <span class="amount-box" style="margin-left:4px">${fils || ''}</span>
      <span style="font-weight:700;margin:0 4px">فلس</span>
      <span class="amount-box" style="margin-left:4px">${dinar}</span>
      <span style="font-weight:700;margin:0 4px">دينار</span>
    </td>
    <td style="text-align:left;width:50%">
      <span style="font-weight:700;font-size:15px">${payment.date}</span>
      <span style="font-weight:700;margin-right:8px;border:2px solid #000;padding:3px 10px">التاريخ</span>
    </td>
  </tr>
</table>

<!-- Main form table -->
<table>
  <tr>
    <td class="lbl" style="text-align:left;font-size:11px">Received From</td>
    <td class="val" style="font-weight:700;font-size:15px">${tenant.name}</td>
    <td class="lbl">وصلنا من السيد / السادة</td>
  </tr>
  <tr>
    <td class="lbl" style="text-align:left;font-size:11px">The Sum of K.D</td>
    <td class="val">${amountWords}</td>
    <td class="lbl">مبلغ وقدره</td>
  </tr>
  <tr>
    <td class="lbl" style="text-align:left;font-size:11px">Bank</td>
    <td style="padding:0">
      <table style="width:100%;border:none">
        <tr>
          <td style="border:none;border-left:1.5px solid #000;width:50%">${!isCash ? (payment.notes || '') : ''}</td>
          <td style="border:none;border-left:1.5px solid #000;width:15%;text-align:center;font-size:11px">على بنك</td>
          <td style="border:none;border-left:1.5px solid #000;width:15%;text-align:center;font-size:11px">Cash / Cheque No</td>
          <td style="border:none;width:20%;text-align:center;font-weight:700">${isCash ? 'نقدا' : payment.method}</td>
        </tr>
      </table>
    </td>
    <td class="lbl">نقدا / شيك رقم</td>
  </tr>
  <tr>
    <td class="lbl" style="text-align:left;font-size:11px">Of Rent</td>
    <td class="val" style="font-weight:700;font-size:15px">${apt?.number || '-'}</td>
    <td class="lbl">وذلك عن ايجار</td>
  </tr>
  <tr>
    <td class="lbl" style="text-align:left;font-size:11px">Month Of</td>
    <td class="val" style="font-weight:700">${payment.month} ${payment.year}</td>
    <td class="lbl">عن شهر</td>
  </tr>
</table>

<!-- Signature -->
<div style="margin-top:30px;text-align:right;padding-right:40px">
  <div style="font-weight:700;font-size:15px">توقيع المستلم</div>
  <div style="margin-top:6px;font-size:16px;letter-spacing:3px">..............................</div>
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
      <td style="color:${pmt ? '#000' : '#c00'};font-weight:600">${pmt ? pmt.amount : '-'}</td>
      <td>${pmt ? pmt.date : '-'}</td>
      <td style="text-align:center;font-size:${pmt ? '13px' : '20px'}">${pmt ? 'مدفوع' : '☐'}</td>
    </tr>`;
  }).join('');

  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<title>كشف إيجارات ${month} ${year}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Traditional Arabic', 'Simplified Arabic', -apple-system, 'Segoe UI', Arial, sans-serif; padding: 24px; color: #000; direction: rtl; }
  .header { text-align: center; margin-bottom: 20px; }
  .header h1 { font-size: 22px; }
  .header h2 { font-size: 16px; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #1e3a5f; color: #fff; padding: 8px; text-align: right; }
  td { padding: 6px 8px; border-bottom: 1px solid #ddd; }
  tr:nth-child(even) { background: #f5f5f5; }
  .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #666; border-top: 1px solid #000; padding-top: 8px; }
  @media print { body { padding: 12px; } @page { size: A4 landscape; margin: 10mm; } }
</style></head><body>
<div class="header">
  <div style="font-size:12px">شركة جوهرة السلمان العقارية</div>
  <h1>شركة جوهرة السلمان العقارية</h1>
  <h2>كشف إيجارات شهر ${month} ${year}</h2>
  <div style="font-size:11px;color:#666;margin-top:4px">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-KW')}</div>
</div>

<table>
  <thead><tr>
    <th>الشقة</th><th>الدور</th><th>المستأجر</th><th>الإيجار</th><th>المدفوع</th><th>تاريخ الدفع</th><th>الحالة</th>
  </tr></thead>
  <tbody>${rows}</tbody>
  <tfoot><tr style="background:#1e3a5f;color:#fff;font-weight:700">
    <td colspan="3">الإجمالي</td>
    <td>${totalExpected}</td>
    <td>${totalCollected}</td>
    <td colspan="2">${paidIds.size} من ${tenants.length} مستأجر</td>
  </tr></tfoot>
</table>

<div class="footer">شركة جوهرة السلمان العقارية</div>
<script>setTimeout(()=>window.print(),500)</script>
</body></html>`);
  w.document.close();
}

export function printContract(tenant: Tenant) {
  const apt = getApartments().find(a => a.id === tenant.apartmentId);
  const today = new Date();
  const dayName = today.toLocaleDateString('ar-KW', { weekday: 'long' });
  const dateStr = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
  const leaseStartFmt = tenant.leaseStart || '          -          -          ';
  const leaseEndFmt = tenant.leaseEnd || '          -          -          ';

  const w = window.open('', '_blank', 'width=850,height=1100');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<title>عقد ايجار - ${tenant.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Traditional Arabic', 'Simplified Arabic', 'Segoe UI', Arial, sans-serif;
    padding: 12px 25px; color: #000; direction: rtl; max-width: 850px; margin: 0 auto;
    line-height: 1.5; font-size: 11px;
  }
  .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
  .header-right { text-align: right; font-size: 12px; }
  .header-right div:first-child { font-weight: 700; font-size: 14px; }
  .header-center { text-align: center; }
  .header-center .title { font-weight: 700; font-size: 16px; }
  .header-center .title-en { font-size: 11px; }
  .header-left { text-align: left; font-size: 10px; }
  .header-left div:first-child { font-weight: 700; font-size: 11px; }
  .date-row { text-align: right; font-size: 11px; margin: 3px 0; }
  .date-row b { font-size: 12px; }
  .party-section { display: flex; justify-content: space-between; margin: 3px 0; font-size: 11px; }
  .party-right { text-align: right; width: 48%; }
  .party-left { text-align: right; width: 48%; }
  .center-text { text-align: center; font-weight: 700; font-size: 11px; margin: 3px 0; }
  .field-line { font-size: 11px; margin: 1px 0; }
  .field-line b { font-weight: 700; }
  .property-line { font-size: 11px; margin: 4px 0; line-height: 1.5; }
  .clause { margin-bottom: 0; text-align: justify; font-size: 10px; line-height: 1.45; }
  .clause b { font-weight: 700; }
  .signatures { display: flex; justify-content: space-between; margin-top: 12px; }
  .sig-block { text-align: center; width: 42%; }
  .sig-block .title { font-weight: 700; font-size: 11px; }
  .sig-block .sub { font-size: 10px; }
  .sig-block .name { font-size: 10px; margin-top: 1px; }
  .sig-dots { margin-top: 20px; font-size: 11px; letter-spacing: 2px; }
  .extra-dots { margin-top: 10px; text-align: center; font-size: 11px; letter-spacing: 2px; }
  @media print { body { padding: 8px 20px; } .clause { font-size: 9.5px; } @page { size: A4; margin: 6mm; } }
</style></head><body>

<!-- Header -->
<div class="header-row">
  <div class="header-right">
    <div>شركة جوهرة السلمان العقارية</div>
    <div>عقار / رضا و عباس السلمان</div>
  </div>
  <div class="header-center">
    <div class="title">عقد ايجار</div>
    <div class="title-en">Rent Contract</div>
  </div>
  <div class="header-left">
    <div>Jawhart Al-Salman Real Estate</div>
    <div>Company</div>
    <div>Real Estate / Redha & Abbas AlSalman</div>
  </div>
</div>

<!-- Date -->
<div class="date-row">
  في الكويت اليوم : &nbsp;<b>${dayName}</b>&nbsp; الموافق : &nbsp;<b>${dateStr}</b>
</div>

<!-- Parties -->
<div class="party-section">
  <div class="party-right">
    <div class="field-line"><b>الطرف الأول ( المؤجر ) :</b></div>
    <div class="field-line">السادة / شركة جوهرة السلمان العقارية</div>
    <div class="field-line">رقم السجل التجاري : <b>479748</b></div>
    <div class="field-line">يمثلها السيد / رضا محمد احمد السلمان</div>
  </div>
  <div class="party-left">
    <div class="center-text" style="text-align:center">تحرر وتم الاتفاق بين كل من الطرفين</div>
    <div class="field-line"><b>الطرف الثاني ( المستأجر ) :</b> &nbsp; <b style="font-size:15px">${tenant.name}</b></div>
    <div class="field-line"><b>الرقم المدني :</b> &nbsp; <b>${tenant.civilId || '                    '}</b></div>
    <div class="field-line"><b>الجنسية :</b> &nbsp; ${tenant.nationality || '                    '}</div>
    <div class="field-line"><b>المهنة :</b> &nbsp; ${tenant.profession || '                    '}</div>
    <div class="field-line"><b>رقم الهاتف :</b> &nbsp; <b>${tenant.phone || '                    '}</b></div>
  </div>
</div>

<!-- Property Description -->
<div class="property-line">
على ان يؤجر الطرف الأول للطرف الثاني ( العين ) الواقعة بمنطقة ( <b>حولي</b> ) قطعة رقم ( <b>11</b> ) شارع ( <b>179</b> ) قسيمة رقم ( <b>48</b> ) الدور <b>${tenant.floor}</b>
شقة رقم &nbsp;<b style="font-size:16px">${apt?.number || '      '}</b>&nbsp; كسكن خاص له ولعائلته وفق الشروط التالية:
</div>

<!-- Clauses -->
<div class="clause"><b>1.</b> مدة هذا العقد <b>${tenant.leaseDuration || 'سنة'}</b> يبدأ بتاريخ <b>${leaseStartFmt}</b> وينتهي بتاريخ <b>${leaseEndFmt}</b> وتتجدد تلقائيا لمدد مماثلة مالم يخطر أي من الطرفين الطرف الآخر بعدم رغبته في التجديد كتابة قبل انتهاء المدة بشهر على الأقل ، وعند حصول التنبيه بالإخلاء فانه يجب على المستأجر ان يسهل ويسمح بدخول كل من يرغب بمعاينة العين.</div>

<div class="clause"><b>2.</b> القيمة الايجارية الشهرية <b>K.D ${tenant.rentAmount}</b> تعتبر دينا مترصدا في ذمة الطرف الثاني محدد القيمة وواجب الوفاء.</div>

<div class="clause"><b>3.</b> يتعهد ويلتزم الطرف الثاني ( المستأجر ) بسداد الأجرة الشهرية قبل يوم 5 من كل شهر ميلادي.</div>

<div class="clause"><b>4.</b> يتعهد ويلتزم المستأجر بأن عدد الساكنين في العين محل هذا العقد لا يزيدون عن عدد (      ) شخص / أشخاص.</div>

<div class="clause"><b>5.</b> في حالة رغبة المستأجر بالإخلاء وإنهاء العقد عليه اعلام المؤجر خطيا قبل الاخلاء بمدة لا تقل عن شهر ويجب تسليم العين قبل تاريخ 25 من الشهر ، وفي حال التأخير وعدم الالتزام بتسليم العين المؤجرة بالموعد فيحتسب على الطرف الثاني ايجار الشهر الذي يليه.</div>

<div class="clause"><b>6.</b> يتعهد ويلتزم المستأجر بعدم الجلوس او التدخين بالمصاعد والممرات والسلالم ولا يحق له التخزين في اي مكان خارج العين المؤجرة او استخدامها كمخزن للأغراض أو المواد الملتهبة أو المضرة بالصحة وهو مسؤولا قبل المؤجر عن أي حريق يحدث نتيجة اهماله او تعديه ولا يحق للمستأجر اعتبار المؤجر مسؤولا عن تعدي الغير، وفي حالة المخالفة يحق للطرف الأول رمي أي أغراض خزنت خارج العين ولا يحق له المطالبة بتعويض ، كما يلتزم بعدم رمي الأوساخ خارج المكان المخصص لذلك وعدم استخدام مواقف السيارات بطريقة خاطئة.</div>

<div class="clause"><b>7.</b> اذا تأخر الطرف الثاني عن دفع القيمة الايجارية في ميعاد استحقاقها يفسخ العقد فورا من تلقاء نفسه دون الحاجة الى تنبيه او انذار وتعتبر يد المستأجر يد غاصب ويختص القضاء المستعجل بالحكم بصفة مستعجلة بطرده من العين وكذلك من حق المؤجر المطالبة بكامل قيمة العقد عن مدته الأصلية أو المحددة والتعويض الاتفاقي في البند الأول واستيفاء المستأجر لكافة التعويضات المصاريف المترتبة على الاخلاء.</div>

<div class="clause"><b>8.</b> يقر الطرف الثاني انه عاين العين محل العقد المعاينة التامة النافية للجهالة وقد وجدها على احسن حال ومستوفية لكل لوازمه التي تمكنه من الانتفاع بها.</div>

<div class="clause"><b>9.</b> يتعهد الطرف الثاني بالمحافظة على العين المؤجرة وتسليمها على حالتها كما استلمها ، وان لا يحدث أي تغيير سواء هدم أو بناء أو تمديدات كهربائية والستالايت الا بتصريح كتابي من الطرف الأول.</div>

<div class="clause"><b>10.</b> مصروفات رسوم الكهرباء والماء وبلدية الكويت يتحملها الطرف الاول ، كما يتحمل الطرف الثاني دفع أي زيادة أو إضافة في تسعيرة الخدمات التي تقدمها الجهات الحكومية أو الأهلية كزيادة رسوم مصروفات الماء والكهرباء والنظافة وضريبة القيمة المضافة وغيرها من الرسوم التي قد تفرض على العين المؤجرة وتعتبر هذه الزيادة جزأ من هذا العقد الماثل وتضاف على القيمة الايجارية المحددة والملزم بدفعها الطرف الثاني.</div>

<div class="clause"><b>11.</b> جميع المنقولات الموجودة بالعين المستأجرة ضامنة للأجرة المعقود عليها ولا يحق للمستأجر نقلها الا بعد الوفاء بالأجرة.</div>

<div class="clause"><b>12.</b> لا يحق للطرف الثاني التأجير بالباطن أو إيواء الغير أو التنازل عن المكان او جزء منه دون اخذ موافقة خطية من المؤجر ، مع دفع قيمة الايجار مقدما في حالة السفر ، كما ان الموكلون من الطرف الثاني بإدارة العين او القاطنين يعتبرون ضامنين متضامنين بدفع جميع المبالغ المستحقة من الايجار ولا يحق لهم تغيير حق السكن العائلي وذلك يعتبر مخالفة لبنود العقد.</div>

<div class="clause"><b>13.</b> يتعهد ويلتزم المستأجر بعدم الاضرار بالجيران وازعاجهم وان يحترم الشعائر والاحكام الإسلامية والعادات والتقاليد والأعراف في دولة الكويت ، ويكون مسؤولا عن تصرفاته الشخصية وعن تصرفات التابعين له ومن يكون قاطنا معه ، ويمنع منعا باتا ادخال أي نوع من الحيوانات داخل العقار.</div>

<div class="clause"><b>14.</b> في حال عدم التزام الطرف الثاني بسداد الأجرة الشهرية ، يلتزم الطرف الثاني بدفع مبلغ 200 دينار كويتي للطرف الأول وذلك نظير الرسوم الإدارية واتعاب المحاماة.</div>

<div class="clause"><b>15.</b> يتعهد ويلتزم الطرف الثاني بجميع ما ذكر بالعقد حتى في حال تعطيل الدوامات في القطاع الحكومي أو الأهلي أو نشوب كوارث طبيعية أو حروب أو ظروف خارجة عن الإرادة أو حالات صحية أو الانقطاع أو التضرر الكلي أو الجزئي في وظيفة وعمل الطرف الثاني.</div>

<div class="clause"><b>16.</b> في حال مخالفة الطرف الثاني لأي بند من البنود المذكورة في هذا الاتفاق ، يعتبر العقد مفسوخا من تلقاء نفسه دون الرجوع اليه ، ويحق للطرف الأول المطالبة بتعويض عن الأضرار التي نتجت عن ذلك.</div>

<div class="clause"><b>17.</b> يقر المستأجر بانه يتخذ العين موضوع العقد محلا مختارا له المبين عنوانها كذلك ( البريد الالكتروني ) ورقم الهاتف المسجل في صدر هذا العقد ، وكل اعلان يرسل له عن طريق البريد الالكتروني ورقم الهاتف او عنوان السكن أو أي وسيلة تقرها دولة الكويت يعتبر قانونيا.</div>

<div class="clause"><b>18.</b> يدفع المستأجر مبلغ 5 دنانير كويتي للمشرف الفني على العمارة مع دفع الأجرة الشهرية وذلك نظير قيامه بتنظيف العمارة ورمي القمامة.</div>

<div class="clause"><b>19.</b> كل مالم يرد به اتفاق في هذا العقد يخضع لقانون الإيجارات بدولة الكويت ، وتختص المحاكم الكويتية بالفصل في المنازعات الناشئة عن تنفيذ هذا العقد.</div>

<div class="clause"><b>20.</b> حرر هذا العقد من نسختين بيد كل طرف نسخة للعمل بموجبها.</div>

<!-- Signatures -->
<div class="signatures">
  <div class="sig-block">
    <div class="title">الطرف الأول</div>
    <div class="sub">( المؤجر )</div>
    <div class="name">شركة جوهرة السلمان العقارية</div>
    <div class="sig-dots">.................................................</div>
  </div>
  <div class="sig-block">
    <div class="title">الطرف الأول</div>
    <div class="sub">( المستأجر )</div>
    <div class="sig-dots">.................................................</div>
  </div>
</div>

<div class="extra-dots" style="display:flex;justify-content:space-between;margin-top:20px">
  <div>.................................................</div>
  <div>.................................................</div>
</div>

<script>setTimeout(()=>window.print(),500)</script>
</body></html>`);
  w.document.close();
}

export function printEvictionNotice(tenant: Tenant) {
  const apt = getApartments().find(a => a.id === tenant.apartmentId);
  const w = window.open('', '_blank', 'width=800,height=900');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<title>طلب إخلاء - ${tenant.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Traditional Arabic', 'Simplified Arabic', 'Segoe UI', Arial, sans-serif;
    padding: 40px 50px; color: #000; direction: rtl; max-width: 800px; margin: 0 auto;
    line-height: 2; font-size: 15px;
  }
  .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
  .header-right { text-align: right; font-size: 15px; line-height: 1.7; }
  .header-right div:first-child { font-weight: 700; font-size: 17px; }
  .header-left { text-align: left; font-size: 13px; line-height: 1.7; }
  .header-left div:first-child { font-weight: 700; font-size: 14px; }
  .title-section { text-align: center; margin: 10px 0; }
  .title-section h1 { font-size: 22px; font-weight: 700; }
  .red-line { border: none; border-top: 3px solid #c00; margin: 6px auto; width: 60%; }
  .date-line { text-align: right; font-size: 14px; margin: 12px 0; }
  .subject { text-align: center; font-weight: 700; font-size: 16px; margin: 16px 0 12px; text-decoration: underline; }
  .body-text { font-size: 15px; line-height: 2.2; text-align: justify; }
  .body-text b { font-weight: 700; }
  .dotted { border-bottom: 1px dotted #000; display: inline-block; min-width: 150px; text-align: center; }
  .sig-section { margin-top: 50px; }
  .sig-row { display: flex; justify-content: flex-start; gap: 80px; margin-bottom: 10px; font-size: 14px; }
  .sig-label { font-weight: 700; white-space: nowrap; min-width: 100px; }
  .sig-value { border-bottom: 1px dotted #000; flex: 1; min-width: 200px; }
  @media print { body { padding: 30px 40px; } @page { size: A4; margin: 15mm; } }
</style></head><body>

<!-- Header -->
<div class="header-row">
  <div class="header-right">
    <div>شركة جوهرة السلمان العقارية</div>
    <div>عقار السادة / رضا وعباس السلمان</div>
  </div>
  <div class="header-left">
    <div>Jawhart Al-Salman Real Estate</div>
    <div>Company</div>
  </div>
</div>

<!-- Title -->
<div class="title-section">
  <h1>طلب إخلاء</h1>
  <hr class="red-line">
</div>

<!-- Date -->
<div class="date-line">
  في الكويت &nbsp;&nbsp;&nbsp;&nbsp; تاريخ : &nbsp; <span class="dotted">&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
</div>

<!-- Subject -->
<div class="subject">الموضوع : إقرار إخلاء وتسليم العين المؤجرة</div>

<!-- Body -->
<div class="body-text">
  <p>أقر وأتعهد انا : <b>${tenant.name}</b></p>
  <p>أحمل بطاقة مدنية رقم : <b>${tenant.civilId || '                              '}</b></p>
  <p>إقرارا نافيا للجهالة وغير قابل للعدول بإخلاء العين المؤجرة رقم <b>${apt?.number || '      '}</b> الدور <b>${tenant.floor}</b> بالعقار الكائن</p>
  <p>بمنطقة <b>حولي</b> قسيمة رقم <b>48</b> بتاريخ : <span class="dotted">&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>
  <br>
  <p>وتسليم العين المؤجرة خالية من الشواغل والأشخاص ، مع تسليم براءة ذمة من وزارة الكهرباء والماء للعين المؤجرة.</p>
</div>

<!-- Signature fields -->
<div class="sig-section">
  <div class="sig-row">
    <span class="sig-label">الاسم :</span>
    <span class="sig-value">&nbsp;</span>
  </div>
  <div class="sig-row">
    <span class="sig-label">الرقم المدني :</span>
    <span class="sig-value">&nbsp;</span>
  </div>
  <div class="sig-row">
    <span class="sig-label">التاريخ :</span>
    <span class="sig-value">&nbsp;</span>
  </div>
  <div class="sig-row">
    <span class="sig-label">التوقيع :</span>
    <span class="sig-value">&nbsp;</span>
  </div>
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
  const generalExp = monthExpenses.filter(e => e.type === 'general');
  const electricityExp = monthExpenses.filter(e => e.type === 'electricity');
  const salaryExp = monthExpenses.filter(e => e.type === 'salary');
  const totalGeneral = generalExp.reduce((s, e) => s + e.amount, 0);
  const totalElectricity = electricityExp.reduce((s, e) => s + e.amount, 0);
  const totalSalaries = salaryExp.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = totalGeneral + totalElectricity + totalSalaries;
  const netProfit = totalRent - totalExpenses;
  const share = netProfit / 2;

  const w = window.open('', '_blank', 'width=700,height=900');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<title>كشف مالي - ${month} ${year}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Traditional Arabic', 'Simplified Arabic', -apple-system, 'Segoe UI', Arial, sans-serif; padding: 32px; color: #000; direction: rtl; max-width: 700px; margin: 0 auto; }
  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
  .header h1 { font-size: 20px; }
  .header h2 { font-size: 16px; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: right; font-size: 13px; }
  td { padding: 6px 10px; border-bottom: 1px solid #ddd; font-size: 13px; }
  .section { background: #eee; font-weight: 600; }
  .total { background: #e8eef6; font-weight: 700; }
  .profit { background: #e6f7e6; font-weight: 700; font-size: 15px; }
  .loss { background: #fde8ea; font-weight: 700; font-size: 15px; }
  .share-box { margin-top: 16px; padding: 12px; border: 1px solid #ddd; }
  .share-box h3 { font-size: 14px; margin-bottom: 8px; }
  .share-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
  .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #666; border-top: 1px solid #000; padding-top: 8px; }
  @media print { body { padding: 20px; } @page { size: A4; margin: 15mm; } }
</style></head><body>
<div class="header">
  <div style="font-size:12px">شركة جوهرة السلمان العقارية</div>
  <h1>شركة جوهرة السلمان العقارية</h1>
  <h2>الكشف المالي — ${month} ${year}</h2>
</div>

<table>
  <thead><tr><th>البيان</th><th>المبلغ (د.ك)</th></tr></thead>
  <tbody>
    <tr class="total"><td>إجمالي الإيجارات الشهرية</td><td>${totalRent.toLocaleString()}</td></tr>
    <tr class="section"><td colspan="2">المصروفات العامة</td></tr>
    ${generalExp.map(e => `<tr><td style="padding-right:20px">${e.description}</td><td>${e.amount.toLocaleString()}</td></tr>`).join('') || '<tr><td colspan="2" style="color:#888">—</td></tr>'}
    <tr class="section"><td colspan="2">الكهرباء</td></tr>
    ${electricityExp.map(e => `<tr><td style="padding-right:20px">${e.description}</td><td>${e.amount.toLocaleString()}</td></tr>`).join('') || '<tr><td colspan="2" style="color:#888">—</td></tr>'}
    <tr class="section"><td colspan="2">الرواتب</td></tr>
    ${salaryExp.map(e => `<tr><td style="padding-right:20px">${e.description}</td><td>${e.amount.toLocaleString()}</td></tr>`).join('') || '<tr><td colspan="2" style="color:#888">—</td></tr>'}
    <tr class="total"><td>إجمالي المصروفات</td><td>${totalExpenses.toLocaleString()}</td></tr>
    <tr class="${netProfit >= 0 ? 'profit' : 'loss'}"><td>صافي الربح</td><td>${netProfit.toLocaleString()}</td></tr>
  </tbody>
</table>

<div class="share-box">
  <h3>توزيع الأرباح (50/50)</h3>
  <div class="share-row"><span>حصة رضا السلمان</span><span style="font-weight:700">${share.toLocaleString()} د.ك</span></div>
  <div class="share-row"><span>حصة عباس السلمان</span><span style="font-weight:700">${share.toLocaleString()} د.ك</span></div>
</div>

<div class="footer">شركة جوهرة السلمان العقارية</div>
<script>setTimeout(()=>window.print(),500)</script>
</body></html>`);
  w.document.close();
}

export function printAllReceipts(
  tenants: Tenant[],
  payments: Payment[],
  month: string,
  year: number,
) {
  const apartments = getApartments();

  const receiptHtml = (tenant: Tenant, pmt: Payment | undefined) => {
    const apt = apartments.find(a => a.id === tenant.apartmentId);
    const amount = pmt ? pmt.amount : tenant.rentAmount;
    const amountWords = amountToArabicWords(amount);
    const dinar = Math.floor(amount);
    const fils = Math.round((amount - dinar) * 1000);
    const payDate = pmt ? pmt.date : '';
    const isCash = pmt ? pmt.method === 'نقدا' : true;
    const method = pmt ? pmt.method : '';

    return `<div class="receipt">
  <table class="header-table" style="margin-bottom:8px;width:100%">
    <tr>
      <td style="text-align:right;width:35%;font-size:11px;line-height:1.5">
        <div style="font-weight:700;font-size:13px">شركة جوهرة السلمان العقارية</div>
        <div>عقار / رضا و عباس السلمان</div>
      </td>
      <td style="text-align:center;width:30%">
        <div style="font-weight:700;font-size:17px;color:#c00">وصل ايجار</div>
        <div style="font-size:11px">Rent Voucher</div>
      </td>
      <td style="text-align:left;width:35%;font-size:10px;line-height:1.5">
        <div style="font-weight:700;font-size:11px">Jawhart Al-Salman Real Estate Company</div>
        <div>Real Estate / Redha, Abbas AlSalman</div>
      </td>
    </tr>
  </table>
  <table class="header-table" style="margin-bottom:8px;width:100%">
    <tr>
      <td style="text-align:right;width:50%">
        <span class="amount-box" style="margin-left:3px">${fils || ''}</span>
        <span style="font-weight:700;margin:0 3px">فلس</span>
        <span class="amount-box" style="margin-left:3px">${dinar}</span>
        <span style="font-weight:700;margin:0 3px">دينار</span>
      </td>
      <td style="text-align:left;width:50%">
        <span style="font-weight:700;font-size:13px">${payDate}</span>
        <span style="font-weight:700;margin-right:6px;border:2px solid #000;padding:2px 8px">التاريخ</span>
      </td>
    </tr>
  </table>
  <table class="main-table">
    <tr>
      <td class="lbl" style="text-align:left;font-size:10px">Received From</td>
      <td class="val" style="font-weight:700;font-size:13px">${tenant.name}</td>
      <td class="lbl">وصلنا من السيد / السادة</td>
    </tr>
    <tr>
      <td class="lbl" style="text-align:left;font-size:10px">The Sum of K.D</td>
      <td class="val" style="font-size:11px">${amountWords}</td>
      <td class="lbl">مبلغ وقدره</td>
    </tr>
    <tr>
      <td class="lbl" style="text-align:left;font-size:10px">Bank</td>
      <td style="padding:0">
        <table style="width:100%;border:none">
          <tr>
            <td style="border:none;border-left:1.5px solid #000;width:50%">${!isCash && pmt ? (pmt.notes || '') : ''}</td>
            <td style="border:none;border-left:1.5px solid #000;width:15%;text-align:center;font-size:10px">على بنك</td>
            <td style="border:none;border-left:1.5px solid #000;width:15%;text-align:center;font-size:10px">Cash / Cheque No</td>
            <td style="border:none;width:20%;text-align:center;font-weight:700">${isCash ? 'نقدا' : method}</td>
          </tr>
        </table>
      </td>
      <td class="lbl">نقدا / شيك رقم</td>
    </tr>
    <tr>
      <td class="lbl" style="text-align:left;font-size:10px">Of Rent</td>
      <td class="val" style="font-weight:700;font-size:13px">${apt?.number || '-'}</td>
      <td class="lbl">وذلك عن ايجار</td>
    </tr>
    <tr>
      <td class="lbl" style="text-align:left;font-size:10px">Month Of</td>
      <td class="val" style="font-weight:700">${month} ${year}</td>
      <td class="lbl">عن شهر</td>
    </tr>
  </table>
  <div style="margin-top:20px;text-align:right;padding-right:30px">
    <div style="font-weight:700;font-size:13px">توقيع المستلم</div>
    <div style="margin-top:4px;font-size:14px;letter-spacing:3px">..............................</div>
  </div>
</div>`;
  };

  const allReceipts = tenants.map(t => {
    const pmt = payments.find(p => p.tenantId === t.id);
    return receiptHtml(t, pmt);
  });

  const pages: string[] = [];
  for (let i = 0; i < allReceipts.length; i += 2) {
    const r1 = allReceipts[i];
    const r2 = allReceipts[i + 1] || '<div class="receipt empty"></div>';
    pages.push(`<div class="page">${r1}<div class="divider"></div>${r2}</div>`);
  }

  const w = window.open('', '_blank', 'width=800,height=1100');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<title>جميع الوصولات - ${month} ${year}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Traditional Arabic', 'Simplified Arabic', 'Segoe UI', Arial, sans-serif; color: #000; direction: rtl; font-size: 12px; }
  .page { width: 100%; }
  .receipt { height: 130mm; padding: 12px 25px; overflow: hidden; box-sizing: border-box; }
  .divider { border-top: 1px dashed #999; margin: 1mm 0; }
  table { width: 100%; border-collapse: collapse; }
  .header-table td { border: none; padding: 2px 6px; }
  .main-table td, .main-table th { border: 1.5px solid #000; padding: 4px 8px; vertical-align: middle; }
  .lbl { font-weight: 700; white-space: nowrap; width: 1%; font-size: 12px; }
  .val { min-width: 60px; }
  .amount-box { border: 2px solid #000; padding: 2px 10px; display: inline-block; min-width: 50px; text-align: center; font-weight: 700; font-size: 14px; }
  @media print {
    body { padding: 0; margin: 0; }
    .page { page-break-after: always; }
    .page:last-child { page-break-after: avoid; }
    @page { size: A4; margin: 10mm; }
  }
</style></head><body>
${pages.join('')}
<script>setTimeout(()=>window.print(),500)</script>
</body></html>`);
  w.document.close();
}
