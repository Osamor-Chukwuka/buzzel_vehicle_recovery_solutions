export function MapCard({ lat, lng, label }: { lat: number | null; lng: number | null; label?: string }) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (lat == null || lng == null) return <div className="grid h-44 place-items-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-500">Map location not available</div>
  if (!key) return <div className="grid h-44 place-items-center rounded-2xl bg-slate-100 p-4 text-center text-sm text-slate-600"><div><p className="font-bold">{label || 'Request location'}</p><p className="mt-1 text-xs">{lat.toFixed(5)}, {lng.toFixed(5)}</p><a className="mt-3 inline-block font-bold text-[#c52626]" href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noreferrer">Open in Google Maps</a></div></div>
  const src = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${lat},${lng}`
  return <iframe title="Request map" className="h-48 w-full rounded-2xl border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={src} />
}
