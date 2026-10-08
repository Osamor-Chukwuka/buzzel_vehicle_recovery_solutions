'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'

export async function sendMessageAction(requestId: string, formData: FormData) {
  const user = await requireUser()
  const body = z.string().trim().min(1).max(4000).parse(formData.get('body'))
  const supabase = await createClient()
  const { error } = await supabase.from('request_messages').insert({ request_id: requestId, sender_user_id: user.id, body })
  if (error) throw error
  revalidatePath(`/requests/${requestId}`)
  revalidatePath(`/admin/requests/${requestId}`)
}
