import Link from 'next/link'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label="Buzzel Vehicle Recovery Solutions home" className="group inline-flex cursor-pointer items-center gap-2.5 text-slate-950">
      <span className="grid size-10 shrink-0 place-items-center rounded-[14px] border border-white/70 bg-white shadow-[0_5px_18px_rgba(15,23,42,.14)] transition-transform duration-200 group-hover:-translate-y-0.5">
        <svg viewBox="0 0 40 40" className="size-9" aria-hidden="true">
          <path d="M20 4.75c-7.08 0-12.5 5.42-12.5 12.28 0 8.58 10.83 17.22 11.29 17.58a1.95 1.95 0 0 0 2.42 0c.46-.36 11.29-9 11.29-17.58C32.5 10.17 27.08 4.75 20 4.75Z" fill="var(--buzzel-red)"/>
          <path d="M15.5 11.8v11.7m0-11.7h4.65c2.35 0 3.85 1.25 3.85 3.18s-1.5 3.17-3.85 3.17H15.5m4.95 0c2.48 0 4.05 1.28 4.05 3.28 0 2.02-1.57 3.37-4.05 3.37H15.5" fill="none" stroke="white" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      {!compact && <span className="leading-none"><span className="block text-[1.05rem] font-black tracking-[.08em]">BUZZEL</span><span className="mt-1 block text-[.56rem] font-bold uppercase tracking-[.2em] text-slate-500">Vehicle recovery</span></span>}
    </Link>
  )
}
