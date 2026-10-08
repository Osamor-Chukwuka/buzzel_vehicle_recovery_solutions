'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapCard } from './map-card'

type LocationState = { lat: number; lng: number } | null

function LocationIcon() {
  return <svg viewBox="0 0 64 64" className="size-16" fill="none" aria-hidden="true">
    <path d="M32 57s18-15.12 18-32A18 18 0 1 0 14 25c0 16.88 18 32 18 32Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="32" cy="25" r="7" stroke="currentColor" strokeWidth="4"/>
  </svg>
}

export function EmergencyLocator({ declarationRequired = true }: { declarationRequired?: boolean }) {
  const [message, setMessage] = useState('We can use your location to help the recovery team find you faster.')
  const nextPath = declarationRequired ? '/declaration' : '/requests/new'
  const [href, setHref] = useState(nextPath)
  const [location, setLocation] = useState<LocationState>(null)
  const [isLocating, setIsLocating] = useState(false)
  const locate = () => {
    if (!navigator.geolocation) {
      setMessage('Location is not supported by this browser. You can continue and enter the address manually.')
      return
    }
    setIsLocating(true)
    setMessage('Getting your location…')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setHref(`${nextPath}?lat=${coords.latitude}&lng=${coords.longitude}`)
        setLocation({ lat: coords.latitude, lng: coords.longitude })
        setMessage('Location captured successfully. Check it below, then continue.')
        setIsLocating(false)
      },
      () => {
        setMessage('Location access was unavailable. You can still continue and enter it manually.')
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }
  return <div className="text-center">
    <button type="button" onClick={locate} disabled={isLocating} aria-label="Capture my location for emergency assistance" aria-busy={isLocating} className="mx-auto grid size-40 cursor-pointer place-items-center rounded-full bg-[var(--buzzel-red)] text-white shadow-[0_0_0_18px_rgba(201,35,47,.09),0_20px_45px_rgba(201,35,47,.28)] transition duration-200 hover:bg-[var(--buzzel-red-dark)] active:scale-[.98] disabled:cursor-wait disabled:opacity-75">
      <LocationIcon />
    </button>
    <p className="mt-6 text-sm font-extrabold text-slate-900">{isLocating ? 'Locating you…' : location ? 'Location captured' : 'Use my current location'}</p>
    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600" aria-live="polite">{message}</p>
    {location && <div className="mt-6 text-left"><MapCard lat={location.lat} lng={location.lng} label="Your captured location" /></div>}
    <Link href={href} className="mt-6 inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-slate-900 px-6 font-bold text-white transition-colors hover:bg-slate-700 sm:w-auto">Continue</Link>
  </div>
}
