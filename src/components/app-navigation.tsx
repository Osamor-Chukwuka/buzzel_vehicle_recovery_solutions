'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon, type IconName } from './icon'

export type NavigationItem = readonly [href: string, label: string, icon: IconName]

function isCurrentPath(pathname: string, href: string) {
  if (href === '/dashboard' || href === '/admin' || href === '/team' || href === '/profile') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DesktopNavigation({ items }: { items: readonly NavigationItem[] }) {
  const pathname = usePathname()

  return <nav className="mt-7 grid gap-1.5" aria-label="Primary navigation">
    {items.map(([href, label, icon]) => {
      const active = isCurrentPath(pathname, href)
      return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`group flex min-h-12 items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-bold transition-all duration-200 ${active ? 'bg-white text-slate-950 shadow-[0_10px_28px_rgba(0,0,0,.18)]' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}>
        <span className={`grid size-9 shrink-0 place-items-center rounded-xl transition-colors duration-200 ${active ? 'bg-red-50 text-[var(--buzzel-red)]' : 'bg-white/8 text-slate-300 group-hover:bg-white/12 group-hover:text-white'}`}><Icon name={icon} className="size-[18px]" /></span>
        <span>{label}</span>
        {active ? <span className="ml-auto size-1.5 rounded-full bg-[var(--buzzel-red)]" aria-hidden="true" /> : null}
      </Link>
    })}
  </nav>
}

export function MobileNavigation({ items }: { items: readonly NavigationItem[] }) {
  const pathname = usePathname()

  return <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/92 px-2 pb-[max(.55rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_35px_rgba(15,23,42,.10)] backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
    <div className="mx-auto flex max-w-full justify-start gap-1 overflow-x-auto px-1 bz-scrollbar">
      {items.map(([href, label, icon]) => {
        const active = isCurrentPath(pathname, href)
        return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`flex min-h-12 min-w-[4.25rem] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-extrabold transition-colors ${active ? 'bg-red-50 text-[var(--buzzel-red)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
          <Icon name={icon} className="size-[19px]" />
          <span>{label}</span>
        </Link>
      })}
    </div>
  </nav>
}
