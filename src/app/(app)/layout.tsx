import { AppShell } from '@/components/app-shell'
import { getProfile, requireUser } from '@/lib/supabase/auth'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  const profile = await getProfile(user.id)
  if (!profile) throw new Error('Buzzel profile could not be loaded')
  return <AppShell profile={profile}>{children}</AppShell>
}
