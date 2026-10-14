type SupportCalloutProps = {
  className?: string
}

const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim() || '+44 7411 010120'
const SUPPORT_PHONE_LINK = `tel:${SUPPORT_PHONE.replace(/[^+\d]/g, '')}`

function PhoneIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
    <path d="M7.1 3.5 4.9 5.1c-.8.6-1.1 1.7-.7 2.7 2.6 6.1 7.5 11 13.6 13.6 1 .4 2.1.1 2.7-.7l1.6-2.2c.6-.8.5-2-.2-2.7l-2.8-2.4c-.7-.6-1.7-.7-2.5-.2l-1.7 1.1a14.5 14.5 0 0 1-5.2-5.2l1.1-1.7c.5-.8.4-1.8-.2-2.5L9.8 3.7c-.7-.7-1.9-.8-2.7-.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}

export function SupportCallout({ className = '' }: SupportCalloutProps) {
  return <aside className={`rounded-2xl border border-red-100 bg-red-50/70 p-4 text-center ${className}`} aria-label="Call Buzzel support">
    <p className="text-sm font-extrabold text-slate-950">In a hurry or prefer to speak with someone?</p>
    <p className="mt-1 text-xs leading-5 text-slate-600">Call Buzzel support and we’ll take your recovery request by phone.</p>
    <a href={SUPPORT_PHONE_LINK} className="mt-3 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--buzzel-red)] px-4 py-2 text-sm font-extrabold text-white transition-colors hover:bg-[var(--buzzel-red-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--buzzel-red)]">
      <PhoneIcon />
      Call {SUPPORT_PHONE}
    </a>
  </aside>
}
