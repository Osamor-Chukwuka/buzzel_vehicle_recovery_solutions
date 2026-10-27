import type { AppRole } from '@/lib/types'

export function roleHomePath(role: AppRole) {
  if (role === 'team') return '/team'
  if (role === 'admin' || role === 'super_admin') return '/admin'
  return '/dashboard'
}

export function isCustomerRole(role: AppRole) {
  return role === 'customer'
}

const INTERNAL_URL_BASE = 'https://buzzel.internal'

export function safeInternalPath(value: string | null | undefined, fallback = '/dashboard') {
  if (!value?.startsWith('/')) return fallback

  try {
    const url = new URL(value, INTERNAL_URL_BASE)
    if (url.origin !== INTERNAL_URL_BASE) return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
