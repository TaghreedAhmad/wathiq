'use client'

import { useRef, useState } from 'react'
import { LanguageToggle, useLanguage } from './language-provider'
import { WathiqLogo } from './wathiq-logo'

type Page = 'home' | 'new' | 'review' | 'report' | 'stats' | 'settings'
type AgentState = 'done' | 'active' | 'waiting'

const Icon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    file: <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5M4 15v5h16v-5"/></>,
    spark: <><path d="m12 3 1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2ZM19 16l.6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6Z"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    alert: <><path d="M12 3 2.7 20h18.6Z"/><path d="M12 9v4M12 17h.01"/></>,
    arrow: <path d="m15 18-6-6 6-6"/>,
    more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    print: <><path d="M6 9V3h12v6M6 18H4V10h16v8h-2M7 15h10v6H7z"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>
}

const nav = [
  ['home', 'الرئيسية', 'home'], ['new', 'معاملة جديدة', 'plus'], ['review', 'المعاملات', 'file'],
  ['stats', 'الإحصائيات', 'chart'], ['settings', 'الإعدادات', 'settings'],
] as const

const agents = ['استخراج البيانات', 'تصنيف المستندات', 'فحص الصلاحية', 'التحقق من الاكتمال', 'كشف التعارضات', 'إعداد التقرير']

const transactions = [
  { id: 'WTQ-2025-1042', name: 'شركة الأفق للتقنية', type: 'تجديد سجل تجاري', date: '١٨ مايو، ٢٠٢٥', status: 'تحتاج مراجعة', tone: 'warn', confidence: '٨٧٪' },
  { id: 'WTQ-2025-1041', name: 'عبدالله خالد العتيبي', type: 'طلب ترخيص مهني', date: '١٨ مايو، ٢٠٢٥', status: 'مكتملة', tone: 'good', confidence: '٩٨٪' },
  { id: 'WTQ-2025-1040', name: 'مؤسسة النور للمقاولات', type: 'تسجيل مورد', date: '١٧ مايو، ٢٠٢٥', status: 'ناقصة', tone: 'bad', confidence: '٧٣٪' },
  { id: 'WTQ-2025-1039', name: 'سارة أحمد الحربي', type: 'طلب اعتماد شهادة', date: '١٧ مايو، ٢٠٢٥', status: 'قيد المعالجة', tone: 'info', confidence: '—' },
]

