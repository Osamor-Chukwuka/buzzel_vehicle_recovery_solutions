import Link from 'next/link'
import type { ReactNode } from 'react'
import type { AppRole, Profile } from '@/lib/types'
import { Logo } from './logo'
import { signOutAction } from '@/lib/actions/auth'
import { SubmitButton } from './submit-button'
import { DesktopNavigation, MobileNavigation, type NavigationItem } from './app-navigation'

const customer = [
  ['/dashboard', 'Home', 'home'],
  ['/emergency', 'Emergency', 'emergency'],
  ['/requests', 'Requests', 'requests'],
  ['/vehicles', 'Vehicles', 'vehicle'],
  ['/coverage', 'Coverage', 'coverage'],
  ['/profile', 'Profile', 'profile'],
] as const satisfies readonly NavigationItem[]

const team = [
  ['/team', 'Jobs', 'jobs'],
  ['/profile', 'Profile', 'profile'],
] as const satisfies readonly NavigationItem[]

const admin = [
  ['/admin', 'Overview', 'home'],
  ['/admin/requests', 'Requests', 'requests'],
  ['/admin/customers', 'Customers', 'customers'],
  ['/admin/finance', 'Coverage & payments', 'finance'],
  ['/admin/team', 'Team', 'team'],
  ['/admin/disputes', 'Disputes', 'disputes'],
  ['/profile', 'Profile', 'profile'],
] as const satisfies readonly NavigationItem[]

const superAdmin = [
  ...admin.slice(0, -1),
  ['/admin/audit', 'Audit', 'audit'] as const,
  ['/admin/settings', 'Settings', 'settings'] as const,
  admin[admin.length - 1],
] satisfies readonly NavigationItem[]

function navFor(role: AppRole): readonly NavigationItem[] {
  return role === 'customer' ? customer : role === 'team' ? team : role === 'super_admin' ? superAdmin : admin
}

function mobileNavFor(role: AppRole) {
  const nav = navFor(role)
  return role === 'customer' ? nav.filter(([href]) => href !== '/profile') : nav
}

export function AppShell({ children, profile }: { children: ReactNode; profile?: Profile | null }) {
  const role = profile?.role ?? 'customer'
  const nav = navFor(role)
  const mobileNav = mobileNavFor(role)
  const roleLabel = profile ? profile.role.replace('_', ' ') : 'Guest'

  return <div className="app-canvas min-h-dvh pb-20 md:pb-0">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[17.5rem] overflow-hidden bg-[#101827] px-5 py-6 text-white md:flex md:flex-col">
      <div className="pointer-events-none absolute -left-24 top-1/3 size-64 rounded-full bg-red-600/15 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 -top-16 size-52 rounded-full bg-blue-500/10 blur-3xl" aria-hidden="true" />
      <div className="relative"><Logo inverse /></div>

      <div className="relative mt-8 rounded-[1.35rem] border border-white/10 bg-white/[.06] p-4 shadow-inner backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-sm font-black text-white shadow-lg shadow-red-950/20" aria-hidden="true">{profile?.full_name?.charAt(0).toUpperCase() || 'B'}</div>
          <div className="min-w-0"><p className="truncate text-sm font-extrabold text-white">{profile?.full_name || 'Guest user'}</p><p className="mt-0.5 text-[11px] font-bold capitalize tracking-wide text-slate-400">{roleLabel}</p></div>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto bz-scrollbar"><DesktopNavigation items={nav} /></div>

      <div className="relative mt-4 border-t border-white/10 pt-4">
        {profile ? <form action={signOutAction}><SubmitButton pendingText="Signing out..." variant="sidebar" className="w-full justify-start">Sign out</SubmitButton></form> : <Link href="/auth/login?next=/emergency" className="flex min-h-12 w-full items-center rounded-2xl border border-white/10 bg-white/[.06] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10">Sign in</Link>}
        <p className="mt-4 text-center text-[10px] font-semibold uppercase tracking-[.18em] text-slate-600">Recovery, coordinated</p>
      </div>
    </aside>

    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 px-4 py-3 shadow-[0_8px_30px_rgba(15,23,42,.05)] backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-between gap-3"><Logo /><Link href={profile ? '/profile' : '/auth/login?next=/emergency'} aria-label={profile ? 'Open profile' : 'Sign in'} className="inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-white px-3 text-[11px] font-extrabold capitalize text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-950">{profile ? roleLabel : 'Sign in'}</Link></div>
    </header>

    <main id="main-content" className="md:ml-[17.5rem]"><div className="bz-app-container py-5 sm:py-8">{children}</div></main>
    <MobileNavigation items={mobileNav} />
  </div>
}
