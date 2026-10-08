import type { RiskLevel } from '@/lib/types'

export type RiskArea = {
  id?: string
  name: string
  centerLat: number
  centerLng: number
  radiusKm: number
  level: RiskLevel
  securityFeeMinor: number
}

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const earthKm = 6371
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const lat1 = toRad(aLat)
  const lat2 = toRad(bLat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * earthKm * Math.asin(Math.sqrt(h))
}

export function assessRisk(lat: number, lng: number, areas: RiskArea[]) {
  const matched = areas.find((area) => haversineKm(lat, lng, area.centerLat, area.centerLng) <= area.radiusKm)
  if (!matched) {
    return { level: 'normal' as const, securityRequired: false, securityFeeMinor: 0, matchedArea: null }
  }
  return {
    level: matched.level,
    securityRequired: matched.level === 'high',
    securityFeeMinor: matched.level === 'high' ? matched.securityFeeMinor : 0,
    matchedArea: matched,
  }
}
