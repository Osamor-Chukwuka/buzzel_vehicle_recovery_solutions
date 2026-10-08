import type { RequestStatus } from '@/lib/types'

const transitions: Record<RequestStatus, RequestStatus[]> = {
  requested: ['awaiting_payment', 'ready_for_assignment', 'cancelled', 'disputed'],
  awaiting_payment: ['ready_for_assignment', 'cancelled', 'disputed'],
  ready_for_assignment: ['assigned', 'cancelled', 'disputed'],
  assigned: ['en_route', 'cancelled', 'disputed'],
  en_route: ['arrived', 'cancelled', 'disputed'],
  arrived: ['in_progress', 'disputed'],
  in_progress: ['awaiting_customer_confirmation', 'disputed'],
  awaiting_customer_confirmation: ['completed', 'disputed'],
  completed: [],
  disputed: ['in_progress', 'awaiting_customer_confirmation', 'completed', 'cancelled'],
  cancelled: [],
}

export function canTransition(from: RequestStatus, to: RequestStatus) {
  return transitions[from].includes(to)
}

export function assertTransition(from: RequestStatus, to: RequestStatus) {
  if (!canTransition(from, to)) throw new Error(`Invalid request status transition: ${from} -> ${to}`)
}

export function teamNextStatuses(status: RequestStatus): RequestStatus[] {
  if (status === 'assigned') return ['en_route']
  if (status === 'en_route') return ['arrived']
  if (status === 'arrived') return ['in_progress']
  if (status === 'in_progress') return ['awaiting_customer_confirmation']
  return []
}
