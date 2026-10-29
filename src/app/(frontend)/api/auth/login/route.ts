import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { APP_SESSION_COOKIE, createDemoSession } from '@/lib/app-auth'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  const requestedName = typeof body?.name === 'string' ? body.name.trim() : ''
  const demoMode = (process.env.DEMO_MODE ?? 'true') === 'true'

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'يرجى إدخال بريد إلكتروني صحيح.' }, { status: 400 })
  }
  if (!password.trim()) {
    return NextResponse.json({ error: 'يرجى إدخال كلمة المرور.' }, { status: 400 })
  }

  if (demoMode) {
    const displayName = requestedName || email
      .split('@')[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'موظف وثيق'
    const token = createDemoSession({
      collection: 'users',
      id: `demo:${email}`,
      name: displayName,
      email,
      role: 'employee',
    })
    const response = NextResponse.json({
      ok: true,
      user: { name: displayName, email, role: 'employee' },
    })
    response.cookies.set(APP_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    })
    return response
  }

  const payload = await getPayloadClient()

  try {
    const result = await payload.login({
      collection: 'users',
      data: { email, password },
    })
    if (!result.user) throw new Error('INVALID_LOGIN_RESULT')
    const token = createDemoSession({
      collection: 'users',
      id: String(result.user.id),
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
    })
    const response = NextResponse.json({
      ok: true,
      user: { name: result.user.name, email: result.user.email, role: result.user.role },
    })
    response.cookies.set(APP_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    })
    return response
  } catch {
    return NextResponse.json({ error: 'تعذر تسجيل الدخول. تحقق من بيانات الحساب أو تواصل مع مسؤول النظام.' }, { status: 401 })
  }
}
