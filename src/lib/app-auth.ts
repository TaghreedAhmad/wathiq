import 'server-only'

import { cookies } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'

export const APP_SESSION_COOKIE = 'app-session'
type AppUser = { collection: 'users'; id: string; name: string; email: string; role: 'employee' | 'supervisor' | 'manager' }

const globalSessions = globalThis as typeof globalThis & {
  __wathiqDemoSessions?: Map<string, AppUser>
}
const demoSessions = globalSessions.__wathiqDemoSessions ??= new Map<string, AppUser>()

export function createDemoSession(user: AppUser) {
  const token = crypto.randomUUID()
  demoSessions.set(token, user)
  return token
}

export function revokeDemoSession(token?: string) {
  if (token) demoSessions.delete(token)
}

export async function getCurrentUser() {
  const token = (await cookies()).get(APP_SESSION_COOKIE)?.value
  if (!token) return null

  const payload = await getPayloadClient()
  const { user } = await payload.auth({
    headers: new Headers({ Authorization: `JWT ${token}` }),
  })

  if (user?.collection === 'users') return user
  return demoSessions.get(token) ?? null
}
