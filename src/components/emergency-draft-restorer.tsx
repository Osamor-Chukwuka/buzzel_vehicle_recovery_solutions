'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { clearEmergencyDraft, readEmergencyDraft } from '@/lib/emergency-draft'

export function EmergencyDraftRestorer() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')
    const currentLat = Number(latParam)
    const currentLng = Number(lngParam)
    const hasLocation = latParam !== null && lngParam !== null && Number.isFinite(currentLat) && currentLat >= -90 && currentLat <= 90 && Number.isFinite(currentLng) && currentLng >= -180 && currentLng <= 180
    if (hasLocation) {
      clearEmergencyDraft()
      return
    }

    const draft = readEmergencyDraft()
    if (!draft) return
    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.set('lat', String(draft.lat))
    nextParams.set('lng', String(draft.lng))
    router.replace(`${pathname}?${nextParams.toString()}`)
  }, [pathname, router, searchParams])

  return null
}
