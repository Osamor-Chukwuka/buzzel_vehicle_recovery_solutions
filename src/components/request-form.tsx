'use client'

import { useMemo, useState, useSyncExternalStore } from 'react'
import { LocationFields } from './location-fields'
import { clearAIRecoveryDraft, getAIRecoveryDraftSnapshot, parseAIRecoveryDraft, subscribeAIRecoveryDraft } from '@/lib/ai/draft'
import { Icon } from './icon'

const getServerDraftSnapshot = () => null

export function RequestFormFields({ initialLat, initialLng }: { initialLat?: number; initialLng?: number }) {
  const draftSnapshot = useSyncExternalStore(subscribeAIRecoveryDraft, getAIRecoveryDraftSnapshot, getServerDraftSnapshot)
  const aiDraft = useMemo(() => parseAIRecoveryDraft(draftSnapshot), [draftSnapshot])
  const suggestedService = aiDraft?.assessment.recommendedService === 'roadside_assistance' || aiDraft?.assessment.recommendedService === 'vehicle_recovery' ? aiDraft.assessment.recommendedService : 'roadside_assistance'
  const [serviceOverride, setServiceOverride] = useState<'roadside_assistance'|'vehicle_recovery'|null>(null)
  const [detailsOverride, setDetailsOverride] = useState<string | null>(null)
  const service = serviceOverride ?? suggestedService
  const details = detailsOverride ?? aiDraft?.assistanceDetails ?? ''

  const removeAiDraft = () => {
    clearAIRecoveryDraft()
    setServiceOverride('roadside_assistance')
    setDetailsOverride('')
  }

  return <>
    {aiDraft?.assessment.recommendedService === 'emergency_services' && <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-red-600 text-white"><Icon name="shield" className="size-4"/></span><div><p className="text-sm font-black text-red-950">Contact emergency services first</p><p className="mt-1 text-xs leading-5 text-red-700">The AI assessment identified a possible immediate danger. A Buzzel recovery request does not replace the appropriate emergency service.</p></div></div>}
    {aiDraft && <div className="flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-600 text-white"><Icon name="spark" className="size-4"/></span><div className="min-w-0 flex-1"><p className="text-sm font-black text-violet-950">Buzzel AI assessment applied</p><p className="mt-1 text-xs leading-5 text-violet-700">The recommended service and incident details were added below. Review and edit them before continuing.</p></div><button type="button" onClick={removeAiDraft} className="cursor-pointer rounded-lg px-2 py-1 text-xs font-bold text-violet-700 hover:bg-violet-100">Remove</button></div>}
    <div><label className="bz-label">Service needed</label><div className="grid grid-cols-2 gap-2"><label className={`cursor-pointer rounded-2xl border p-4 ${service === 'roadside_assistance' ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}><input className="sr-only" type="radio" name="serviceType" value="roadside_assistance" checked={service === 'roadside_assistance'} onChange={() => setServiceOverride('roadside_assistance')}/><span className="block font-black">Roadside assistance</span><span className="mt-1 block text-xs leading-5 text-slate-500">Help at the breakdown location.</span></label><label className={`cursor-pointer rounded-2xl border p-4 ${service === 'vehicle_recovery' ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}><input className="sr-only" type="radio" name="serviceType" value="vehicle_recovery" checked={service === 'vehicle_recovery'} onChange={() => setServiceOverride('vehicle_recovery')}/><span className="block font-black">Vehicle recovery</span><span className="mt-1 block text-xs leading-5 text-slate-500">Tow or transport the vehicle.</span></label></div></div>
    <LocationFields showDestination={service === 'vehicle_recovery'} initialLat={initialLat} initialLng={initialLng}/>
    <div><label className="bz-label">Anything the team should know?</label><textarea className="bz-input min-h-24 resize-y" name="assistanceDetails" value={details} onChange={(event) => setDetailsOverride(event.target.value)} placeholder="Breakdown symptoms, landmark, access instructions…" maxLength={1000}/></div>
  </>
}
