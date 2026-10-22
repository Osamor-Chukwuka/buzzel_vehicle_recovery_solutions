'use client'

import { useFormStatus } from 'react-dom'
import type { ReactNode } from 'react'

export function Button({ children, className = '', type = 'button', variant = 'primary', name, value, disabled, pendingText = 'Please wait…' }: {
  children: ReactNode
  className?: string
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'sidebar'
  name?: string
  value?: string
  disabled?: boolean
  pendingText?: string
}) {
  const { pending } = useFormStatus()
  const isPending = type === 'submit' && pending
  const styles = {
    primary: 'bg-[var(--buzzel-red)] text-white shadow-[0_10px_24px_rgba(201,35,47,.2)] hover:bg-[var(--buzzel-red-dark)] hover:shadow-[0_14px_30px_rgba(201,35,47,.28)]',
    secondary: 'bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,.16)] hover:bg-slate-800',
    danger: 'bg-red-800 text-white shadow-sm hover:bg-red-900',
    ghost: 'border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50',
    sidebar: 'border border-white/10 bg-white/[.06] text-white shadow-sm hover:border-white/20 hover:bg-white/10',
  }

  return <button name={name} value={value} type={type} disabled={disabled || isPending} aria-busy={isPending} className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl px-4 py-2.5 text-sm font-extrabold transition-all duration-200 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${styles[variant]} ${className}`}>
    {isPending && <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />}
    <span aria-live="polite">{isPending ? pendingText : children}</span>
  </button>
}
