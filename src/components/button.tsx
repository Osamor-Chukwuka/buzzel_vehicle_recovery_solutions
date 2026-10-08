'use client'

import { useFormStatus } from 'react-dom'
import type { ReactNode } from 'react'

export function Button({ children, className = '', type = 'button', variant = 'primary', name, value, disabled, pendingText = 'Please wait…' }: {
  children: ReactNode
  className?: string
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  name?: string
  value?: string
  disabled?: boolean
  pendingText?: string
}) {
  const { pending } = useFormStatus()
  const isPending = type === 'submit' && pending
  const styles = {
    primary: 'bg-[var(--buzzel-red)] text-white hover:bg-[var(--buzzel-red-dark)] shadow-sm',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800',
    danger: 'bg-red-800 text-white hover:bg-red-900',
    ghost: 'bg-white border border-slate-300 text-slate-800 hover:border-slate-400 hover:bg-slate-50',
  }

  return <button name={name} value={value} type={type} disabled={disabled || isPending} aria-busy={isPending} className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}>
    {isPending && <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />}
    <span aria-live="polite">{isPending ? pendingText : children}</span>
  </button>
}
