import { Icon } from './icon'

type SupportCalloutProps = {
  className?: string
}

const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim() || '+44 7411 010120'
const SUPPORT_PHONE_LINK = `tel:${SUPPORT_PHONE.replace(/[^+\d]/g, '')}`

export function SupportCallout({ className = '' }: SupportCalloutProps) {
  return <aside className={`rounded-[1.5rem] border border-red-100 bg-gradient-to-br from-red-50 to-white p-5 text-center shadow-[0_16px_40px_rgba(201,35,47,.08)] ${className}`} aria-label="Call Buzzel support">
    <p className="text-sm font-extrabold text-slate-950">In a hurry or prefer to speak with someone?</p>
    <p className="mt-1 text-xs leading-5 text-slate-600">Call Buzzel support and we’ll take your recovery request by phone.</p>
    <a href={SUPPORT_PHONE_LINK} className="mt-3 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--buzzel-red)] px-4 py-2 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(201,35,47,.2)] transition-all duration-200 hover:bg-[var(--buzzel-red-dark)] active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--buzzel-red)]">
      <Icon name="phone" className="size-5"/>
      Call {SUPPORT_PHONE}
    </a>
  </aside>
}