export default function WathiqClient({ user }: { user: { name: string; email: string; role: string } }) {
  const [page, setPage] = useState<Page>('home')
  const [agent, setAgent] = useState(-1)
  const [files, setFiles] = useState<string[]>([])
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [toast, setToast] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const running = agent >= 0 && agent < agents.length

  const go = (target: Page) => { setPage(target); setToast('') }
  const notify = (message: string) => { setToast(message); setTimeout(() => setToast(''), 2600) }
  const roleLabel = { employee: 'موظف', supervisor: 'مشرف', manager: 'مدير' }[user.role] ?? user.role
  const initials = user.name.split(' ').slice(0, 2).map(part => part[0]).join('')

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.assign('/login')
  }

  async function startAnalysis() {
    setAgent(0)
    const progress = window.setInterval(() => setAgent(value => Math.min(value + 1, agents.length - 2)), 900)
    const data = new FormData()
    uploadFiles.forEach(file => data.append('files', file))
    data.append('transactionType', 'تجديد سجل تجاري')
    data.append('transactionNumber', 'WTQ-2025-1043')
    data.append('applicant', 'شركة الأفق للتقنية')
    try {
      const response = await fetch('/api/review', { method: 'POST', body: data })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      sessionStorage.setItem('wathiq-review-result', JSON.stringify(result))
      setAgent(agents.length)
      setTimeout(() => setPage('review'), 300)
    } catch (reason) {
      setAgent(-1)
      notify(reason instanceof Error ? reason.message : 'تعذر إكمال التدقيق الذكي.')
    } finally {
      window.clearInterval(progress)
    }
  }

  return (
    <div className="app-shell" dir="rtl">
      <aside className="sidebar">
        <div className="brand"><WathiqLogo placement="sidebar"/><div><b>وثيق</b><small>WATHIQ</small></div></div>
        <nav className="nav-list" aria-label="التنقل الرئيسي">
          {nav.map(([id, label, icon]) => <button key={id} className={page === id ? 'active' : ''} onClick={() => go(id)}><Icon name={icon}/><span>{label}</span></button>)}
        </nav>
        <div className="help-card"><span><Icon name="spark" size={18}/></span><b>تحتاج مساعدة؟</b><p>مركز الدعم متاح للإجابة عن استفساراتك.</p><button onClick={() => notify('تم فتح طلب دعم جديد')}>تواصل معنا</button></div>
        <div className="user-card"><div className="avatar">{initials}</div><div><b>{user.name}</b><small>{roleLabel}</small></div><button className="logout-button" onClick={logout}>خروج</button></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="mobile-brand"><WathiqLogo placement="mobile"/><b>وثيق</b></div>
          <div className="search"><Icon name="search" size={19}/><input aria-label="البحث" placeholder="ابحث برقم المعاملة أو اسم المقدّم..."/></div>
          <div className="top-actions"><LanguageToggle className="lang"/><button className="icon-button"><Icon name="bell"/><i/></button><button className="profile"><span className="avatar">{initials}</span><span><b>{user.name}</b><small>{user.email}</small></span></button></div>
        </header>

        <section className="content">
          {page === 'home' && <Dashboard go={go} userName={user.name}/>}
          {page === 'new' && <NewTransaction files={files} setFiles={setFiles} fileRef={fileRef} onFiles={setUploadFiles} onStart={startAnalysis}/>}
          {page === 'review' && <Review go={go} notify={notify}/>}
          {page === 'report' && <Report notify={notify}/>}
          {page === 'stats' && <Stats/>}
          {page === 'settings' && <Settings notify={notify}/>}
        </section>
      </main>

      {running && <div className="processing-backdrop"><div className="processing-card"><div className="ai-orbit"><Icon name="spark" size={28}/></div><h2>جارٍ تدقيق المعاملة</h2><p>تعمل وكلاء وثيق بالتسلسل على قراءة المستندات والتحقق منها</p><div className="agents">{agents.map((name, i) => { const state: AgentState = i < agent ? 'done' : i === agent ? 'active' : 'waiting'; return <div className={`agent ${state}`} key={name}><span>{state === 'done' ? <Icon name="check" size={15}/> : i + 1}</span><b>{name}</b><small>{state === 'done' ? 'اكتمل' : state === 'active' ? 'جارٍ التنفيذ...' : 'في الانتظار'}</small></div>})}</div><div className="progress"><i style={{width: `${((agent + 0.4) / agents.length) * 100}%`}}/></div><small>لا تغلق الصفحة — تستغرق العملية عادةً أقل من دقيقة</small></div></div>}
      {toast && <div className="toast"><Icon name="check" size={18}/>{toast}</div>}
    </div>
  )
}

function Dashboard({ go, userName }: { go: (page: Page) => void; userName: string }) {
  const { language } = useLanguage()
  const greeting = new Date().getHours() < 12 ? 'صباح الخير' : 'مساء الخير'
  const date = new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
  return <><div className="page-heading"><div><p>{date}</p><h1>{greeting}، {userName}</h1><span>إليك ملخص أعمال المراجعة اليوم.</span></div><button className="primary" onClick={() => go('new')}><Icon name="plus" size={18}/>معاملة جديدة</button></div>
    <div className="metrics">
      <Metric icon="file" value="١٢٤" label="إجمالي المعاملات" note="+١٢٪ من الشهر الماضي" tone="navy"/>
      <Metric icon="clock" value="٤:٣٢" label="متوسط وقت المراجعة" note="أسرع بـ ١:١٨ دقيقة" tone="gold"/>
      <Metric icon="alert" value="٣٨" label="مشكلات مكتشفة" note="في ٢٤ معاملة" tone="red"/>
      <Metric icon="check" value="٩٢٪" label="نسبة الإنجاز" note="+٤٪ عن الأسبوع الماضي" tone="green"/>
    </div>
    <div className="dashboard-grid">
      <div className="panel transactions"><div className="panel-head"><div><h2>أحدث المعاملات</h2><p>آخر المعاملات المضافة إلى النظام</p></div><button className="text-button" onClick={() => go('review')}>عرض الكل <Icon name="arrow" size={16}/></button></div>
        <div className="table-wrap"><table><thead><tr><th>رقم المعاملة</th><th>مقدّم الطلب</th><th>النوع</th><th>التاريخ</th><th>الحالة</th><th>الثقة</th></tr></thead><tbody>{transactions.map(t => <tr key={t.id} onClick={() => go('review')}><td><b>{t.id}</b></td><td>{t.name}</td><td>{t.type}</td><td>{t.date}</td><td><span className={`status ${t.tone}`}>{t.status}</span></td><td><b>{t.confidence}</b></td></tr>)}</tbody></table></div>
      </div>
      <div className="panel activity"><div className="panel-head"><div><h2>نشاط اليوم</h2><p>توزيع حالات المعاملات</p></div></div><div className="donut"><div><b>٣٢</b><small>معاملة</small></div></div><div className="legend"><p><i className="green"/>مكتملة <b>١٨</b></p><p><i className="gold"/>تحتاج مراجعة <b>٨</b></p><p><i className="red"/>ناقصة / مرفوضة <b>٤</b></p><p><i className="blue"/>قيد المعالجة <b>٢</b></p></div></div>
    </div>
    <div className="quick-review"><div className="quick-icon"><Icon name="spark" size={27}/></div><div><h2>لديك ٨ معاملات تحتاج مراجعتك</h2><p>اكتشف وثيق مشكلات وتعارضات تحتاج إلى قرارك النهائي.</p></div><button className="secondary" onClick={() => go('review')}>بدء المراجعة <Icon name="arrow" size={17}/></button></div>
  </>
}

