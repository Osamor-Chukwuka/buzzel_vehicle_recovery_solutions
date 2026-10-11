'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/auth'
import { acceptCurrentTerms, clearPendingEmergencyRequest, CURRENT_TERMS_VERSION, rememberPendingEmergencyRequest } from '@/lib/terms'

export async function continueFromDeclarationAction(formData: FormData) {
  const declaration = formData.get('declaration') === 'on'
  const terms = formData.get('terms') === 'on'
  const privacy = formData.get('privacy') === 'on'
  if (!declaration || !terms || !privacy) redirect('/declaration?error=Please+accept+all+required+items')
  const lat = String(formData.get('lat') || '').trim()
  const lng = String(formData.get('lng') || '').trim()
  const hasCapturedLocation = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && lat !== '' && lng !== ''
  const requestPath = hasCapturedLocation ? `/requests/new?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}` : '/requests/new'
  const cookieStore = await cookies()
  const user = await getCurrentUser()
  if (user) {
    await acceptCurrentTerms(user.id)
    cookieStore.delete('buzzel_pending_terms')
    await clearPendingEmergencyRequest()
    redirect(requestPath)
  }
  cookieStore.set('buzzel_pending_terms', CURRENT_TERMS_VERSION, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 3600, path: '/' })
  await rememberPendingEmergencyRequest(requestPath)
  redirect(`/auth/login?next=${encodeURIComponent(requestPath)}`)
}
