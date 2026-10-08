'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser()
  const parsed = z.object({ fullName: z.string().min(2).max(100), phone: z.string().min(7).max(30) }).parse({ fullName: formData.get('fullName'), phone: formData.get('phone') })
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ full_name: parsed.fullName, phone: parsed.phone }).eq('id', user.id)
  if (error) throw error
  revalidatePath('/profile')
}