function Metric({icon,value,label,note,tone}:{icon:string,value:string,label:string,note:string,tone:string}) {
  return <div className="metric"><span className={`metric-icon ${tone}`}><Icon name={icon}/></span><div><p>{label}</p><b>{value}</b><small>{note}</small></div></div>
}

function NewTransaction({files,setFiles,fileRef,onFiles,onStart}:{files:string[];setFiles:(v:string[])=>void;fileRef:React.RefObject<HTMLInputElement|null>;onFiles:(v:File[])=>void;onStart:()=>void}) {
  const addFiles = (list: FileList | null) => {
    if (!list) return
    const selected = Array.from(list)
    setFiles(selected.map(file => file.name))
    onFiles(selected)
  }
  return <><div className="page-heading"><div><p>المعاملات / إنشاء جديد</p><h1>إنشاء معاملة جديدة</h1><span>أدخل بيانات المعاملة وارفع المستندات ليبدأ وثيق بالمراجعة.</span></div></div>
    <div className="form-layout"><div className="panel form-card"><div className="step-title"><span>١</span><div><h2>بيانات المعاملة</h2><p>المعلومات الأساسية للطلب</p></div></div><div className="form-grid"><label>نوع المعاملة<select defaultValue="تجديد سجل تجاري"><option>تجديد سجل تجاري</option><option>طلب ترخيص مهني</option><option>تسجيل مورد</option></select></label><label>رقم المعاملة<input defaultValue="WTQ-2025-1043"/></label><label className="full">اسم مقدّم الطلب<input defaultValue="شركة الأفق للتقنية"/></label></div></div>
      <div className="panel form-card"><div className="step-title"><span>٢</span><div><h2>المستندات</h2><p>PDF أو JPG أو PNG — حتى ٢٠ ميجابايت للملف</p></div></div><input ref={fileRef} hidden type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={e=>addFiles(e.target.files)}/><button className="dropzone" onClick={()=>fileRef.current?.click()} onDrop={e=>{e.preventDefault();addFiles(e.dataTransfer.files)}} onDragOver={e=>e.preventDefault()}><span><Icon name="upload" size={26}/></span><b>اسحب المستندات هنا أو اضغط للاختيار</b><small>يمكنك رفع عدة مستندات دفعة واحدة</small></button><div className="file-list">{files.map((f,i)=><div key={`${f}-${i}`}><span className="pdf">PDF</span><p><b>{f}</b><small>{i===0?'هوية وطنية':i===1?'سجل تجاري':'عقد'} · تم الرفع</small></p><button onClick={()=>setFiles(files.filter((_,x)=>x!==i))}>×</button></div>)}</div></div>
      <aside className="panel requirements"><h2>المستندات المطلوبة</h2><p>حسب قالب «تجديد سجل تجاري»</p>{['الهوية الوطنية','السجل التجاري','عقد التأسيس'].map((x,i)=><div key={x}><span className={i<files.length?'ok':''}><Icon name="check" size={14}/></span>{x}</div>)}<hr/><small>٣ من ٣ مستندات مكتملة</small><button className="primary wide" disabled={!files.length} onClick={onStart}><Icon name="spark" size={18}/>بدء التدقيق الذكي</button></aside>
    </div></>
}

