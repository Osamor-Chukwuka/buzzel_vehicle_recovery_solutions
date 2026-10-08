import type { RequestStatus, ServiceType, VehicleType } from './types'

export const APP_NAME = 'Buzzel Vehicle Recovery Solutions'
export const DEFAULT_CURRENCY = process.env.BUZZEL_CURRENCY || 'NGN'

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  motorcycle: 'Motorcycle',
  tricycle: 'Tricycle',
  car_suv: 'Car / SUV',
  bus_van: 'Bus / Van',
  lorry: 'Lorry',
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  roadside_assistance: 'Roadside Assistance',
  vehicle_recovery: 'Vehicle Recovery',
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  requested: 'Requested',
  awaiting_payment: 'Awaiting Payment',
  ready_for_assignment: 'Ready for Assignment',
  assigned: 'Assigned',
  en_route: 'En Route',
  arrived: 'Arrived',
  in_progress: 'In Progress',
  awaiting_customer_confirmation: 'Awaiting Your Confirmation',
  completed: 'Completed',
  disputed: 'Disputed',
  cancelled: 'Cancelled',
}

export const CUSTOMER_VISIBLE_STATUS_ORDER: RequestStatus[] = [
  'requested',
  'awaiting_payment',
  'ready_for_assignment',
  'assigned',
  'en_route',
  'arrived',
  'in_progress',
  'awaiting_customer_confirmation',
  'completed',
]
