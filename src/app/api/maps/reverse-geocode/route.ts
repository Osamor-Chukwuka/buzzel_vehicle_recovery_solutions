import { NextResponse } from 'next/server'
import { reverseGeocodeLocation } from '@/lib/maps/geocode'

function parseCoordinate(value: string | null, minimum: number, maximum: number) {
  if (!value) return null
  const coordinate = Number(value)
  return Number.isFinite(coordinate) && coordinate >= minimum && coordinate <= maximum ? coordinate : null
}

// This endpoint intentionally supports guests: emergency location can be captured before sign-in.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const lat = parseCoordinate(params.get('lat'), -90, 90)
  const lng = parseCoordinate(params.get('lng'), -180, 180)

  if (lat === null || lng === null) {
    return NextResponse.json({ error: 'A valid latitude and longitude are required.' }, { status: 400 })
  }

  const result = await reverseGeocodeLocation(lat, lng)
  if (!result) return NextResponse.json({ found: false })

  return NextResponse.json({ found: true, ...result })
}
