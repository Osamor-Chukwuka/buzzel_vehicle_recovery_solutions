import Link from 'next/link'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2 font-black tracking-tight text-slate-900">
      <span className="grid size-9 place-items-center rounded-xl bg-[#d92f2f] text-sm font-black text-white shadow-sm">B</span>
      {!compact && <span className="text-lg">BUZZEL</span>}
    </Link>
  )
}
