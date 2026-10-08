export type AppRole = 'customer' | 'team' | 'admin' | 'super_admin'
export type AccountType = 'individual' | 'company'
export type VehicleType = 'motorcycle' | 'tricycle' | 'car_suv' | 'bus_van' | 'lorry'
export type ServiceType = 'roadside_assistance' | 'vehicle_recovery'
export type RequestStatus =
  | 'requested'
  | 'awaiting_payment'
  | 'ready_for_assignment'
  | 'assigned'
  | 'en_route'
  | 'arrived'
  | 'in_progress'
  | 'awaiting_customer_confirmation'
  | 'completed'
  | 'disputed'
  | 'cancelled'

export type RiskLevel = 'normal' | 'high'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type CoverageStatus = 'pending' | 'active' | 'expired' | 'cancelled'
export type DisputeStatus = 'open' | 'under_review' | 'resolved'

export type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  role: AppRole
}

export type Vehicle = {
  id: string
  account_id: string
  registration_number: string
  make: string | null
  model: string | null
  color: string | null
  year: number | null
  vehicle_type: VehicleType
  is_active: boolean
}

export type ServiceRequest = {
  id: string
  reference: string
  account_id: string
  customer_user_id: string
  vehicle_id: string
  service_type: ServiceType
  status: RequestStatus
  breakdown_address: string
  breakdown_lat: number | null
  breakdown_lng: number | null
  destination_address: string | null
  destination_lat: number | null
  destination_lng: number | null
  distance_km: number
  risk_level: RiskLevel
  security_required: boolean
  security_fee_minor: number
  quoted_amount_minor: number
  amount_due_minor: number
  currency: string
  assigned_team_member_id: string | null
  created_at: string
}
