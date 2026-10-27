import { redirect } from 'next/navigation'
import { createClient } from './server'
import type { AppRole, Profile } from '@/lib/types'
import { roleHomePath } from '@/lib/role-routing'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')
  return user
}

export async function getProfile(userId?: string): Promise<Profile | null> {
  const supabase = await createClient()
  const id = userId ?? (await supabase.auth.getUser()).data.user?.id
  if (!id) return null
  const { data } = await supabase.from('profiles').select('id, full_name, phone, role').eq('id', id).maybeSingle()
  return data as Profile | null
}

export async function requireRole(roles: AppRole[]) {
  const user = await requireUser()
  const profile = await getProfile(user.id)
  if (!profile) throw new Error('Authenticated user profile was not found')
  if (!roles.includes(profile.role)) redirect(roleHomePath(profile.role))
  return { user, profile }
}
