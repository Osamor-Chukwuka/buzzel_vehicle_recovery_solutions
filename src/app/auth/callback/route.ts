import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/supabase/auth'
import { clearPendingEmergencyRequest } from '@/lib/terms'
import { roleHomePath } from '@/lib/role-routing'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  let next = url.searchParams.get('next')?.startsWith('/') ? url.searchParams.get('next')! : '/dashboard'
  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    const profile = data.user ? await getProfile(data.user.id) : null
    if (profile && profile.role !== 'customer') {
      await clearPendingEmergencyRequest()
      next = roleHomePath(profile.role)
    }
  }
  return NextResponse.redirect(new URL(next, url.origin))
}
