'use client'

import { useState } from 'react'

export function LocationFields({ prefix = 'breakdown', addressLabel = 'Where are you?', showDestination = false, initialLat, initialLng }: { prefix?: string; addressLabel?: string; showDestination?: boolean; initialLat?: number; initialLng?: number }) {
  const [status, setStatus] = useState<string>('')
  const locate = () => {
    if (!navigator.geolocation) return setStatus('Location is not supported by this browser.')
    setStatus('Getting your location…')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const latInput = document.querySelector<HTMLInputElement>(`input[name="${prefix}Lat"]`)
        const lngInput = document.querySelector<HTMLInputElement>(`input[name="${prefix}Lng"]`)
        const addressInput = document.querySelector<HTMLInputElement>(`input[name="${prefix}Address"]`)
        if (latInput) latInput.value = String(lat)
        if (lngInput) lngInput.value = String(lng)
        if (addressInput && !addressInput.value) addressInput.value = `Current location (${lat.toFixed(5)}, ${lng.toFixed(5)})`
        setStatus('Location captured. You can edit the address if needed.')
      },
      () => setStatus('Could not access your location. Enter the address manually.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return <div className="grid gap-4">
    <div>
      <label className="bz-label" htmlFor={`${prefix}Address`}>{addressLabel}</label>
      <div className="flex gap-2"><input className="bz-input" id={`${prefix}Address`} name={`${prefix}Address`} defaultValue={initialLat !== undefined && initialLng !== undefined ? `Captured emergency location (${initialLat.toFixed(5)}, ${initialLng.toFixed(5)})` : ''} placeholder="Enter an address or use current location" required /><button type="button" onClick={locate} className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">Use my location</button></div>
      <input type="hidden" name={`${prefix}Lat`} defaultValue={initialLat ?? ''}/><input type="hidden" name={`${prefix}Lng`} defaultValue={initialLng ?? ''}/>
      {status && <p className="mt-2 text-xs text-slate-500">{status}</p>}
    </div>
    {showDestination && <div><label className="bz-label" htmlFor="destinationAddress">Recovery destination</label><input className="bz-input" id="destinationAddress" name="destinationAddress" placeholder="Where should the vehicle be taken?" /><input type="hidden" name="destinationLat" /><input type="hidden" name="destinationLng" /><p className="bz-help mt-2">Distance pricing uses coordinates when available. The destination can be corrected before payment.</p></div>}
  </div>
}
