import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Icon, type IconName } from '@/components/icon'
import { Logo } from '@/components/logo'
import { SupportCallout } from '@/components/support-callout'
import { AIIncidentAssistant } from '@/components/ai-incident-assistant'

const capabilities: Array<{ icon: IconName; title: string; copy: string }> = [
  { icon: 'location', title: 'Location captured', copy: 'Share where the vehicle stopped and confirm the exact place before requesting help.' },
  { icon: 'route', title: 'Request coordinated', copy: 'Vehicle, distance and operational requirements are brought into one clear recovery request.' },
  { icon: 'message', title: 'Updates stay visible', copy: 'Follow the job, communicate with the assigned team and confirm when the work is complete.' },
]

const flow = [
  { step: '01', title: 'Tell us where you are', copy: 'Use your live location, review the address and add the vehicle details that matter.' },
  { step: '02', title: 'Choose the right route', copy: 'Use active annual cover or review a transparent one-off recovery payment.' },
  { step: '03', title: 'Track it to completion', copy: 'Stay connected from request and assignment through arrival and customer confirmation.' },
]

function ArrowLink({ href, children, inverse = false }: { href: string; children: ReactNode; inverse?: boolean }) {
  return <Link href={href} className={`group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold transition-all duration-200 active:scale-[.98] ${inverse ? 'bg-white text-slate-950 shadow-[0_12px_35px_rgba(0,0,0,.22)] hover:bg-red-50' : 'bg-[var(--buzzel-red)] text-white shadow-[0_14px_35px_rgba(201,35,47,.28)] hover:bg-[var(--buzzel-red-dark)]'}`}>
    {children}<Icon name="arrow-right" className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
  </Link>
}

