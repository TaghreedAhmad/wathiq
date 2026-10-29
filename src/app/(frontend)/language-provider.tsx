'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Language = 'ar' | 'en'
const LanguageContext = createContext<{ language: Language; toggle: () => void }>({ language: 'ar', toggle: () => undefined })
const originalTexts = new WeakMap<Node, string>()

const translations: Record<string, string> = {
  'وثيق': 'Wathiq', 'الرئيسية': 'Dashboard', 'معاملة جديدة': 'New transaction', 'المعاملات': 'Transactions',
  'الإحصائيات': 'Analytics', 'الإعدادات': 'Settings', 'تحتاج مساعدة؟': 'Need help?',
  'مركز الدعم متاح للإجابة عن استفساراتك.': 'Our support center is ready to help.', 'تواصل معنا': 'Contact us',
  'خروج': 'Sign out', 'موظف': 'Employee', 'مشرف': 'Supervisor', 'مدير': 'Manager',
  'ابحث برقم المعاملة أو اسم المقدّم...': 'Search by transaction number or applicant...',
  'إليك ملخص أعمال المراجعة اليوم.': 'Here is your review summary for today.',
  'إجمالي المعاملات': 'Total transactions', 'متوسط وقت المراجعة': 'Average review time',
  'مشكلات مكتشفة': 'Issues detected', 'نسبة الإنجاز': 'Completion rate',
  'أحدث المعاملات': 'Recent transactions', 'آخر المعاملات المضافة إلى النظام': 'Latest transactions added to the system',
  'عرض الكل': 'View all', 'رقم المعاملة': 'Transaction ID', 'مقدّم الطلب': 'Applicant', 'النوع': 'Type',
  'التاريخ': 'Date', 'الحالة': 'Status', 'الثقة': 'Confidence', 'تحتاج مراجعة': 'Needs review',
  'مكتملة': 'Complete', 'ناقصة': 'Incomplete', 'قيد المعالجة': 'Processing', 'نشاط اليوم': 'Today’s activity',
  'توزيع حالات المعاملات': 'Transaction status breakdown', 'معاملة': 'transactions',
  'ناقصة / مرفوضة': 'Incomplete / rejected', 'لديك ٨ معاملات تحتاج مراجعتك': 'You have 8 transactions to review',
  'اكتشف وثيق مشكلات وتعارضات تحتاج إلى قرارك النهائي.': 'Wathiq found issues and conflicts requiring your decision.',
  'بدء المراجعة': 'Start review', 'إنشاء معاملة جديدة': 'Create a new transaction',
  'أدخل بيانات المعاملة وارفع المستندات ليبدأ وثيق بالمراجعة.': 'Enter transaction details and upload documents to begin.',
  'بيانات المعاملة': 'Transaction details', 'المعلومات الأساسية للطلب': 'Basic application information',
  'نوع المعاملة': 'Transaction type', 'تجديد سجل تجاري': 'Commercial registration renewal',
  'طلب ترخيص مهني': 'Professional license application', 'تسجيل مورد': 'Vendor registration',
  'اسم مقدّم الطلب': 'Applicant name', 'المستندات': 'Documents',
  'PDF أو JPG أو PNG — حتى ٢٠ ميجابايت للملف': 'PDF, JPG or PNG — up to 20 MB per file',
  'اسحب المستندات هنا أو اضغط للاختيار': 'Drag documents here or click to browse',
  'يمكنك رفع عدة مستندات دفعة واحدة': 'You can upload multiple documents at once',
  'المستندات المطلوبة': 'Required documents', 'حسب قالب «تجديد سجل تجاري»': 'Based on the “Commercial registration renewal” template',
  'الهوية الوطنية': 'National ID', 'السجل التجاري': 'Commercial registration', 'عقد التأسيس': 'Articles of association',
  '٣ من ٣ مستندات مكتملة': '3 of 3 documents complete', 'بدء التدقيق الذكي': 'Start smart review',
  'جارٍ تدقيق المعاملة': 'Reviewing transaction', 'تعمل وكلاء وثيق بالتسلسل على قراءة المستندات والتحقق منها': 'Wathiq agents are reading and validating the documents in sequence',
  'استخراج البيانات': 'Data extraction', 'تصنيف المستندات': 'Document classification', 'فحص الصلاحية': 'Validity check',
  'التحقق من الاكتمال': 'Completeness check', 'كشف التعارضات': 'Conflict detection', 'إعداد التقرير': 'Report generation',
  'اكتمل': 'Complete', 'جارٍ التنفيذ...': 'Running...', 'في الانتظار': 'Waiting',
  'لا تغلق الصفحة — تستغرق العملية عادةً أقل من دقيقة': 'Do not close this page — processing usually takes less than a minute',
  'مراجعة المعاملة': 'Transaction review', 'حفظ التعديلات': 'Save changes', 'عرض التقرير النهائي': 'View final report',
  'تحتاج المعاملة إلى مراجعتك': 'This transaction needs your review', 'تم اكتشاف تعارض واحد ومستند منتهي الصلاحية.': 'One conflict and one expired document were detected.',
  'درجة الثقة': 'Confidence score', 'البيانات المستخرجة': 'Extracted data', 'المشكلات (٢)': 'Issues (2)',
  'بيانات المنشأة': 'Business details', 'اسم المنشأة': 'Business name', 'رقم السجل التجاري': 'Registration number',
  'اسم المالك': 'Owner name', 'الصلاحية': 'Validity', 'تاريخ الإصدار': 'Issue date', 'تاريخ الانتهاء': 'Expiry date',
  'المستند منتهي الصلاحية': 'Document has expired', 'انتهت صلاحية السجل التجاري قبل ٨٧ يومًا.': 'The commercial registration expired 87 days ago.',
  'الإجراء المقترح: إرفاق سجل تجاري ساري.': 'Suggested action: Attach a valid commercial registration.',
  'تعارض في اسم المنشأة': 'Business name conflict', 'الإجراء المقترح: مطابقة الاسم القانوني.': 'Suggested action: Verify the legal name.',
  'قرار الموظف': 'Employee decision', 'سيُسجّل القرار في سجل التدقيق': 'The decision will be recorded in the audit log',
  'رفض': 'Reject', 'إعادة للمقدّم': 'Return to applicant', 'اعتماد المعاملة': 'Approve transaction',
  'تقرير تدقيق المعاملة': 'Transaction review report', 'طباعة': 'Print', 'تصدير PDF': 'Export PDF',
  'تقرير مراجعة ذكي': 'Smart review report', 'تاريخ الإنشاء': 'Created on',
  'الثقة العامة': 'Overall confidence', 'الملخص التنفيذي': 'Executive summary', 'المشكلات المكتشفة': 'Detected issues',
  'حرجة': 'Critical', 'متوسطة': 'Medium', 'حالة المستندات': 'Document status', 'التصنيف': 'Classification',
  'ساري': 'Valid', 'منتهي': 'Expired', 'التحليلات': 'Analytics', 'الإحصائيات والأداء': 'Analytics and performance',
  'نظرة شاملة على كفاءة المراجعة الذكية.': 'A comprehensive view of smart review efficiency.',
  'معاملة هذا العام': 'Transactions this year', 'وقت تم توفيره': 'Time saved', 'مقابل المراجعة اليدوية': 'Compared to manual review',
  'أخطاء مكتشفة': 'Errors detected', 'دقة الاستخراج': 'Extraction accuracy', 'حجم المعاملات': 'Transaction volume',
  'آخر ٦ أشهر': 'Last 6 months', 'المشكلات الأكثر تكرارًا': 'Most common issues', 'بحسب نتائج آخر ٩٠ يومًا': 'Based on the last 90 days',
  'مستند منتهي': 'Expired document', 'تعارض في الاسم': 'Name conflict', 'مستند مفقود': 'Missing document',
  'اختلاف المبالغ': 'Amount mismatch', 'إدارة النظام': 'System management', 'إدارة قوالب المعاملات والمستخدمين وسياسات التدقيق.': 'Manage templates, users, and review policies.',
  'قوالب المعاملات': 'Transaction templates', 'المستخدمون والصلاحيات': 'Users and permissions', 'قواعد التدقيق': 'Review rules',
  'مرحبًا بعودتك': 'Welcome back', 'تسجيل الدخول إلى وثيق': 'Sign in to Wathiq',
  'أدخل بيانات حسابك للوصول إلى لوحة الموظف.': 'Enter your account details to access the employee dashboard.',
  'الاسم الكامل': 'Full name', 'البريد الإلكتروني': 'Email address', 'كلمة المرور': 'Password',
  'إظهار': 'Show', 'إخفاء': 'Hide', 'نسيت كلمة المرور؟': 'Forgot password?', 'تسجيل الدخول': 'Sign in',
  'جارٍ التحقق...': 'Signing in...', 'يرجى إدخال بريد إلكتروني صحيح.': 'Enter a valid email address.',
  'يرجى إدخال كلمة المرور.': 'Enter your password.', 'منصة المراجعة الذكية': 'Smart review platform',
  'قرارات أوثق.': 'More confident decisions.', 'مراجعة أسرع.': 'Faster reviews.',
  'منصة آمنة للجهات الحكومية · جميع البيانات مشفّرة': 'A secure platform for government entities · All data is encrypted',
  'مثال: أحمد العتيبي': 'Example: Alex Morgan', 'أدخل كلمة المرور': 'Enter your password',
  'ديسمبر': 'December', 'يناير': 'January', 'فبراير': 'February', 'مارس': 'March', 'أبريل': 'April', 'مايو': 'May',
  'تم الرفع': 'Uploaded', 'سجل تجاري': 'Commercial registration', 'عقد': 'Contract', 'هوية وطنية': 'National ID',
  'مستخرج سجل تجاري': 'Commercial registration extract',
  'المملكة العربية السعودية': 'Kingdom of Saudi Arabia', 'وزارة التجارة': 'Ministry of Commerce',
  'السجل التجاري منتهي الصلاحية': 'Commercial registration has expired',
  'يلزم إرفاق نسخة سارية.': 'A valid copy must be attached.',
  'تم حفظ التعديلات': 'Changes saved', 'تم اعتماد المعاملة': 'Transaction approved',
  'تم رفض المعاملة': 'Transaction rejected', 'تمت إعادة المعاملة للمقدّم': 'Transaction returned to applicant',
  'تم فتح طلب دعم جديد': 'Support request opened', 'تم تجهيز نسخة PDF': 'PDF is ready',
  'يرجى إدخال الاسم الكامل.': 'Enter your full name.',
  'تعذر إكمال التدقيق الذكي.': 'Smart review could not be completed.',
}

