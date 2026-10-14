import { EmergencyLocator } from '@/components/emergency-locator'
import { AppShell } from '@/components/app-shell'
import { getCurrentUser, getProfile } from '@/lib/supabase/auth'
import { hasCurrentTermsAccepted } from '@/lib/terms'
import { SupportCallout } from '@/components/support-callout'

export default async function EmergencyPage() {
  const user = await getCurrentUser()
  const profile = user ? await getProfile(user.id) : null
  const declarationRequired = user ? !(await hasCurrentTermsAccepted(user.id)) : true

  return <AppShell profile={profile}><section className="mx-auto max-w-md py-6 sm:py-10"><div className="text-center"><p className="text-xs font-black uppercase tracking-[.18em] text-[var(--buzzel-red)]">Emergency assistance</p><h1 className="mt-2 text-3xl font-black tracking-tight">Emergency?</h1><p className="mt-2 text-sm text-slate-500">Tap the button to capture your location, then continue to request immediate assistance.</p></div><div className="mt-12"><EmergencyLocator declarationRequired={declarationRequired} /></div><SupportCallout className="mt-8" /><p className="mt-6 text-center text-xs leading-5 text-slate-400">If you are in immediate danger, contact the appropriate local emergency service first.</p></section></AppShell>
}
