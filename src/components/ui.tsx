import Link from 'next/link'
import type { ReactNode } from 'react'
import { STATUS_LABELS } from '@/lib/constants'
import type { RequestStatus } from '@/lib/types'

export { Button } from './button'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`bz-card ${className}`}>{children}</section>
}

export function LinkButton({ href, children, className = '', variant = 'primary' }: { href: string; children: ReactNode; className?: string; variant?: 'primary'|'secondary'|'ghost' }) {
  const styles = {
    primary: 'bg-[var(--buzzel-red)] text-white hover:bg-[var(--buzzel-red-dark)]',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800',
    ghost: 'bg-white border border-slate-300 text-slate-800 hover:border-slate-400 hover:bg-slate-50',
  }
  return <Link href={href} className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${styles[variant]} ${className}`}>{children}</Link>
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const tone = status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : status === 'disputed' ? 'bg-red-50 text-red-700 border-red-200' : status === 'awaiting_payment' || status === 'awaiting_customer_confirmation' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${tone}`}>{STATUS_LABELS[status]}</span>
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h1>{description && <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}</div>{action}</div>
}

export function Stat({ label, value, note }: { label: string; value: string|number; note?: string }) {
  return <Card className="p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 text-2xl font-black text-slate-950">{value}</p>{note && <p className="mt-1 text-xs text-slate-500">{note}</p>}</Card>
}

export function ErrorNotice({ message }: { message?: string | null }) {
  if (!message) return null
  return <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{message}</div>
}

export function SuccessNotice({ message }: { message?: string | null }) {
  if (!message) return null
  return <div role="status" className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><span aria-hidden="true">✓</span><span>{message}</span></div>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-slate-100 text-xl">•</div><h3 className="font-extrabold text-slate-900">{title}</h3><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p>{action && <div className="mt-4">{action}</div>}</div>
}
