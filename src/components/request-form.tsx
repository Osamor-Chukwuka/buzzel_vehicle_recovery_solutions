'use client'

import { useState } from 'react'
import { LocationFields } from './location-fields'

export function RequestFormFields({ initialLat, initialLng }: { initialLat?: number; initialLng?: number }) {
  const [service, setService] = useState<'roadside_assistance'|'vehicle_recovery'>('roadside_assistance')
  return <>
    <div><label className="bz-label">Service needed</label><div className="grid grid-cols-2 gap-2"><label className={`cursor-pointer rounded-2xl border p-4 ${service === 'roadside_assistance' ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}><input className="sr-only" type="radio" name="serviceType" value="roadside_assistance" checked={service === 'roadside_assistance'} onChange={() => setService('roadside_assistance')}/><span className="block font-black">Roadside assistance</span><span className="mt-1 block text-xs leading-5 text-slate-500">Help at the breakdown location.</span></label><label className={`cursor-pointer rounded-2xl border p-4 ${service === 'vehicle_recovery' ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}><input className="sr-only" type="radio" name="serviceType" value="vehicle_recovery" checked={service === 'vehicle_recovery'} onChange={() => setService('vehicle_recovery')}/><span className="block font-black">Vehicle recovery</span><span className="mt-1 block text-xs leading-5 text-slate-500">Tow or transport the vehicle.</span></label></div></div>
    <LocationFields showDestination={service === 'vehicle_recovery'} initialLat={initialLat} initialLng={initialLng} />
    <div><label className="bz-label">Anything the team should know?</label><textarea className="bz-input min-h-24 resize-y" name="assistanceDetails" placeholder="Breakdown symptoms, landmark, access instructions…" maxLength={1000}/></div>
  </>
}
