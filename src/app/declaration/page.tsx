import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Logo } from '@/components/logo'
import { continueFromDeclarationAction } from '@/lib/actions/terms'
import { ErrorNotice } from '@/components/ui'
import { SubmitButton } from '@/components/submit-button'
import { getCurrentUser } from '@/lib/supabase/auth'
import { hasCurrentTermsAccepted } from '@/lib/terms'

export default async function DeclarationPage({ searchParams }: { searchParams: Promise<{ error?: string; lat?: string; lng?: string }> }) {
  const { error, lat, lng } = await searchParams
  const hasCapturedLocation = lat && lng && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
  const requestPath = hasCapturedLocation ? `/requests/new?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}` : '/requests/new'
  const user = await getCurrentUser()
  if (user && await hasCurrentTermsAccepted(user.id)) redirect(requestPath)
  return <main className="min-h-screen bg-[#f7f8fa]"><header className="bg-[#d92f2f] px-4 py-4"><div className="mx-auto flex max-w-md justify-center sm:justify-start"><Logo inverse /></div></header><div className="mx-auto max-w-md px-5 py-8"><h1 className="text-2xl font-black">Declaration & Terms</h1><p className="mt-2 text-sm leading-6 text-slate-500">Before continuing, confirm you are authorised to request assistance for this vehicle and accept Buzzel&apos;s service terms.</p><div className="mt-5"><ErrorNotice message={error} /></div><form action={continueFromDeclarationAction} className="mt-5 grid gap-3"><input type="hidden" name="lat" value={lat || ''}/><input type="hidden" name="lng" value={lng || ''}/>
    <label className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4"><input type="checkbox" name="declaration" className="mt-1 size-4 accent-[#d92f2f]"/><span><strong className="text-sm">Vehicle declaration</strong><span className="mt-1 block text-xs leading-5 text-slate-500">I confirm that I am the owner or an authorised driver/representative of the vehicle and that the information I provide is accurate.</span></span></label>
    <label className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4"><input type="checkbox" name="terms" className="mt-1 size-4 accent-[#d92f2f]"/><span className="text-sm">I agree to the <Link className="font-bold text-[#c52626] underline" href="/terms" target="_blank">Terms & Conditions</Link>, including applicable charges, location sharing and service coordination.</span></label>
    <label className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4"><input type="checkbox" name="privacy" className="mt-1 size-4 accent-[#d92f2f]"/><span className="text-sm">I have read the <Link className="font-bold text-[#c52626] underline" href="/privacy" target="_blank">Privacy Policy</Link>.</span></label>
    <SubmitButton pendingText="Saving acceptance…" className="mt-2 w-full">Continue</SubmitButton>
  </form></div></main>
}
