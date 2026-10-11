import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { normalizeEmergencyRequestPath } from '@/lib/emergency-intent'

export const CURRENT_TERMS_VERSION = '2026-10-08'
export const PENDING_EMERGENCY_REQUEST_COOKIE = 'buzzel_pending_emergency_request'
const PENDING_EMERGENCY_REQUEST_MAX_AGE = 60 * 60

export async function rememberPendingEmergencyRequest(requestPath: string) {
  const safePath = normalizeEmergencyRequestPath(requestPath)
  if (!safePath) return
  const cookieStore = await cookies()
  cookieStore.set(PENDING_EMERGENCY_REQUEST_COOKIE, safePath, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: PENDING_EMERGENCY_REQUEST_MAX_AGE,
    path: '/',
  })
}

export async function getPendingEmergencyRequest() {
  const cookieStore = await cookies()
  return normalizeEmergencyRequestPath(cookieStore.get(PENDING_EMERGENCY_REQUEST_COOKIE)?.value)
}

export async function clearPendingEmergencyRequest() {
  const cookieStore = await cookies()
  cookieStore.delete(PENDING_EMERGENCY_REQUEST_COOKIE)
}

export async function hasCurrentTermsAccepted(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('terms_acceptances').select('id').eq('user_id', userId).eq('declaration_version', CURRENT_TERMS_VERSION).eq('terms_version', CURRENT_TERMS_VERSION).eq('privacy_version', CURRENT_TERMS_VERSION).limit(1).maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function acceptCurrentTerms(userId: string) {
  if (await hasCurrentTermsAccepted(userId)) return
  const supabase = await createClient()
  const { error } = await supabase.from('terms_acceptances').insert({
    user_id: userId,
    declaration_version: CURRENT_TERMS_VERSION,
    terms_version: CURRENT_TERMS_VERSION,
    privacy_version: CURRENT_TERMS_VERSION,
  })
  if (error) throw error
}

export async function ensureCurrentTermsAccepted(userId: string) {
  if (await hasCurrentTermsAccepted(userId)) return
  const cookieStore = await cookies()
  const pending = cookieStore.get('buzzel_pending_terms')?.value
  if (pending !== CURRENT_TERMS_VERSION) redirect('/declaration')
  await acceptCurrentTerms(userId)
}