function Review({go,notify}:{go:(p:Page)=>void;notify:(s:string)=>void}) {
  return <><div className="page-heading compact"><div><p>المعاملات / WTQ-2025-1042</p><h1>مراجعة المعاملة</h1><span>شركة الأفق للتقنية · تجديد سجل تجاري</span></div><div className="heading-actions"><button className="ghost" onClick={()=>notify('تم حفظ التعديلات')}>حفظ التعديلات</button><button className="primary" onClick={()=>go('report')}>عرض التقرير النهائي</button></div></div>
    <div className="review-summary"><span className="big-alert"><Icon name="alert" size={25}/></span><div><b>تحتاج المعاملة إلى مراجعتك</b><p>تم اكتشاف تعارض واحد ومستند منتهي الصلاحية.</p></div><div className="confidence"><small>درجة الثقة</small><b>٨٧٪</b></div></div>
    <div className="review-grid"><div className="panel document"><div className="doc-head"><b>السجل التجاري.pdf</b><span>٢ / ١</span></div><div className="paper"><div className="saudi-mark">◆<small>المملكة العربية السعودية<br/>وزارة التجارة</small></div><h3>مستخرج سجل تجاري</h3><p><span>اسم المنشأة</span><mark>شركة الآفاق للتقنية</mark></p><p><span>رقم السجل</span><b>١٠١٠٧٣٥٩٢٨</b></p><p><span>تاريخ الإصدار</span><b>١٤٤١/٠٨/٢١</b></p><p><span>تاريخ الانتهاء</span><mark className="expired">١٤٤٦/٠٨/٢١</mark></p><div className="stamp">منتهي</div></div></div>
      <div className="panel extracted"><div className="tabs"><button className="active">البيانات المستخرجة</button><button>المشكلات (٢)</button></div><h3>بيانات المنشأة</h3><Field label="اسم المنشأة" value="شركة الآفاق للتقنية" confidence="٩٦٪"/><Field label="رقم السجل التجاري" value="١٠١٠٧٣٥٩٢٨" confidence="٩٩٪"/><Field label="اسم المالك" value="عبدالله خالد العتيبي" confidence="٩٤٪"/><div className="divider"/><h3>الصلاحية</h3><Field label="تاريخ الإصدار" value="١٤٤١/٠٨/٢١" confidence="٩٨٪"/><Field label="تاريخ الانتهاء" value="١٤٤٦/٠٨/٢١" confidence="٩٨٪" danger/><div className="issue-card critical"><span><Icon name="alert" size={18}/></span><div><b>المستند منتهي الصلاحية</b><p>انتهت صلاحية السجل التجاري قبل ٨٧ يومًا.</p><small>الإجراء المقترح: إرفاق سجل تجاري ساري.</small></div></div><div className="issue-card medium"><span>!</span><div><b>تعارض في اسم المنشأة</b><p>العقد: «شركة الأفق» · السجل: «شركة الآفاق»</p><small>الإجراء المقترح: مطابقة الاسم القانوني.</small></div></div></div>
    </div><div className="decision-bar"><div><b>قرار الموظف</b><span>سيُسجّل القرار في سجل التدقيق</span></div><button className="reject" onClick={()=>notify('تم رفض المعاملة')}>رفض</button><button className="return" onClick={()=>notify('تمت إعادة المعاملة للمقدّم')}>إعادة للمقدّم</button><button className="approve" onClick={()=>notify('تم اعتماد المعاملة')}>اعتماد المعاملة</button></div>
  </>
}

function Field({label,value,confidence,danger}:{label:string;value:string;confidence:string;danger?:boolean}) { return <label className="data-field"><span>{label}<small>{confidence}</small></span><input className={danger?'danger':''} defaultValue={value}/></label> }

