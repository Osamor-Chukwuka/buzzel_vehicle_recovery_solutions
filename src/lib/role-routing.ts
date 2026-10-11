import type { AppRole } from '@/lib/types'

export function roleHomePath(role: AppRole) {
  if (role === 'team') return '/team'
  if (role === 'admin' || role === 'super_admin') return '/admin'
  return '/dashboard'
}

export function isCustomerRole(role: AppRole) {
  return role === 'customer'
}
