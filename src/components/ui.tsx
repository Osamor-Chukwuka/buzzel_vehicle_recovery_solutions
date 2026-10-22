import Link from 'next/link'
import type { ReactNode } from 'react'
import { STATUS_LABELS } from '@/lib/constants'
import type { RequestStatus } from '@/lib/types'
import { Icon } from './icon'

export { Button } from './button'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`bz-card ${className}`}>{children}</section>
}

export function LinkButton({ href, children, className = '', variant = 'primary' }: { href: string; children: ReactNode; className?: string; variant?: 'primary'|'secondary'|'ghost' }) {
  const styles = {
    primary: 'bg-[var(--buzzel-red)] text-white shadow-[0_10px_24px_rgba(201,35,47,.2)] hover:bg-[var(--buzzel-red-dark)] hover:shadow-[0_14px_30px_rgba(201,35,47,.28)]',
    secondary: 'bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,.16)] hover:bg-slate-800',
    ghost: 'border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50',
  }
  return <Link href={href} className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl px-4 py-2.5 text-sm font-extrabold transition-all duration-200 active:scale-[.98] ${styles[variant]} ${className}`}>{children}</Link>
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const tone = status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : status === 'disputed' ? 'bg-red-50 text-red-700 border-red-200' : status === 'awaiting_payment' || status === 'awaiting_customer_confirmation' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${tone}`}>{STATUS_LABELS[status]}</span>
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-[11px] font-black uppercase tracking-[.24em] text-[var(--buzzel-red)]">Buzzel workspace</p><h1 className="text-3xl font-black tracking-[-.04em] text-slate-950 sm:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}</div>{action}</div>
}

export function Stat({ label, value, note }: { label: string; value: string|number; note?: string }) {
  return <Card className="group relative overflow-hidden p-5"><span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[var(--buzzel-red)] to-orange-400 transition-transform duration-300 group-hover:scale-x-100"/><p className="text-[11px] font-black uppercase tracking-[.16em] text-slate-400">{label}</p><p className="mt-3 text-3xl font-black tracking-[-.05em] text-slate-950">{value}</p>{note && <p className="mt-1 text-xs font-medium text-slate-500">{note}</p>}</Card>
}

export function ErrorNotice({ message }: { message?: string | null }) {
  if (!message) return null
  return <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{message}</div>
}

export function SuccessNotice({ message }: { message?: string | null }) {
  if (!message) return null
  return <div role="status" className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-white"><Icon name="check" className="size-3.5"/></span><span className="pt-0.5">{message}</span></div>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="relative overflow-hidden rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-[0_18px_45px_rgba(15,23,42,.05)]"><div className="absolute -right-12 -top-12 size-32 rounded-full bg-red-50 blur-2xl"/><div className="relative mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg"><Icon name="spark" className="size-5"/></div><h3 className="relative font-extrabold text-slate-900">{title}</h3><p className="relative mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p>{action && <div className="relative mt-5">{action}</div>}</div>
}
