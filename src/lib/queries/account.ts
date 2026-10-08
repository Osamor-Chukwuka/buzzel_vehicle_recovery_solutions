import { createClient } from '@/lib/supabase/server'
import type { AccountType } from '@/lib/types'

export type CurrentAccount = {
  id: string
  account_type: AccountType
  name: string
  owner_user_id: string
}

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
  return (data?.accounts as unknown as CurrentAccount | null) ?? null
}