function Report({notify}:{notify:(s:string)=>void}) {
  return <div className="report-page"><div className="page-heading compact no-print"><div><p>المعاملات / التقرير النهائي</p><h1>تقرير تدقيق المعاملة</h1></div><div className="heading-actions"><button className="ghost" onClick={()=>window.print()}><Icon name="print" size={17}/> طباعة</button><button className="primary" onClick={()=>notify('تم تجهيز نسخة PDF')}>تصدير PDF</button></div></div><div className="report-sheet"><div className="report-logo"><div className="brand"><WathiqLogo placement="report"/><div><b>وثيق</b><small>WATHIQ</small></div></div><span>تقرير مراجعة ذكي</span></div><div className="report-title"><p>WTQ-2025-1042</p><h2>تجديد سجل تجاري</h2><span className="status warn">تحتاج مراجعة</span></div><div className="report-meta"><div><small>مقدّم الطلب</small><b>شركة الأفق للتقنية</b></div><div><small>تاريخ الإنشاء</small><b>١٨ مايو ٢٠٢٥</b></div><div><small>المستندات</small><b>٣ مستندات</b></div><div><small>الثقة العامة</small><b>٨٧٪</b></div></div><section><h3>الملخص التنفيذي</h3><p>تمت مراجعة ثلاثة مستندات والتحقق من ٢٤ حقلًا. المعاملة مكتملة من حيث المرفقات، لكن يلزم تحديث السجل التجاري المنتهي والتحقق من اختلاف طفيف في اسم المنشأة قبل الاعتماد النهائي.</p></section><section><h3>المشكلات المكتشفة</h3><div className="report-issue"><span className="severity critical">حرجة</span><div><b>السجل التجاري منتهي الصلاحية</b><p>تاريخ الانتهاء: ١٤٤٦/٠٨/٢١ — يلزم إرفاق نسخة سارية.</p></div></div><div className="report-issue"><span className="severity medium">متوسطة</span><div><b>تعارض في اسم المنشأة</b><p>«شركة الأفق للتقنية» مقابل «شركة الآفاق للتقنية» — يرجى مطابقة الاسم القانوني.</p></div></div></section><section><h3>حالة المستندات</h3><table><thead><tr><th>المستند</th><th>التصنيف</th><th>الصلاحية</th><th>الثقة</th></tr></thead><tbody><tr><td>الهوية الوطنية.pdf</td><td>هوية وطنية</td><td><span className="status good">ساري</span></td><td>٩٨٪</td></tr><tr><td>السجل التجاري.pdf</td><td>سجل تجاري</td><td><span className="status bad">منتهي</span></td><td>٩٦٪</td></tr><tr><td>عقد التأسيس.pdf</td><td>عقد</td><td><span className="status good">ساري</span></td><td>٩٢٪</td></tr></tbody></table></section><footer>أُنشئ هذا التقرير آليًا بواسطة منصة وثيق · يجب اعتماد القرار النهائي من الموظف المختص</footer></div></div>
}

function Stats() { return <><div className="page-heading"><div><p>التحليلات</p><h1>الإحصائيات والأداء</h1><span>نظرة شاملة على كفاءة المراجعة الذكية.</span></div></div><div className="metrics"><Metric icon="file" value="٢,٨٤١" label="معاملة هذا العام" note="+١٩٪ معدل النمو" tone="navy"/><Metric icon="clock" value="١٢٧ س" label="وقت تم توفيره" note="مقابل المراجعة اليدوية" tone="gold"/><Metric icon="alert" value="١٤.٢٪" label="أخطاء مكتشفة" note="٤٠٣ مشكلة مؤكدة" tone="red"/><Metric icon="check" value="٩٤.٨٪" label="دقة الاستخراج" note="+٢.١٪ هذا الربع" tone="green"/></div><div className="stats-grid"><div className="panel chart-card"><h2>حجم المعاملات</h2><p>آخر ٦ أشهر</p><div className="bars">{[42,58,49,70,62,88].map((x,i)=><div key={i}><i style={{height:`${x}%`}}/><span>{['ديسمبر','يناير','فبراير','مارس','أبريل','مايو'][i]}</span></div>)}</div></div><div className="panel common"><h2>المشكلات الأكثر تكرارًا</h2><p>بحسب نتائج آخر ٩٠ يومًا</p>{[['مستند منتهي','٣٨٪'],['تعارض في الاسم','٢٦٪'],['مستند مفقود','٢١٪'],['اختلاف المبالغ','١٥٪']].map(([a,b],i)=><div key={a}><span>{i+1}</span><b>{a}</b><small>{b}</small></div>)}</div></div></> }

function Settings({notify}:{notify:(s:string)=>void}) { return <><div className="page-heading"><div><p>إدارة النظام</p><h1>الإعدادات</h1><span>إدارة قوالب المعاملات والمستخدمين وسياسات التدقيق.</span></div></div><div className="settings-grid">{[['قوالب المعاملات','٧ قوالب نشطة','تحديد المستندات المطلوبة وقواعد التحقق.'],['المستخدمون والصلاحيات','١٢ مستخدمًا','إدارة أدوار الموظفين والمشرفين والمديرين.'],['قواعد التدقيق','٢٤ قاعدة','ضبط درجات الثقة وحدود التنبيه.']].map(([title,count,desc])=><button className="panel setting-card" key={title} onClick={()=>notify(`تم فتح ${title}`)}><span><Icon name="settings"/></span><div><h2>{title}</h2><p>{desc}</p><small>{count}</small></div><Icon name="arrow"/></button>)}</div></> }
