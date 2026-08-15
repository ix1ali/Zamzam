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
      <td style="color:${pmt ? '#000' : '#c00'}">${pmt ? 'مدفوع' : 'غير مدفوع'}</td>
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
  <h1>عمارة زمزم</h1>
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

<div class="footer">عمارة زمزم — شركة جوهرة السلمان العقارية</div>
<script>setTimeout(()=>window.print(),500)</script>
</body></html>`);
  w.document.close();
}

export function printContract(tenant: Tenant) {
  const apt = getApartments().find(a => a.id === tenant.apartmentId);
  const today = new Date();
  const dateStr = today.toLocaleDateString('ar-KW', { year: 'numeric', month: 'long', day: 'numeric' });

  const w = window.open('', '_blank', 'width=800,height=1100');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<title>عقد إيجار - ${tenant.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Traditional Arabic', 'Simplified Arabic', 'Segoe UI', Arial, sans-serif;
    padding: 40px 50px; color: #000; direction: rtl; max-width: 800px; margin: 0 auto;
    line-height: 2; font-size: 14px;
  }
  .header { text-align: center; margin-bottom: 16px; }
  .header .company { font-size: 13px; }
  .header h2 { font-size: 22px; font-weight: 700; margin: 8px 0; text-decoration: underline; }
  .fields { margin: 12px 0 16px; }
  .field-row { margin-bottom: 6px; font-size: 14px; }
  .field-row .lbl { font-weight: 700; }
  .field-row .val { border-bottom: 1px dotted #000; padding: 0 8px; }
  .clause { margin-bottom: 6px; text-align: justify; font-size: 13px; line-height: 1.9; }
  .clause-num { font-weight: 700; }
  .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
  .sig-block { text-align: center; width: 42%; }
  .sig-block .title { font-weight: 700; font-size: 14px; }
  .sig-block .sub { font-size: 12px; margin: 2px 0; }
  .sig-block .name { font-size: 13px; margin-top: 4px; }
  .sig-block .line { border-top: 1px solid #000; margin-top: 50px; padding-top: 4px; font-size: 12px; }
  .date-line { text-align: center; margin-top: 16px; font-size: 13px; }
  @media print { body { padding: 25px 35px; font-size: 13px; } .clause { font-size: 12px; } @page { size: A4; margin: 12mm; } }
</style></head><body>

<div class="header">
  <div class="company">Real Estate / Redha & Abbas AlSalman</div>
  <div class="company">شركة جوهرة السلمان العقارية</div>
  <h2>عقد إيجار</h2>
</div>

<div class="fields">
  <div class="field-row">
    <span class="lbl">الرقم المدني :</span>
    <span class="val">${tenant.civilId || '                              '}</span>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span class="lbl">رقم الهاتف :</span>
    <span class="val">${tenant.phone || '                              '}</span>
  </div>
  <div class="field-row">
    <span class="lbl">القيمة الايجارية الشهرية :</span>
    <span class="val">${tenant.rentAmount}</span>
    <span> K.D</span>
  </div>
  <div class="field-row">
    <span class="lbl">اسم المستأجر :</span>
    <span class="val">${tenant.name}</span>
  </div>
  <div class="field-row">
    <span class="lbl">الشقة :</span>
    <span class="val">${apt?.number || '     '}</span>
    &nbsp;&nbsp;
    <span class="lbl">الدور :</span>
    <span class="val">${tenant.floor}</span>
  </div>
  <div class="field-row">
    <span class="lbl">بداية العقد :</span>
    <span class="val">${tenant.leaseStart || '          /          /          '}</span>
    &nbsp;&nbsp;
    <span class="lbl">نهاية العقد :</span>
    <span class="val">${tenant.leaseEnd || '          /          /          '}</span>
    &nbsp;&nbsp;
    <span class="lbl">المدة :</span>
    <span class="val">${tenant.leaseDuration || '              '}</span>
  </div>
</div>

<div class="clauses">

<div class="clause"><span class="clause-num">1- </span>يتعهد ويلتزم المستأجر بأن عدد الساكنين في العين محل هذا العقد لا يزيدون عن عدد (      )  شخص / أشخاص.</div>

<div class="clause"><span class="clause-num">2- </span>في حالة رغبة المستأجر بالإخلاء وإنهاء العقد عليه اعلام المؤجر خطيا قبل الاخلاء بمدة لا تقل عن شهر ويجب تسليم العين قبل تاريخ 25 من الشهر ، وفي حال التأخير وعدم الالتزام بتسليم العين المؤجرة بالموعد فيحتسب على الطرف الثاني ايجار الشهر الذي يليه.</div>

<div class="clause"><span class="clause-num">3- </span>يتعهد ويلتزم المستأجر بعدم الجلوس او التدخين بالمصاعد والممرات والسلالم ولا يحق له التخزين في اي مكان خارج العين المؤجرة او استخدامها كمخزن للأغراض أو المواد الملتهبة أو المضرة بالصحة وهو مسؤولا قبل المؤجر عن أي حريق يحدث نتيجة اهماله او تعديه ولا يحق للمستأجر اعتبار المؤجر مسؤولا عن تعدي الغير، وفي حالة المخالفة يحق للطرف الأول رمي أي أغراض خزنت خارج العين ولا يحق له المطالبة بتعويض ، كما يلتزم بعدم رمي الأوساخ خارج المكان المخصص لذلك وعدم استخدام مواقف السيارات بطريقة خاطئة.</div>

<div class="clause"><span class="clause-num">4- </span>اذا تأخر الطرف الثاني عن دفع القيمة الايجارية في ميعاد استحقاقها يفسخ العقد فورا من تلقاء نفسه دون الحاجة الى تنبيه او انذار وتعتبر يد المستأجر يد غاصب ويختص القضاء المستعجل بالحكم بصفة مستعجلة بطرده من العين وكذلك من حق المؤجر المطالبة بكامل قيمة العقد عن مدته الأصلية أو المحددة والتعويض الاتفاقي في البند الأول واستيفاء المستأجر لكافة التعويضات المصاريف المترتبة على الاخلاء.</div>

<div class="clause"><span class="clause-num">5- </span>يقر الطرف الثاني انه عاين العين محل العقد المعاينة التامة النافية للجهالة وقد وجدها على احسن حال ومستوفية لكل لوازمه التي تمكنه من الانتفاع بها.</div>

<div class="clause"><span class="clause-num">6- </span>يتعهد الطرف الثاني بالمحافظة على العين المؤجرة وتسليمها على حالتها كما استلمها ، وان لا يحدث أي تغيير سواء هدم أو بناء أو تمديدات كهربائية والستالايت الا بتصريح كتابي من الطرف الأول.</div>

<div class="clause"><span class="clause-num">7- </span>مصروفات رسوم الكهرباء والماء وبلدية الكويت يتحملها الطرف الاول ، كما يتحمل الطرف الثاني دفع أي زيادة أو إضافة في تسعيرة الخدمات التي تقدمها الجهات الحكومية أو الأهلية كزيادة رسوم مصروفات الماء والكهرباء والنظافة وضريبة القيمة المضافة وغيرها من الرسوم التي قد تفرض على العين المؤجرة وتعتبر هذه الزيادة جزأ من هذا العقد الماثل وتضاف على القيمة الايجارية المحددة والملزم بدفعها الطرف الثاني.</div>

<div class="clause"><span class="clause-num">8- </span>جميع المنقولات الموجودة بالعين المستأجرة ضامنة للأجرة المعقود عليها ولا يحق للمستأجر نقلها الا بعد الوفاء بالأجرة.</div>

<div class="clause"><span class="clause-num">9- </span>لا يحق للطرف الثاني التأجير بالباطن أو إيواء الغير أو التنازل عن المكان او جزء منه دون اخذ موافقة خطية من المؤجر ، مع دفع قيمة الايجار مقدما في حالة السفر ، كما ان الموكلون من الطرف الثاني بإدارة العين او القاطنين يعتبرون ضامنين متضامنين بدفع جميع المبالغ المستحقة من الايجار ولا يحق لهم تغيير حق السكن العائلي وذلك يعتبر مخالفة لبنود العقد.</div>

<div class="clause"><span class="clause-num">10- </span>يتعهد ويلتزم المستأجر بعدم الاضرار بالجيران وازعاجهم وان يحترم الشعائر والاحكام الإسلامية والعادات والتقاليد والأعراف في دولة الكويت ، ويكون مسؤولا عن تصرفاته الشخصية وعن تصرفات التابعين له ومن يكون قاطنا معه ، ويمنع منعا باتا ادخال أي نوع من الحيوانات داخل العقار.</div>

<div class="clause"><span class="clause-num">11- </span>في حال عدم التزام الطرف الثاني بسداد الأجرة الشهرية ، يلتزم الطرف الثاني بدفع مبلغ 200 دينار كويتي للطرف الأول وذلك نظير الرسوم الإدارية واتعاب المحاماة.</div>

<div class="clause"><span class="clause-num">12- </span>يتعهد ويلتزم الطرف الثاني بجميع ما ذكر بالعقد حتى في حال تعطيل الدوامات في القطاع الحكومي أو الأهلي أو نشوب كوارث طبيعية أو حروب أو ظروف خارجة عن الإرادة أو حالات صحية أو الانقطاع أو التضرر الكلي أو الجزئي في وظيفة وعمل الطرف الثاني.</div>

<div class="clause"><span class="clause-num">13- </span>في حال مخالفة الطرف الثاني لأي بند من البنود المذكورة في هذا الاتفاق ، يعتبر العقد مفسوخا من تلقاء نفسه دون الرجوع اليه ، ويحق للطرف الأول المطالبة بتعويض عن الأضرار التي نتجت عن ذلك.</div>

<div class="clause"><span class="clause-num">14- </span>يقر المستأجر بانه يتخذ العين موضوع العقد محلا مختارا له المبين عنوانها كذلك ( البريد الالكتروني ) ورقم الهاتف المسجل في صدر هذا العقد ، وكل اعلان يرسل له عن طريق البريد الالكتروني ورقم الهاتف او عنوان السكن أو أي وسيلة تقرها دولة الكويت يعتبر قانونيا.</div>

<div class="clause"><span class="clause-num">15- </span>يدفع المستأجر مبلغ 5 دنانير كويتي للمشرف الفني على العمارة مع دفع الأجرة الشهرية وذلك نظير قيامه بتنظيف العمارة ورمي القمامة.</div>

<div class="clause"><span class="clause-num">16- </span>كل مالم يرد به اتفاق في هذا العقد يخضع لقانون الإيجارات بدولة الكويت ، وتختص المحاكم الكويتية بالفصل في المنازعات الناشئة عن تنفيذ هذا العقد.</div>

<div class="clause" style="margin-top:4px">حرر هذا العقد من نسختين بيد كل طرف نسخة للعمل بموجبها.</div>

</div>

<div class="date-line">التاريخ: ${dateStr}</div>

<div class="signatures">
  <div class="sig-block">
    <div class="title">الطرف الأول</div>
    <div class="sub">( المؤجر )</div>
    <div class="name">شركة جوهرة السلمان العقارية</div>
    <div class="line">......................................................</div>
  </div>
  <div class="sig-block">
    <div class="title">الطرف الثاني</div>
    <div class="sub">( المستأجر )</div>
    <div class="name">${tenant.name}</div>
    <div class="line">......................................................</div>
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
  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 20px; }
  .header h1 { font-size: 20px; }
  .header h2 { font-size: 18px; margin-top: 8px; }
  .content { font-size: 15px; }
  .sig { display: flex; justify-content: space-between; margin-top: 50px; }
  .sig div { text-align: center; width: 40%; }
  .sig .line { border-top: 1px solid #000; margin-top: 50px; padding-top: 4px; font-size: 12px; }
  @media print { body { padding: 30px 40px; } @page { size: A4; margin: 15mm; } }
</style></head><body>
<div class="header">
  <div style="font-size:12px">شركة جوهرة السلمان العقارية</div>
  <h1>عمارة زمزم</h1>
  <h2>طلب إخلاء</h2>
</div>
<div class="content">
  <p>التاريخ: ${new Date().toLocaleDateString('ar-KW')}</p>
  <br>
  <p>السيد/ة: <strong>${tenant.name}</strong></p>
  <p>الرقم المدني: <strong>${tenant.civilId || '_______________'}</strong></p>
  <p>المستأجر في الشقة رقم: <strong>${apt?.number || '-'}</strong> — الدور: <strong>${tenant.floor}</strong></p>
  <br>
  <p>نحيطكم علماً بأنه يتعين عليكم إخلاء الشقة المذكورة أعلاه وذلك بسبب:</p>
  <p style="border-bottom:1px dotted #000;padding-bottom:30px;margin-top:10px">............................................................................</p>
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
  <h1>عمارة زمزم</h1>
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
  <div class="share-row"><span>الطرف الأول</span><span style="font-weight:700">${share.toLocaleString()} د.ك</span></div>
  <div class="share-row"><span>الطرف الثاني</span><span style="font-weight:700">${share.toLocaleString()} د.ك</span></div>
</div>

<div class="footer">عمارة زمزم — شركة جوهرة السلمان العقارية</div>
<script>setTimeout(()=>window.print(),500)</script>
</body></html>`);
  w.document.close();
}
