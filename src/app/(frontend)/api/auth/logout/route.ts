import { NextResponse } from 'next/server'
import { APP_SESSION_COOKIE, revokeDemoSession } from '@/lib/app-auth'
import { cookies } from 'next/headers'

export async function POST() {
  revokeDemoSession((await cookies()).get(APP_SESSION_COOKIE)?.value)
  const response = NextResponse.json({ ok: true })
  response.cookies.set(APP_SESSION_COOKIE, '', { httpOnly: true, maxAge: 0, path: '/' })
  return response
}
