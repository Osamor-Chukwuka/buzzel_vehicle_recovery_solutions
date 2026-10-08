'use client'

import { useState } from 'react'
import Link from 'next/link'

export function EmergencyLocator() {
  const [message, setMessage] = useState('We can use your location to help the recovery team find you faster.')
  const [href, setHref] = useState('/declaration')
  const locate = () => {
    setMessage('Getting your location…')
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => {
        setHref(`/declaration?lat=${coords.latitude}&lng=${coords.longitude}`)
        setMessage('Location captured. Continue to request assistance.')
      },
      () => setMessage('Location access was unavailable. You can still continue and enter it manually.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }
  return <div className="text-center"><button onClick={locate} aria-label="Capture location for emergency assistance" className="mx-auto grid size-36 place-items-center rounded-full bg-[#d92f2f] text-4xl text-white shadow-[0_0_0_18px_rgba(217,47,47,.08),0_18px_40px_rgba(217,47,47,.25)] transition hover:scale-[1.02]">☎</button><p className="mx-auto mt-8 max-w-sm text-sm leading-6 text-slate-500">{message}</p><Link href={href} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-slate-900 px-5 font-bold text-white sm:w-auto">Continue</Link></div>
}
