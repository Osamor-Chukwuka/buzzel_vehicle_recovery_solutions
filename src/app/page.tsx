import Image from 'next/image'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Card, LinkButton } from '@/components/ui'
import { SupportCallout } from '@/components/support-callout'

export default function HomePage() {
  return <main className="min-h-screen bg-white">
    <header className="border-b border-slate-100 bg-white">
      <div className="bz-container flex min-h-20 items-center justify-between gap-4 py-3">
        <Logo />
        <div className="flex items-center gap-2">
          <Link href="/auth/login" className="hidden min-h-11 cursor-pointer items-center px-3 py-2 text-sm font-bold text-slate-600 hover:text-slate-950 sm:inline-flex">Sign in</Link>
          <LinkButton href="/auth/signup" className="min-h-11 px-3 py-2 sm:px-4">Create account</LinkButton>
        </div>
      </div>
    </header>

    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(201,35,47,.13),transparent_35%),linear-gradient(180deg,#fff,#f8fafc)] py-12 sm:py-18 lg:py-22">
      <div className="bz-container grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-14">
        <div>
          <span className="inline-flex rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#a91d27]">Roadside help when it matters</span>
          <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-[-.04em] text-slate-950 sm:text-6xl">Assistance, recovery and vehicle cover in one place.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Register a vehicle or fleet, pay once for annual coverage, or request and pay for a one-off roadside job. Buzzel coordinates the request from location capture through assignment and completion.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/emergency" className="min-h-13 px-6 text-base">I need help now</LinkButton>
            <LinkButton href="/coverage" variant="ghost" className="min-h-13 px-6 text-base">Explore annual cover</LinkButton>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-3xl lg:mx-0">
          <div className="overflow-hidden rounded-[1.75rem] border border-white bg-slate-950 p-2 shadow-[0_28px_70px_rgba(15,23,42,.20)]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem] sm:aspect-[16/11]">
              <Image
                src="/images/buzzel-roadside-assistance-hero.png"
                alt="A roadside assistance technician changing a stranded car tyre beside a recovery van"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/10" aria-hidden="true"/>
              <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/95 px-3 py-2 text-xs font-black text-slate-900 shadow-lg backdrop-blur sm:left-5 sm:top-5">
                <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true"/>
                Recovery support available 24/7
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-red-200">Roadside assistance</p>
                <p className="mt-2 max-w-md text-2xl font-black tracking-tight sm:text-3xl">Help from request to recovery.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 p-2 pt-4 text-center text-white sm:gap-3 sm:p-3 sm:pt-5">
              <div className="rounded-xl bg-white/8 p-3"><p className="text-lg font-black">24/7</p><p className="text-[11px] text-slate-300">Request entry</p></div>
              <div className="rounded-xl bg-white/8 p-3"><p className="text-lg font-black">Live</p><p className="text-[11px] text-slate-300">Job updates</p></div>
              <div className="rounded-xl bg-white/8 p-3"><p className="text-lg font-black">1 year</p><p className="text-[11px] text-slate-300">Annual cover</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="bz-container py-14">
      <div className="mb-7 max-w-2xl"><p className="text-xs font-black uppercase tracking-[.18em] text-[var(--buzzel-red)]">How Buzzel works</p><h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Straightforward help when your vehicle stops.</h2></div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5"><p className="text-xs font-black text-[var(--buzzel-red)]">01</p><h3 className="mt-2 text-lg font-black">Choose how you pay</h3><p className="mt-2 text-sm leading-6 text-slate-500">Annual cover for one or more vehicles, or pay only when you need a one-off recovery.</p></Card>
        <Card className="p-5"><p className="text-xs font-black text-[var(--buzzel-red)]">02</p><h3 className="mt-2 text-lg font-black">We assess the request</h3><p className="mt-2 text-sm leading-6 text-slate-500">Vehicle type, distance and configured risk rules determine the operational requirements and one-off quote.</p></Card>
        <Card className="p-5"><p className="text-xs font-black text-[var(--buzzel-red)]">03</p><h3 className="mt-2 text-lg font-black">Stay connected</h3><p className="mt-2 text-sm leading-6 text-slate-500">Track the job, chat with the assigned team and confirm when the work is actually completed.</p></Card>
      </div>
      <SupportCallout className="mx-auto mt-10 max-w-xl" />
    </section>
  </main>
}
