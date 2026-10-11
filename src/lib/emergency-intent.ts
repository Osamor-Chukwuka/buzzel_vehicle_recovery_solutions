const ORIGIN = 'https://buzzel.local'

function validCoordinate(value: string | number | null | undefined, min: number, max: number) {
  const numberValue = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numberValue) && numberValue >= min && numberValue <= max
}

export function emergencyRequestPath(lat?: string | number | null, lng?: string | number | null) {
  if (!validCoordinate(lat, -90, 90) || !validCoordinate(lng, -180, 180)) return '/requests/new'
  return `/requests/new?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`
}

export function normalizeEmergencyRequestPath(value?: string | null) {
  if (!value) return null

  try {
    const url = new URL(value, ORIGIN)
    if (url.origin !== ORIGIN || url.pathname !== '/requests/new') return null
    return emergencyRequestPath(url.searchParams.get('lat'), url.searchParams.get('lng'))
  } catch {
    return null
  }
}
