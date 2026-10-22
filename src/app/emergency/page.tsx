import { EmergencyLocator } from '@/components/emergency-locator'
import { AppShell } from '@/components/app-shell'
import { getCurrentUser, getProfile } from '@/lib/supabase/auth'
import { hasCurrentTermsAccepted } from '@/lib/terms'
import { Icon } from '@/components/icon'

export default async function EmergencyPage() {
  const user = await getCurrentUser()
  const profile = user ? await getProfile(user.id) : null
  const declarationRequired = user ? !(await hasCurrentTermsAccepted(user.id)) : true

  return <AppShell profile={profile}><section className="mx-auto max-w-6xl py-4 sm:py-8">
    <div className="mx-auto max-w-3xl text-center"><p className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-[var(--buzzel-red)] shadow-sm"><span className="size-1.5 rounded-full bg-red-500"/>Emergency assistance</p><h1 className="mt-4 text-4xl font-black tracking-[-.045em] text-slate-950 sm:text-5xl">Get the right help, faster.</h1><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">Capture your location and use Buzzel AI to describe or photograph the problem. You remain in control before anything is submitted.</p></div>

    <div className="mx-auto mt-8 max-w-3xl">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_22px_55px_rgba(15,23,42,.08)] sm:p-8" aria-labelledby="location-capture-title">
        <div className="mb-8 flex items-start gap-3 text-left"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-red-50 text-[var(--buzzel-red)]"><Icon name="location" className="size-5"/></span><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Step one</p><h2 id="location-capture-title" className="mt-1 text-xl font-black text-slate-950">Share your location</h2><p className="mt-1 text-xs leading-5 text-slate-500">This helps the recovery team find the correct roadside position.</p></div></div>
        <EmergencyLocator declarationRequired={declarationRequired} />
      </section>
    </div>

  </section></AppShell>
}
