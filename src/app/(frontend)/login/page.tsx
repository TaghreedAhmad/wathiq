'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LanguageToggle } from '../language-provider'
import { WathiqLogo } from '../wathiq-logo'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('يرجى إدخال بريد إلكتروني صحيح.')
      return
    }
    if (!password.trim()) {
      setError('يرجى إدخال كلمة المرور.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      router.replace('/')
      router.refresh()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'تعذر تسجيل الدخول. حاول مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-pattern" />
        <div className="login-brand">
          <WathiqLogo placement="login" />
          <div><b>وثيق</b><small>WATHIQ</small></div>
        </div>
        <div className="login-message">
          <span>منصة المراجعة الذكية</span>
          <h1>قرارات أوثق.<br/>مراجعة أسرع.</h1>
          <p>وكلاء ذكاء اصطناعي متخصصون يراجعون المستندات، يكتشفون التعارضات، ويمنحون فريقك رؤية واضحة لاتخاذ القرار.</p>
        </div>
        <p className="login-security">منصة آمنة للجهات الحكومية · جميع البيانات مشفّرة</p>
      </section>
      <section className="login-form-side">
        <LanguageToggle className="login-language" />
        <form className="login-card" onSubmit={submit}>
          <div className="login-mobile-logo"><WathiqLogo placement="mobile" /><b>وثيق</b></div>
          <p className="eyebrow">مرحبًا بعودتك</p>
          <h2>تسجيل الدخول إلى وثيق</h2>
          <p className="login-subtitle">أدخل بيانات حسابك للوصول إلى لوحة الموظف.</p>
          <label>
            الاسم الكامل
            <input type="text" value={name} onChange={event => setName(event.target.value)} placeholder="مثال: أحمد العتيبي" autoComplete="name"/>
          </label>
          <label>
            البريد الإلكتروني
            <input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@company.gov" autoComplete="email"/>
          </label>
          <label>
            كلمة المرور
            <div className="password-field">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} placeholder="أدخل كلمة المرور" autoComplete="current-password"/>
              <button type="button" onClick={() => setShowPassword(value => !value)}>{showPassword ? 'إخفاء' : 'إظهار'}</button>
            </div>
          </label>
          <button className="forgot" type="button">نسيت كلمة المرور؟</button>
          {error && <div className="login-error" role="alert">{error}</div>}
          <button className="login-submit" disabled={loading}>{loading ? 'جارٍ التحقق...' : 'تسجيل الدخول'}</button>
        </form>
      </section>
    </main>
  )
}
