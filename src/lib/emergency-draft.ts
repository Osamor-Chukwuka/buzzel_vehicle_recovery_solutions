export const EMERGENCY_DRAFT_STORAGE_KEY = 'buzzel_pending_emergency'

type EmergencyDraft = {
  lat: number
  lng: number
  expiresAt: number
}

const DRAFT_LIFETIME_MS = 60 * 60 * 1000

function validCoordinate(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max
}

export function saveEmergencyDraft(lat: number, lng: number) {
  if (typeof window === 'undefined' || !validCoordinate(lat, -90, 90) || !validCoordinate(lng, -180, 180)) return
  const draft: EmergencyDraft = { lat, lng, expiresAt: Date.now() + DRAFT_LIFETIME_MS }
  window.localStorage.setItem(EMERGENCY_DRAFT_STORAGE_KEY, JSON.stringify(draft))
}

export function readEmergencyDraft() {
  if (typeof window === 'undefined') return null

  try {
    const value = window.localStorage.getItem(EMERGENCY_DRAFT_STORAGE_KEY)
    if (!value) return null
    const draft = JSON.parse(value) as Partial<EmergencyDraft>
    if (typeof draft.lat !== 'number' || typeof draft.lng !== 'number' || typeof draft.expiresAt !== 'number' || draft.expiresAt <= Date.now() || !validCoordinate(draft.lat, -90, 90) || !validCoordinate(draft.lng, -180, 180)) {
      window.localStorage.removeItem(EMERGENCY_DRAFT_STORAGE_KEY)
      return null
    }
    return draft as EmergencyDraft
  } catch {
    window.localStorage.removeItem(EMERGENCY_DRAFT_STORAGE_KEY)
    return null
  }
}

export function clearEmergencyDraft() {
  if (typeof window !== 'undefined') window.localStorage.removeItem(EMERGENCY_DRAFT_STORAGE_KEY)
}
