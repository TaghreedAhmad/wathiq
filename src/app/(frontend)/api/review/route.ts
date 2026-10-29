import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/app-auth'

const model = 'gemini-2.5-flash'
const field = (properties: Record<string, unknown>, required: string[]) => ({
  type: 'OBJECT', properties, required,
})

async function agent(name: string, task: string, schema: unknown, context: unknown, files: unknown[] = []) {
  const key = process.env.APP_GEMINI_API_KEY
  if (!key) throw new Error('MISSING_KEY')
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [
        { text: `أنت ${name} في منصة وثيق. ${task} أعد JSON فقط. السياق: ${JSON.stringify(context)}` },
        ...files,
      ] }],
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json', responseSchema: schema },
    }),
  })
  if (!response.ok) {
    console.error(`Gemini ${name} failed with status ${response.status}`)
    throw new Error('GEMINI_FAILED')
  }
  const result = await response.json()
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('INVALID_RESPONSE')
  return JSON.parse(text)
}

const extractionSchema = field({
  documents: { type: 'ARRAY', items: field({
    fileName: { type: 'STRING' },
    documentType: { type: 'STRING' },
    fields: { type: 'ARRAY', items: field({
      name: { type: 'STRING' }, value: { type: 'STRING' }, confidence: { type: 'NUMBER' },
    }, ['name', 'value', 'confidence']) },
  }, ['fileName', 'documentType', 'fields']) },
}, ['documents'])

const validitySchema = field({
  documents: { type: 'ARRAY', items: field({
    fileName: { type: 'STRING' },
    status: { type: 'STRING', enum: ['valid', 'expiring_soon', 'expired', 'unknown'] },
    issueDate: { type: 'STRING' }, expiryDate: { type: 'STRING' }, reason: { type: 'STRING' },
  }, ['fileName', 'status', 'issueDate', 'expiryDate', 'reason']) },
}, ['documents'])

const completenessSchema = field({
  complete: { type: 'BOOLEAN' },
  present: { type: 'ARRAY', items: { type: 'STRING' } },
  missing: { type: 'ARRAY', items: { type: 'STRING' } },
}, ['complete', 'present', 'missing'])

const conflictsSchema = field({
  conflicts: { type: 'ARRAY', items: field({
    severity: { type: 'STRING', enum: ['critical', 'medium', 'notice'] },
    field: { type: 'STRING' }, description: { type: 'STRING' },
    firstValue: { type: 'STRING' }, secondValue: { type: 'STRING' },
    suggestedAction: { type: 'STRING' },
  }, ['severity', 'field', 'description', 'firstValue', 'secondValue', 'suggestedAction']) },
}, ['conflicts'])

const reportSchema = field({
  status: { type: 'STRING', enum: ['complete', 'needs_review', 'rejected'] },
  executiveSummary: { type: 'ARRAY', items: { type: 'STRING' } },
  overallConfidence: { type: 'NUMBER' },
  recommendedDecision: { type: 'STRING' },
}, ['status', 'executiveSummary', 'overallConfidence', 'recommendedDecision'])

export async function POST(request: Request) {
  if (!await getCurrentUser()) return NextResponse.json({ error: 'يجب تسجيل الدخول أولًا.' }, { status: 401 })
  if (!process.env.APP_GEMINI_API_KEY) {
    return NextResponse.json({ error: 'مفتاح Gemini غير مُعدّ. أضف APP_GEMINI_API_KEY من Secrets.' }, { status: 503 })
  }
  try {
    const form = await request.formData()
    const uploads = form.getAll('files').filter((item): item is File => item instanceof File)
    if (!uploads.length) return NextResponse.json({ error: 'أرفق مستندًا واحدًا على الأقل لبدء التدقيق.' }, { status: 400 })
    const fileParts = await Promise.all(uploads.map(async file => ({
      inlineData: { mimeType: file.type || 'application/pdf', data: Buffer.from(await file.arrayBuffer()).toString('base64') },
    })))
    const transaction = {
      type: String(form.get('transactionType') || ''),
      number: String(form.get('transactionNumber') || ''),
      applicant: String(form.get('applicant') || ''),
      requiredDocuments: ['هوية وطنية', 'سجل تجاري', 'عقد تأسيس'],
    }
    const extraction = await agent('وكيل الاستخراج والتصنيف', 'اقرأ وصنّف المستندات واستخرج الحقول مع ثقة من 0 إلى 1.', extractionSchema, transaction, fileParts)
    const validity = await agent('وكيل الصلاحية', 'افحص تواريخ الإصدار والانتهاء وحدد الصلاحية.', validitySchema, { transaction, extraction })
    const completeness = await agent('وكيل الاكتمال', 'قارن الأنواع بقائمة المستندات المطلوبة.', completenessSchema, { transaction, extraction })
    const conflicts = await agent('وكيل التعارض', 'قارن الحقول مع مراعاة التشكيل والهمزات وترجمة الأسماء.', conflictsSchema, { transaction, extraction })
    const report = await agent('وكيل التقرير', 'أنشئ خلاصة من ثلاثة أسطر وقرارًا مقترحًا.', reportSchema, { transaction, extraction, validity, completeness, conflicts })
    return NextResponse.json({ extraction, validity, completeness, conflicts, report })
  } catch {
    return NextResponse.json({ error: 'تعذر الاتصال بخدمة Gemini أو تحليل الاستجابة. تحقق من المفتاح وحاول مرة أخرى.' }, { status: 502 })
  }
}
