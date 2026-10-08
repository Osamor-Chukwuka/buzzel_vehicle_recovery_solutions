'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const loginSchema = z.object({ email: z.email(), password: z.string().min(6), next: z.string().optional() })
const signupSchema = z.object({
  fullName: z.string().min(2), email: z.email(), phone: z.string().min(7), password: z.string().min(8),
  accountType: z.enum(['individual', 'company']), companyName: z.string().optional(), invite: z.string().optional(), next: z.string().optional(),
})

function safeNext(value?: string) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/dashboard'
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({ email: formData.get('email'), password: formData.get('password'), next: formData.get('next') || undefined })
  if (!parsed.success) redirect('/auth/login?error=Please+check+your+email+and+password')
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password })
  if (error) redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
  redirect(safeNext(parsed.data.next))
}

export async function signupAction(formData: FormData) {
  const parsed = signupSchema.safeParse({
    fullName: formData.get('fullName'), email: formData.get('email'), phone: formData.get('phone'), password: formData.get('password'),
    accountType: formData.get('accountType'), companyName: formData.get('companyName') || undefined,
    invite: formData.get('invite') || undefined, next: formData.get('next') || undefined,
  })
  if (!parsed.success) redirect('/auth/signup?error=Please+complete+all+required+fields')
  if (parsed.data.accountType === 'company' && !parsed.data.companyName?.trim() && !parsed.data.invite) redirect('/auth/signup?error=Company+name+is+required')

  const supabase = await createClient()
  const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const next = safeNext(parsed.data.next)
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        account_type: parsed.data.accountType,
        company_name: parsed.data.companyName || null,
        invite_token: parsed.data.invite || null,
      },
    },
  })
  if (error) redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`)
  redirect('/auth/check-email')
}

export async function googleSignInAction(formData?: FormData) {
  const supabase = await createClient()
  const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const next = safeNext(formData?.get('next')?.toString())
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` } })
  if (error || !data.url) redirect('/auth/login?error=Could+not+start+Google+sign-in')
  redirect(data.url)
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