export default function HomePage() {
  return <main className="marketing-page min-h-dvh overflow-hidden bg-[#fffafa] text-slate-950">
    <a href="#home-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-bold focus:text-slate-950">Skip to content</a>

    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/82 backdrop-blur-xl">
      <div className="bz-container flex min-h-20 items-center justify-between gap-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Marketing navigation">
          <a href="#buzzel-ai" className="rounded-xl px-4 py-2 text-sm font-bold text-[var(--buzzel-red)] transition-colors hover:bg-red-50">Buzzel AI</a>
          <a href="#how-it-works" className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950">How it works</a>
          <a href="#services" className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950">What you get</a>
          <a href="#cover" className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950">Annual cover</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/auth/login" className="hidden min-h-11 items-center rounded-xl px-4 py-2 text-sm font-extrabold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 sm:inline-flex">Sign in</Link>
          <Link href="/auth/signup" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-extrabold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 active:scale-[.98]">Create account</Link>
        </div>
      </div>
    </header>

    <div id="home-content">
      <section className="hero-grid relative isolate overflow-hidden pb-16 pt-12 sm:pb-24 sm:pt-16 lg:min-h-[760px] lg:pb-28 lg:pt-20">
        <div className="hero-orb hero-orb-red" aria-hidden="true" />
        <div className="hero-orb hero-orb-blue" aria-hidden="true" />
        <div className="bz-container relative grid items-center gap-14 lg:grid-cols-[.88fr_1.12fr] lg:gap-12">
          <div className="home-reveal relative z-10">
            <div className="hero-eyebrow inline-flex items-center gap-2 rounded-full border border-red-200/80 bg-white/80 px-3 py-2 text-[11px] font-black uppercase tracking-[.16em] text-[#a91d27] shadow-sm backdrop-blur">
              <span className="relative flex size-2.5"><span className="signal-ring absolute inset-0 rounded-full bg-red-400"/><span className="relative size-2.5 rounded-full bg-red-600"/></span>
              Roadside response, made clearer
            </div>
            <h1 aria-label="When the road stops, Buzzel keeps you moving." className="hero-title mt-6 max-w-3xl text-[clamp(3rem,7vw,5.8rem)] font-black leading-[.92] tracking-[-.065em] text-slate-950">
              <span className="hero-title-line hero-title-line-one" aria-hidden="true"><span className="hero-roll-word hero-roll-1">When</span>{' '}<span className="hero-roll-word hero-roll-2">the</span>{' '}<span className="hero-roll-word hero-roll-3">road</span>{' '}<span className="hero-roll-word hero-roll-4">stops,</span></span>
              <span className="hero-title-line hero-title-line-two" aria-hidden="true"><span className="hero-word hero-roll-word hero-roll-5">Buzzel</span>{' '}<span className="hero-roll-word hero-roll-6">keeps</span>{' '}<span className="hero-roll-word hero-roll-7">you</span>{' '}<span className="hero-roll-word hero-roll-8">moving.</span></span>
            </h1>
            <p className="hero-subtitle mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">One place to capture your location, request roadside assistance, coordinate recovery and protect your vehicles with annual cover.</p>
            <div className="hero-actions mt-8 flex flex-col gap-3 sm:flex-row">
              <ArrowLink href="/emergency">Get emergency help</ArrowLink>
              <Link href="/coverage" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white/80 px-5 py-3 text-sm font-extrabold text-slate-900 shadow-sm backdrop-blur transition-all duration-200 hover:border-slate-400 hover:bg-white active:scale-[.98]">Explore annual cover<Icon name="coverage" className="size-4 text-[var(--buzzel-red)]" /></Link>
            </div>
            <div className="hero-benefits mt-8 grid max-w-xl grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-3">
              {['Live location capture', 'Clear payment choices', 'Request status updates'].map((item) => <div key={item} className="flex items-center gap-2"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Icon name="check" className="size-3.5" /></span><span className="font-semibold">{item}</span></div>)}
            </div>
          </div>

          <div className="hero-visual relative mx-auto w-full max-w-[760px] lg:mx-0" aria-label="Buzzel recovery experience preview">
            <div className="hero-depth-lines" aria-hidden="true" />
            <div className="hero-frame relative overflow-hidden rounded-[2rem] border border-white/80 bg-slate-950 p-2.5 shadow-[0_45px_100px_rgba(15,23,42,.28)] sm:p-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] sm:aspect-[16/11]">
                <Image src="/images/buzzel-roadside-assistance-hero.png" alt="A Buzzel-style roadside recovery van assisting a stranded driver" fill priority sizes="(max-width: 1024px) 94vw, 56vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/5 to-slate-950/10" aria-hidden="true" />
                <div className="hero-image-scan" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-5 text-white sm:p-7">
                  <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-red-200">Recovery in progress</p><p className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Help, from request to road-ready.</p></div>
                  <div className="hidden size-14 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur sm:grid"><Icon name="vehicle" className="size-7" /></div>
                </div>
              </div>
            </div>

            <div className="hero-float-card hero-location-card absolute -left-2 bottom-8 z-10 w-[min(78%,17rem)] rounded-2xl border border-white/80 bg-white/92 p-4 shadow-[0_20px_50px_rgba(15,23,42,.18)] backdrop-blur-xl sm:-left-8 sm:bottom-12">
              <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-50 text-[var(--buzzel-red)]"><Icon name="location" className="size-5" /></span><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">Location confirmed</p><p className="mt-1 text-sm font-black text-slate-950">Your recovery point is ready</p><p className="mt-1 text-xs leading-5 text-slate-500">Review the address before you continue.</p></div></div>
            </div>

            <div className="hero-float-card hero-status-card absolute -right-2 top-8 z-10 rounded-2xl border border-white/15 bg-slate-950/90 p-4 text-white shadow-[0_20px_50px_rgba(15,23,42,.24)] backdrop-blur-xl sm:-right-7 sm:top-12">
              <div className="flex items-center gap-3"><span className="hero-route-icon relative grid size-10 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300"><Icon name="route" className="size-5" /></span><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">Journey status</p><p className="mt-1 text-sm font-black">Request → Recovery</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-red-100/70 bg-white/75 backdrop-blur">
        <div className="bz-container grid grid-cols-2 divide-x divide-y divide-red-100/70 sm:grid-cols-4 sm:divide-y-0">
          {[['24/7', 'Emergency request entry'], ['Live', 'Location capture'], ['2 ways', 'Annual or one-off'], ['1 place', 'Updates and completion']].map(([value, label]) => <div key={label} className="px-4 py-6 text-center sm:py-7"><p className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{value}</p><p className="mt-1 text-xs font-bold text-slate-500">{label}</p></div>)}
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-20 sm:py-28" id="buzzel-ai">
        <div className="pointer-events-none absolute -left-32 top-12 size-80 rounded-full bg-red-100/60 blur-3xl" aria-hidden="true"/>
        <div className="bz-container relative grid items-center gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-14">
          <div><p className="section-kicker">Meet Buzzel AI</p><h2 className="section-title mt-3">Show us the problem. Tell us what happened.</h2><p className="section-copy mt-5">Gemini turns a typed or spoken description and an optional vehicle photo into a clear preliminary recovery assessment—before you submit anything.</p><div className="mt-7 space-y-3">{['Understand the likely recovery need', 'Highlight visible vehicle issues', 'Create a practical roadside safety checklist'].map((item) => <div key={item} className="flex items-center gap-3 text-sm font-bold text-slate-700"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-red-50 text-[var(--buzzel-red)]"><Icon name="check" className="size-3.5"/></span>{item}</div>)}</div><p className="mt-7 flex items-start gap-2 text-xs leading-5 text-slate-500"><Icon name="shield" className="mt-0.5 size-4 shrink-0 text-slate-400"/>AI provides preliminary guidance only. Customers and recovery teams confirm the final response.</p></div>
          <AIIncidentAssistant context="landing"/>
        </div>
      </section>

      <section id="services" className="bz-container py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center"><p className="section-kicker">Everything in one recovery flow</p><h2 className="section-title mt-3">Built for the moment you need clarity most.</h2><p className="section-copy mx-auto mt-4">Buzzel reduces the back-and-forth around roadside help by keeping the important details, decisions and updates together.</p></div>

        <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:grid-rows-2">
          <article className="bento-card bento-dark relative overflow-hidden p-7 sm:p-9 lg:col-span-7 lg:row-span-2">
            <div className="bento-glow" aria-hidden="true" />
            <div className="relative z-10 flex h-full flex-col">
              <span className="icon-box-dark"><Icon name="route" className="size-6" /></span>
              <p className="mt-8 text-xs font-black uppercase tracking-[.18em] text-red-300">One connected journey</p>
              <h3 className="mt-3 max-w-xl text-3xl font-black tracking-[-.035em] text-white sm:text-5xl">From “I’m stranded” to “I’m moving again.”</h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">Capture the scene, review the quote, follow assignment and confirm completion without losing context between calls and messages.</p>
              <div className="mt-9 grid gap-3 sm:grid-cols-3">
                {['Request received', 'Team assigned', 'Work completed'].map((label, index) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[.06] p-4"><div className="flex items-center gap-2"><span className={`size-2.5 rounded-full ${index === 2 ? 'bg-emerald-400' : 'bg-red-400'}`} /><span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Step {index + 1}</span></div><p className="mt-3 text-sm font-bold text-white">{label}</p></div>)}
              </div>
            </div>
          </article>

          <article className="bento-card bento-red relative overflow-hidden p-7 lg:col-span-5">
            <div className="relative z-10"><span className="icon-box-light"><Icon name="coverage" className="size-6" /></span><p className="mt-8 text-xs font-black uppercase tracking-[.18em] text-red-100">Annual cover</p><h3 className="mt-2 text-3xl font-black tracking-tight text-white">Protect one vehicle or a fleet.</h3><p className="mt-3 max-w-md text-sm leading-6 text-red-50/85">Register vehicles, see what is covered and keep recovery support ready for the year.</p><Link href="/coverage" className="mt-6 inline-flex items-center gap-2 text-sm font-black text-white underline decoration-white/35 underline-offset-4 hover:decoration-white">Explore coverage <Icon name="arrow-right" className="size-4" /></Link></div>
            <div className="absolute -bottom-12 -right-8 size-48 rounded-full border-[28px] border-white/10" aria-hidden="true" />
          </article>

          <article className="bento-card bento-blue relative overflow-hidden p-7 lg:col-span-5">
            <div className="relative z-10 grid h-full gap-5 sm:grid-cols-[1fr_auto] sm:items-end"><div><span className="icon-box-blue"><Icon name="location" className="size-6" /></span><h3 className="mt-6 text-2xl font-black tracking-tight text-white">See the actual place, not just coordinates.</h3><p className="mt-3 text-sm leading-6 text-blue-100">Confirm the readable address and map before sending the request.</p></div><div className="mini-map" aria-hidden="true"><span className="mini-map-road"/><span className="mini-map-pin"><Icon name="location" className="size-4" /></span></div></div>
          </article>
        </div>
      </section>

      <section id="how-it-works" className="relative overflow-hidden bg-slate-950 py-20 text-white sm:py-28">
        <div className="absolute inset-0 opacity-30 road-grid" aria-hidden="true" />
        <div className="bz-container relative">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="section-kicker text-red-300">How Buzzel works</p><h2 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">Three clear moves.<br/>No guesswork.</h2></div><p className="max-w-xl text-base leading-7 text-slate-300 lg:justify-self-end">The experience is designed for stressful roadside moments: the next action is always obvious, and every step stays connected to the same request.</p></div>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {flow.map((item, index) => <article key={item.step} className="process-card group relative rounded-[1.6rem] border border-white/10 bg-white/[.055] p-6 backdrop-blur-sm transition-colors duration-200 hover:bg-white/[.09]"><div className="flex items-center justify-between"><span className="text-4xl font-black tracking-tighter text-white/20">{item.step}</span><span className="grid size-10 place-items-center rounded-xl bg-white/10 text-red-300"><Icon name={index === 0 ? 'location' : index === 1 ? 'finance' : 'check'} className="size-5" /></span></div><h3 className="mt-10 text-xl font-black">{item.title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{item.copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bz-container py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div><p className="section-kicker">Confidence by design</p><h2 className="section-title mt-3">The details that make roadside help feel under control.</h2><p className="section-copy mt-4">Every part of the experience answers a practical question: where are you, what happens next, what does it cost, and who is handling the request?</p><div className="mt-8"><ArrowLink href="/emergency">Start an emergency request</ArrowLink></div></div>
          <div className="grid gap-4 sm:grid-cols-3">{capabilities.map((item) => <article key={item.title} className="feature-card rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,.07)]"><span className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-white"><Icon name={item.icon} className="size-5" /></span><h3 className="mt-6 text-lg font-black tracking-tight">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{item.copy}</p></article>)}</div>
        </div>
      </section>

      <section id="cover" className="bz-container pb-20 sm:pb-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#c9232f] via-[#b71e2a] to-[#77121b] px-6 py-12 text-white shadow-[0_35px_90px_rgba(169,29,39,.24)] sm:px-10 sm:py-16 lg:px-16">
          <div className="absolute -right-20 -top-28 size-80 rounded-full border-[60px] border-white/[.06]" aria-hidden="true" />
          <div className="absolute bottom-0 right-1/4 h-32 w-px rotate-45 bg-gradient-to-t from-transparent via-white/20 to-transparent" aria-hidden="true" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.2em] text-red-100">Ready before the next journey</p><h2 className="mt-3 max-w-3xl text-3xl font-black tracking-[-.04em] sm:text-5xl">Keep recovery support within reach.</h2><p className="mt-4 max-w-2xl text-base leading-7 text-red-50/85">Create an account for vehicle management and annual cover, or go straight to the emergency flow when the need is immediate.</p></div><div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><ArrowLink href="/auth/signup" inverse>Create your account</ArrowLink><Link href="/emergency" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-extrabold text-white backdrop-blur transition-colors hover:bg-white/15">I need help now</Link></div></div>
        </div>
        <SupportCallout className="mx-auto mt-8 max-w-2xl bg-white shadow-[0_16px_45px_rgba(15,23,42,.07)]" />
      </section>
    </div>

  </main>
}
