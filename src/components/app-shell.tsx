import Link from 'next/link'
import type { ReactNode } from 'react'
import type { AppRole, Profile } from '@/lib/types'
import { Logo } from './logo'
import { signOutAction } from '@/lib/actions/auth'
import { SubmitButton } from './submit-button'

const customer = [
  ['/dashboard', 'Home', '⌂'], ['/emergency', 'Emergency', '⌖'], ['/requests', 'Requests', '↗'], ['/vehicles', 'Vehicles', '▣'], ['/coverage', 'Coverage', '◆'], ['/profile', 'Profile', '○'],
] as const
// Assistance staff only need their job queue and their own profile.
const team = [['/team', 'Jobs', '◇'], ['/profile', 'Profile', '○']] as const
// Admin workspaces use the admin request/customer/finance tools, not customer flows.
const admin = [['/admin', 'Overview', '⌂'], ['/admin/requests', 'Requests', '↗'], ['/admin/customers', 'Customers', '▣'], ['/admin/finance', 'Coverage & payments', '◆'], ['/admin/team', 'Team', '◉'], ['/admin/disputes', 'Disputes', '!'], ['/profile', 'Profile', '○']] as const
const superAdmin = [...admin.slice(0, -1), ['/admin/audit', 'Audit', '≡'] as const, ['/admin/settings', 'Settings', '⚙'] as const, admin[admin.length - 1]]

function navFor(role: AppRole) { return role === 'customer' ? customer : role === 'team' ? team : role === 'super_admin' ? superAdmin : admin }
function mobileNavFor(role: AppRole) {
  const nav = navFor(role)
  return role === 'customer' ? nav.filter(([href]) => href !== '/profile') : nav
}

export function AppShell({ children, profile }: { children: ReactNode; profile?: Profile | null }) {
  const role = profile?.role ?? 'customer'
  const nav = navFor(role)
  const mobileNav = mobileNavFor(role)
  return <div className="min-h-screen bg-[#f5f7fa] pb-20 md:pb-0">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white p-5 md:flex md:flex-col">
      <Logo />
      <div className="mt-7 rounded-2xl bg-slate-50 p-3"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{profile ? 'Signed in as' : 'Browsing as'}</p><p className="mt-1 truncate text-sm font-extrabold text-slate-900">{profile?.full_name || 'Guest'}</p><p className="text-xs capitalize text-slate-500">{profile ? profile.role.replace('_', ' ') : 'Sign in to manage requests'}</p></div>
      <nav className="mt-6 grid gap-1" aria-label="Primary navigation">{nav.map(([href, label, icon]) => <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-[#c52626]"><span className="grid size-7 place-items-center rounded-lg bg-slate-100 text-xs" aria-hidden="true">{icon}</span>{label}</Link>)}</nav>
      <div className="mt-auto">{profile ? <form action={signOutAction}><SubmitButton pendingText="Signing out..." variant="ghost" className="w-full justify-start">Sign out</SubmitButton></form> : <Link href="/auth/login?next=/emergency" className="flex min-h-11 w-full items-center rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Sign in</Link>}</div>
    </aside>
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden"><div className="flex items-center justify-between"><Logo /><Link href={profile ? '/profile' : '/auth/login?next=/emergency'} aria-label={profile ? 'Open profile' : 'Sign in'} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold capitalize text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900">{profile ? profile.role.replace('_',' ') : 'Sign in'}</Link></div></header>
    <main className="md:ml-64"><div className="bz-container py-5 sm:py-7">{children}</div></main>
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_25px_rgba(15,23,42,.06)] md:hidden" aria-label="Mobile navigation"><div className="mx-auto flex max-w-full justify-start gap-1 overflow-x-auto px-1 md:max-w-md">{mobileNav.map(([href, label, icon]) => <Link key={href} href={href} className="flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] font-bold text-slate-500"><span className="text-base text-[#d92f2f]" aria-hidden="true">{icon}</span>{label}</Link>)}</div></nav>
  </div>
}