const arabicDigits = '٠١٢٣٤٥٦٧٨٩'
const englishDigits = '0123456789'

function translateText(value: string, language: Language) {
  if (language === 'ar') return value
  const trimmed = value.trim()
  let translated = translations[trimmed]
  if (!translated && trimmed.startsWith('صباح الخير،')) translated = `Good morning,${trimmed.slice('صباح الخير،'.length)}`
  if (!translated && trimmed.startsWith('مساء الخير،')) translated = `Good evening,${trimmed.slice('مساء الخير،'.length)}`
  const output = translated ?? trimmed
  return output.replace(/[٠-٩]/g, digit => englishDigits[arabicDigits.indexOf(digit)])
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar')

  useEffect(() => {
    const saved = localStorage.getItem('wathiq-language')
    if (saved === 'en') setLanguage('en')
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('wathiq-language', language)

    const apply = (root: ParentNode) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      let node
      while ((node = walker.nextNode())) {
        const element = node.parentElement
        if (!element || ['SCRIPT', 'STYLE'].includes(element.tagName)) continue
        const original = originalTexts.get(node) ?? node.textContent ?? ''
        if (!originalTexts.has(node) && original.trim()) originalTexts.set(node, original)
        node.textContent = language === 'ar' ? original : original.replace(original.trim(), translateText(original, language))
      }
      root.querySelectorAll?.('input[placeholder]').forEach(item => {
        const input = item as HTMLInputElement
        const original = input.dataset.placeholderAr ?? input.placeholder
        input.dataset.placeholderAr = original
        input.placeholder = language === 'ar' ? original : (translations[original] ?? original)
      })
    }
    apply(document.body)
    const observer = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if (node instanceof HTMLElement) apply(node)
      else if (node.parentElement) apply(node.parentElement)
    })))
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [language])

  return <LanguageContext.Provider value={{ language, toggle: () => setLanguage(value => value === 'ar' ? 'en' : 'ar') }}>{children}</LanguageContext.Provider>
}

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { language, toggle } = useContext(LanguageContext)
  return <button type="button" className={className} onClick={toggle} aria-label="Toggle language">{language === 'ar' ? 'EN' : 'AR'}</button>
}

export function useLanguage() {
  return useContext(LanguageContext)
}
