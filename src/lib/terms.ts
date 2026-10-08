import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function ensureCurrentTermsAccepted(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('terms_acceptances').select('id').eq('user_id', userId).eq('terms_version', '2026-10-08').limit(1).maybeSingle()
  if (data) return
  const cookieStore = await cookies()
  const pending = cookieStore.get('buzzel_pending_terms')?.value
  if (pending !== '2026-10-08') redirect('/declaration')
  const { error } = await supabase.from('terms_acceptances').insert({
    user_id: userId, declaration_version: '2026-10-08', terms_version: '2026-10-08', privacy_version: '2026-10-08',
  })
  if (error) throw error
  cookieStore.delete('buzzel_pending_terms')
}
