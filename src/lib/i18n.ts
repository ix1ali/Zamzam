export type Lang = 'en' | 'ar';

const LANG_KEY = 'zamzam_lang';

export function getLang(): Lang {
  return 'ar';
}

export function setLangPref(lang: Lang) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
}

export function applyLangDir(lang: Lang) {
  if (typeof document === 'undefined') return;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
}

export const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
export const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function getMonths(lang: Lang): string[] {
  return lang === 'ar' ? monthsAr : monthsEn;
}

const s: Record<string, { en: string; ar: string }> = {
  // Common
  kwd: { en: 'KWD', ar: 'د.ك' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  delete: { en: 'Delete', ar: 'حذف' },
  edit: { en: 'Edit', ar: 'تعديل' },
  add: { en: 'Add', ar: 'إضافة' },
  search: { en: 'Search', ar: 'بحث' },
  print: { en: 'Print', ar: 'طباعة' },
  close: { en: 'Close', ar: 'إغلاق' },
  confirm: { en: 'Confirm', ar: 'تأكيد' },
  notes: { en: 'Notes', ar: 'ملاحظات' },
  noResults: { en: 'No results', ar: 'لا توجد نتائج' },
  viewAll: { en: 'View All', ar: 'عرض الكل' },
  days: { en: 'days', ar: 'يوم' },
  apt: { en: 'Apt', ar: 'شقة' },
  update: { en: 'Update', ar: 'تحديث' },

  // Nav
  navHome: { en: 'Home', ar: 'الرئيسية' },
  navApartments: { en: 'Apartments', ar: 'الشقق' },
  navFinancial: { en: 'Financial', ar: 'المالية' },
  navSettings: { en: 'Settings', ar: 'الإعدادات' },

  // Dashboard
  companyName: { en: 'Jawhart Al-Salman Real Estate', ar: 'شركة جوهرة السلمان العقارية' },
  occupancyRate: { en: 'Occupancy Rate', ar: 'نسبة الإشغال' },
  monthlyCollection: { en: 'Monthly Collection', ar: 'التحصيل الشهري' },
  occupied: { en: 'Occupied', ar: 'مشغولة' },
  vacant: { en: 'Vacant', ar: 'شاغرة' },
  flagged: { en: 'Flagged', ar: 'معلّمة' },
  tenants: { en: 'Tenants', ar: 'مستأجرين' },
  monthlyRevenue: { en: 'Monthly Revenue', ar: 'الإيرادات الشهرية' },
  paid: { en: 'Paid', ar: 'دفعوا' },
  unpaid: { en: 'Unpaid', ar: 'لم يدفعوا' },
  collectionLast6: { en: 'Collection - Last 6 Months', ar: 'التحصيل - آخر 6 أشهر' },
  quickActions: { en: 'Quick Actions', ar: 'إجراءات سريعة' },
  newTenant: { en: 'New Tenant', ar: 'مستأجر جديد' },
  rentReceipt: { en: 'Rent Receipt', ar: 'وصل إيجار' },
  financialStatement: { en: 'Financial Statement', ar: 'الكشف المالي' },
  expiredContracts: { en: 'Expired Contracts', ar: 'عقود منتهية' },
  expiringSoon: { en: 'Expiring Soon', ar: 'تنتهي قريبا' },
  recentPayments: { en: 'Recent Payments', ar: 'آخر الدفعات' },

  // Apartments
  apartments: { en: 'Apartments', ar: 'الشقق' },
  tenantsTab: { en: 'Tenants', ar: 'المستأجرين' },
  addApt: { en: 'Add Apartment', ar: 'إضافة شقة' },
  aptNumber: { en: 'Apartment number', ar: 'رقم الشقة' },
  floor: { en: 'Floor', ar: 'الدور' },
  rentAmountLabel: { en: 'Rent (KWD)', ar: 'الإيجار (د.ك)' },
  actions: { en: 'Actions', ar: 'الإجراءات' },
  rentContract: { en: 'Rent Contract', ar: 'عقد إيجار' },
  evictionNotice: { en: 'Eviction Notice', ar: 'إشعار إخلاء' },
  evict: { en: 'Evict', ar: 'إخلاء' },
  whatsapp: { en: 'WhatsApp', ar: 'واتساب' },
  call: { en: 'Call', ar: 'اتصال' },
  deleteTenant: { en: 'Delete Tenant', ar: 'حذف المستأجر' },
  deleteApt: { en: 'Delete Apartment', ar: 'حذف الشقة' },
  notesFlags: { en: 'Notes & Flags', ar: 'ملاحظات وتعليم' },
  saveNotes: { en: 'Save Notes', ar: 'حفظ الملاحظات' },
  hideNotes: { en: 'Hide Notes', ar: 'إخفاء الملاحظات' },
  flagApt: { en: 'Flag apartment (warning)', ar: 'تعليم الشقة (تحذير)' },
  flagReason: { en: 'Flag reason...', ar: 'سبب التعليم...' },
  civilId: { en: 'Civil ID', ar: 'الرقم المدني' },
  phone: { en: 'Phone', ar: 'الهاتف' },
  nationality: { en: 'Nationality', ar: 'الجنسية' },
  profession: { en: 'Profession', ar: 'المهنة' },
  leaseStart: { en: 'Lease Start', ar: 'بداية العقد' },
  leaseEnd: { en: 'Lease End', ar: 'نهاية العقد' },
  paymentMethod: { en: 'Payment Method', ar: 'طريقة الدفع' },
  printContract: { en: 'Print Contract', ar: 'طباعة عقد' },
  tenantSearch: { en: 'Search by name, phone, civil ID...', ar: 'بحث بالاسم، الهاتف، الرقم المدني...' },
  tenant: { en: 'tenant', ar: 'مستأجر' },
  cantDeleteOccupied: { en: 'Cannot delete an occupied apartment. Evict the tenant first.', ar: 'لا يمكن حذف شقة مشغولة. أخلِ الشقة أولا.' },

  // Financial
  statement: { en: 'Statement', ar: 'الكشف المالي' },
  receipts: { en: 'Receipts', ar: 'الوصولات' },
  contracts: { en: 'Contracts', ar: 'العقود' },
  totalRent: { en: 'Total Rent', ar: 'إجمالي الإيجارات' },
  expenses: { en: 'Expenses', ar: 'المصروفات' },
  netProfit: { en: 'Net Profit', ar: 'صافي الربح' },
  profitDist: { en: 'Profit Distribution', ar: 'توزيع الأرباح' },
  shareReda: { en: "Reda Al-Salman's Share", ar: 'حصة رضا السلمان' },
  shareAbbas: { en: "Abbas Al-Salman's Share", ar: 'حصة عباس السلمان' },
  addExpense: { en: 'Add Expense', ar: 'إضافة مصروف' },
  generalExpenses: { en: 'General Expenses', ar: 'المصروفات العامة' },
  electricity: { en: 'Electricity', ar: 'الكهرباء' },
  salaries: { en: 'Salaries', ar: 'الرواتب' },
  collected: { en: 'Collected', ar: 'محصّل' },
  remaining: { en: 'Remaining', ar: 'متبقي' },
  rate: { en: 'Rate', ar: 'النسبة' },
  recordedPayments: { en: 'Recorded Payments', ar: 'الدفعات المسجلة' },
  notPaid: { en: 'Not Paid', ar: 'لم يدفعوا' },
  newReceipt: { en: '+ Receipt', ar: '+ وصل' },
  selectTenant: { en: 'Select tenant', ar: 'اختر المستأجر' },
  amount: { en: 'Amount', ar: 'المبلغ' },
  cash: { en: 'Cash', ar: 'نقدا' },
  check: { en: 'Check', ar: 'شيك' },
  bankTransfer: { en: 'Bank Transfer', ar: 'تحويل بنكي' },
  register: { en: 'Register', ar: 'تسجيل' },
  all: { en: 'All', ar: 'الكل' },
  active: { en: 'Active', ar: 'سارية' },
  expired: { en: 'Expired', ar: 'منتهية' },
  noContract: { en: 'No Contract', ar: 'بدون عقد' },
  noContracts: { en: 'No contracts', ar: 'لا توجد عقود' },
  contractActive: { en: 'Active', ar: 'ساري' },
  contractExpiring: { en: 'Expiring soon', ar: 'ينتهي قريبا' },
  contractExpired: { en: 'Expired', ar: 'منتهي' },
  noContractDetails: { en: 'Contract details not recorded', ar: 'لم يتم تسجيل تفاصيل العقد' },
  expenseDesc: { en: 'Expense description', ar: 'وصف المصروف' },
  editExpense: { en: 'Edit Expense', ar: 'تعديل مصروف' },
  receiptTitle: { en: 'Rent Receipts', ar: 'وصولات الإيجار' },
  monthlyStatement: { en: 'Statement', ar: 'كشف' },
  from: { en: 'From', ar: 'من' },
  to: { en: 'To', ar: 'إلى' },

  // Settings
  general: { en: 'General', ar: 'عام' },
  auditLog: { en: 'Audit Log', ar: 'السجل' },
  users: { en: 'Users', ar: 'المستخدمين' },
  data: { en: 'Data', ar: 'البيانات' },
  theme: { en: 'Theme', ar: 'المظهر' },
  auto: { en: 'Auto', ar: 'تلقائي' },
  light: { en: 'Light', ar: 'فاتح' },
  dark: { en: 'Dark', ar: 'داكن' },
  language: { en: 'Language', ar: 'اللغة' },
  english: { en: 'English', ar: 'English' },
  arabic: { en: 'العربية', ar: 'العربية' },
  propertyInfo: { en: 'Property Info', ar: 'معلومات العقار' },
  propertyName: { en: 'Property Name', ar: 'اسم العقار' },
  company: { en: 'Company', ar: 'الشركة' },
  commercialReg: { en: 'Commercial Reg', ar: 'السجل التجاري' },
  representative: { en: 'Representative', ar: 'الممثل' },
  location: { en: 'Location', ar: 'المنطقة' },
  aptCount: { en: 'Apartments', ar: 'عدد الشقق' },
  quickStats: { en: 'Quick Stats', ar: 'إحصائيات سريعة' },
  aboutApp: { en: 'About', ar: 'حول التطبيق' },
  version: { en: 'Version', ar: 'الإصدار' },
  system: { en: 'System', ar: 'النظام' },
  logout: { en: 'Logout', ar: 'خروج' },
  records: { en: 'records', ar: 'سجل' },
  clearAll: { en: 'Clear All', ar: 'مسح الكل' },
  noRecords: { en: 'No records', ar: 'لا توجد سجلات' },
  admin: { en: 'Admin', ar: 'مدير' },
  user: { en: 'User', ar: 'مستخدم' },
  fullName: { en: 'Full name', ar: 'الاسم الكامل' },
  username: { en: 'Username', ar: 'اسم المستخدم' },
  password: { en: 'Password', ar: 'كلمة المرور' },
  backup: { en: 'Backup', ar: 'النسخ الاحتياطي' },
  exportData: { en: 'Export Data', ar: 'تصدير البيانات' },
  importData: { en: 'Import Data', ar: 'استيراد البيانات' },
  dangerZone: { en: 'Danger Zone', ar: 'منطقة الخطر' },
  deleteAllData: { en: 'Delete All Data', ar: 'حذف جميع البيانات' },
  dataSize: { en: 'Data Size', ar: 'حجم البيانات' },
  total: { en: 'Total', ar: 'الإجمالي' },
  addUser: { en: 'Add User', ar: 'إضافة مستخدم' },
  backupDesc: { en: 'Export all system data to a JSON file you can save and import later.', ar: 'قم بتصدير جميع بيانات النظام إلى ملف JSON يمكنك حفظه واستيراده لاحقا.' },
  dangerDesc: { en: 'Delete all data and reset the app to default. This action cannot be undone.', ar: 'حذف جميع البيانات وإعادة التطبيق إلى الوضع الافتراضي. لا يمكن التراجع عن هذا الإجراء.' },
  dataImported: { en: 'Data imported successfully. Page will refresh.', ar: 'تم استيراد البيانات بنجاح. سيتم تحديث الصفحة.' },
  fileError: { en: 'Error reading file', ar: 'خطأ في قراءة الملف' },
  confirmDeleteAll: { en: 'Are you sure you want to delete all data? Cannot be undone!', ar: 'هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع!' },
  finalConfirm: { en: 'Final confirmation: everything will be deleted!', ar: 'تأكيد أخير: سيتم حذف كل شيء!' },

  // Login
  buildingMgmt: { en: 'Building Management System', ar: 'نظام إدارة العمارة' },
  login: { en: 'Login', ar: 'دخول' },
  invalidCredentials: { en: 'Invalid username or password', ar: 'اسم المستخدم أو كلمة المرور غير صحيحة' },

  // Audit
  actionCreate: { en: 'Create', ar: 'إنشاء' },
  actionUpdate: { en: 'Update', ar: 'تعديل' },
  actionDelete: { en: 'Delete', ar: 'حذف' },
  actionLogin: { en: 'Login', ar: 'دخول' },
  actionLogout: { en: 'Logout', ar: 'خروج' },
  actionEviction: { en: 'Eviction', ar: 'إخلاء' },
  entityTenant: { en: 'Tenant', ar: 'مستأجر' },
  entityApartment: { en: 'Apartment', ar: 'شقة' },
  entityPayment: { en: 'Payment', ar: 'دفعة' },
  entityExpense: { en: 'Expense', ar: 'مصروف' },
  entityContract: { en: 'Contract', ar: 'عقد' },
  entityEviction: { en: 'Eviction', ar: 'إخلاء' },
  entityUser: { en: 'User', ar: 'مستخدم' },
  entitySystem: { en: 'System', ar: 'النظام' },

  // Tenant form
  tenantName: { en: 'Tenant name *', ar: 'اسم المستأجر *' },
  selectApt: { en: 'Select apartment *', ar: 'اختر الشقة *' },
  addTenant: { en: 'Add Tenant', ar: 'إضافة مستأجر' },
  editTenant: { en: 'Edit Tenant', ar: 'تعديل مستأجر' },

  // Eviction
  evictionTitle: { en: 'Record Eviction', ar: 'تسجيل إخلاء' },
  evictionReason: { en: 'Eviction reason *', ar: 'سبب الإخلاء *' },
  confirmEviction: { en: 'Confirm Eviction', ar: 'تأكيد الإخلاء' },

  // Data labels
  dataTenants: { en: 'Tenants', ar: 'المستأجرين' },
  dataApartments: { en: 'Apartments', ar: 'الشقق' },
  dataPayments: { en: 'Payments', ar: 'الدفعات' },
  dataExpenses: { en: 'Expenses', ar: 'المصروفات' },
  dataEvictions: { en: 'Evictions', ar: 'الإخلاءات' },
  dataAuditLog: { en: 'Audit Log', ar: 'سجل النشاط' },
  dataUsers: { en: 'Users', ar: 'المستخدمين' },
};

export function t(key: string, lang: Lang): string {
  return s[key]?.[lang] || key;
}
