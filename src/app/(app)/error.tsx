'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Buzzel application error', error)
  }, [error])

  return <section className="mx-auto max-w-xl rounded-[1.75rem] border border-red-100 bg-white p-6 text-center shadow-[0_24px_65px_rgba(15,23,42,.10)] sm:p-8">
    <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-2xl" aria-hidden="true">!</div>
    <h1 className="mt-5 text-2xl font-black text-slate-950">We couldn&apos;t load this page</h1>
    <p className="mt-2 text-sm leading-6 text-slate-600">Your information has not been lost. Try the page again, or return to your workspace.</p>
    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
      <button type="button" onClick={reset} className="min-h-11 cursor-pointer rounded-xl bg-[var(--buzzel-red)] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[var(--buzzel-red-dark)]">Try again</button>
      <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-800 hover:bg-slate-50">Return home</Link>
    </div>
    {error.digest ? <p className="mt-5 text-[11px] font-semibold text-slate-400">Support reference: {error.digest}</p> : null}
  </section>
}
