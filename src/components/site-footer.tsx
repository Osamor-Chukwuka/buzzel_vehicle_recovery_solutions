import Link from 'next/link'
import { Icon } from './icon'
import { Logo } from './logo'

const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim() || '+44 7411 010120'
const SUPPORT_PHONE_LINK = `tel:${SUPPORT_PHONE.replace(/[^+\d]/g, '')}`

const footerLinkClass = 'w-fit text-sm font-semibold text-slate-500 transition-colors hover:text-slate-950'

export function SiteFooter() {
  return <footer className="site-footer-shell border-t border-slate-200 bg-white" aria-label="Site footer">
    <div className="bz-container py-9 sm:py-10">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.35fr_.7fr_.7fr_1fr] lg:gap-10">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">Roadside assistance and vehicle recovery, clearly coordinated from request to completion.</p>
        </div>

        <nav aria-label="Services">
          <p className="text-xs font-black uppercase tracking-[.16em] text-slate-950">Services</p>
          <div className="mt-3 grid gap-2.5"><Link href="/emergency" className={footerLinkClass}>Emergency help</Link><Link href="/coverage" className={footerLinkClass}>Annual cover</Link><Link href="/auth/login" className={footerLinkClass}>Sign in</Link></div>
        </nav>

        <nav aria-label="Company information">
          <p className="text-xs font-black uppercase tracking-[.16em] text-slate-950">Information</p>
          <div className="mt-3 grid gap-2.5"><Link href="/" className={footerLinkClass}>Home</Link><Link href="/terms" className={footerLinkClass}>Terms</Link><Link href="/privacy" className={footerLinkClass}>Privacy</Link></div>
        </nav>

        <div>
          <p className="text-xs font-black uppercase tracking-[.16em] text-slate-950">Need assistance?</p>
          <p className="mt-3 text-sm leading-6 text-slate-500">Prefer to arrange recovery by phone?</p>
          <a href={SUPPORT_PHONE_LINK} className="mt-2 inline-flex min-h-10 w-fit cursor-pointer items-center gap-2 rounded-lg text-sm font-black text-[var(--buzzel-red)] transition-colors hover:text-[var(--buzzel-red-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"><Icon name="phone" className="size-4"/>Call {SUPPORT_PHONE}</a>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-2 border-t border-slate-100 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; Buzzel Vehicle Recovery Solutions. All rights reserved.</p>
        <p>If you are in immediate danger, contact the appropriate emergency service first.</p>
      </div>
    </div>
  </footer>
}
