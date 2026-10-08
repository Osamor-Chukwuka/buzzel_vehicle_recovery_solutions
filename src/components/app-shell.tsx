import Link from 'next/link'
import type { ReactNode } from 'react'
import type { AppRole, Profile } from '@/lib/types'
import { Logo } from './logo'
import { signOutAction } from '@/lib/actions/auth'

const customer = [
  ['/dashboard', 'Home', '⌂'], ['/requests', 'Requests', '↗'], ['/vehicles', 'Vehicles', '▣'], ['/coverage', 'Coverage', '◆'], ['/profile', 'Profile', '○'],
] as const
const team = [['/team', 'Jobs', '▤'], ['/requests', 'Requests', '↗'], ['/profile', 'Profile', '○']] as const
const admin = [['/admin', 'Overview', '⌂'], ['/admin/requests', 'Requests', '↗'], ['/admin/customers', 'Customers', '▣'], ['/admin/finance', 'Coverage & payments', '◆'], ['/admin/team', 'Team', '◎'], ['/admin/disputes', 'Disputes', '!'], ['/profile', 'Profile', '○']] as const
const superAdmin = [...admin.slice(0, -1), ['/admin/audit', 'Audit', '≡'] as const, ['/admin/settings', 'Settings', '⚙'] as const, admin[admin.length - 1]]

function navFor(role: AppRole) { return role === 'customer' ? customer : role === 'team' ? team : role === 'super_admin' ? superAdmin : admin }

export function AppShell({ children, profile }: { children: ReactNode; profile: Profile }) {
  const nav = navFor(profile.role)
  return <div className="min-h-screen bg-[#f5f7fa] pb-20 md:pb-0">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white p-5 md:flex md:flex-col">
      <Logo />
      <div className="mt-7 rounded-2xl bg-slate-50 p-3"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Signed in as</p><p className="mt-1 truncate text-sm font-extrabold text-slate-900">{profile.full_name || 'Buzzel user'}</p><p className="text-xs capitalize text-slate-500">{profile.role.replace('_', ' ')}</p></div>
      <nav className="mt-6 grid gap-1">{nav.map(([href,label,icon]) => <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-[#c52626]"><span className="grid size-7 place-items-center rounded-lg bg-slate-100 text-xs">{icon}</span>{label}</Link>)}</nav>
      <div className="mt-auto"><form action={signOutAction}><button className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-left text-sm font-bold text-slate-600 hover:bg-slate-50">Sign out</button></form></div>
    </aside>
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden"><div className="flex items-center justify-between"><Logo /><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold capitalize text-slate-600">{profile.role.replace('_',' ')}</span></div></header>
    <main className="md:ml-64"><div className="bz-container py-5 sm:py-7">{children}</div></main>
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_25px_rgba(15,23,42,.06)] md:hidden"><div className="mx-auto flex max-w-full justify-start gap-1 overflow-x-auto px-1 md:max-w-md">{nav.map(([href,label,icon]) => <Link key={href} href={href} className="flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] font-bold text-slate-500"><span className="text-base text-[#d92f2f]">{icon}</span>{label}</Link>)}</div></nav>
  </div>
}
