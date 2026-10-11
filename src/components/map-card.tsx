export function MapCard({ lat, lng, label }: { lat: number | null; lng: number | null; label?: string }) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (lat == null || lng == null) return <div className="grid h-44 place-items-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-500">Map location not available</div>
  if (!key) {
    const padding = 0.008
    const bbox = [lng - padding, lat - padding, lng + padding, lat + padding].join(',')
    const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lng}`)}`
    return <iframe title={label || 'Request map'} className="h-48 w-full rounded-2xl border-0" loading="lazy" src={src} />
  }
  const src = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${lat},${lng}&maptype=satellite`
  return <iframe title="Request map" className="h-48 w-full rounded-2xl border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={src} />
}
