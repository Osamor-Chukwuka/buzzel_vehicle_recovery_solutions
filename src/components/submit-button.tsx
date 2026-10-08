'use client'

import type { ReactNode } from 'react'
import { Button } from './button'

export function SubmitButton({
  children,
  pendingText = 'Please wait…',
  className = '',
  variant = 'primary',
  name,
  value,
}: {
  children: ReactNode
  pendingText?: string
  className?: string
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  name?: string
  value?: string
}) {
  return <Button type="submit" name={name} value={value} variant={variant} className={className} pendingText={pendingText}>
    {children}
  </Button>
}
