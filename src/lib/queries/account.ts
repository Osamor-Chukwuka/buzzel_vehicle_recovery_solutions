import { createClient } from '@/lib/supabase/server'

export async function getCurrentAccount(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('account_members')
    .select('account_id, is_owner, accounts(id, account_type, name, owner_user_id)')
    .eq('user_id', userId)
    .order('is_owner', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data?.accounts ?? null
}
