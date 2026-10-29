import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/app-auth'
import WathiqApp from './WathiqApp'

export default async function HomePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return <WathiqApp user={{
    name: user.name,
    email: user.email,
    role: user.role,
  }}/>
}
