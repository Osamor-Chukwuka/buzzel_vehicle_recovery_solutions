export async function sendEmail(input: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    if (process.env.NODE_ENV === 'production' && process.env.BUZZEL_DEMO_MODE !== 'true') {
      throw new Error('Email delivery is not configured')
    }
    console.info('[email:demo]', input.subject, '->', input.to)
    return { id: 'demo-email' }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'Buzzel <onboarding@resend.dev>',
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  })
  if (!response.ok) throw new Error(`Email delivery failed: ${await response.text()}`)
  return response.json() as Promise<{ id: string }>
}


export async function sendUserEmail(userId: string, subject: string, html: string) {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.getUserById(userId)
  if (error || !data.user?.email) return null
  return sendEmail({ to: data.user.email, subject, html })
}
