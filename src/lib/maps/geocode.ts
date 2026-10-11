export async function geocodeAddress(address: string) {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return null
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('address', address)
  url.searchParams.set('key', key)
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) return null
  const data = await response.json()
  const first = data.results?.[0]
  if (!first) return null
  return {
    address: first.formatted_address as string,
    lat: first.geometry.location.lat as number,
    lng: first.geometry.location.lng as number,
  }
}

export async function reverseGeocodeLocation(lat: number, lng: number) {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key || !Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('latlng', `${lat},${lng}`)
  url.searchParams.set('key', key)

  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) return null

  const data = await response.json()
  const first = data.results?.[0]
  if (!first?.formatted_address) return null

  return { address: first.formatted_address as string }
}
