import type { ServiceType, VehicleType } from '@/lib/types'

export type PricingRule = {
  vehicleType: VehicleType
  roadsideBaseMinor: number
  recoveryBaseMinor: number
  annualBaseMinor: number
  perKmMinor: number
}

export const FALLBACK_PRICING: Record<VehicleType, PricingRule> = {
  motorcycle: { vehicleType: 'motorcycle', roadsideBaseMinor: 1_000_000, recoveryBaseMinor: 1_500_000, annualBaseMinor: 8_000_000, perKmMinor: 30_000 },
  tricycle: { vehicleType: 'tricycle', roadsideBaseMinor: 1_500_000, recoveryBaseMinor: 2_500_000, annualBaseMinor: 12_000_000, perKmMinor: 40_000 },
  car_suv: { vehicleType: 'car_suv', roadsideBaseMinor: 2_000_000, recoveryBaseMinor: 3_500_000, annualBaseMinor: 18_000_000, perKmMinor: 70_000 },
  bus_van: { vehicleType: 'bus_van', roadsideBaseMinor: 3_000_000, recoveryBaseMinor: 5_000_000, annualBaseMinor: 28_000_000, perKmMinor: 100_000 },
  lorry: { vehicleType: 'lorry', roadsideBaseMinor: 5_000_000, recoveryBaseMinor: 8_500_000, annualBaseMinor: 45_000_000, perKmMinor: 160_000 },
}

export function calculateOneOffQuote(input: {
  serviceType: ServiceType
  vehicleType: VehicleType
  distanceKm: number
  securityFeeMinor?: number
  rule?: PricingRule
}) {
  const rule = input.rule ?? FALLBACK_PRICING[input.vehicleType]
  const base = input.serviceType === 'roadside_assistance' ? rule.roadsideBaseMinor : rule.recoveryBaseMinor
  const distanceCharge = Math.max(0, Math.round(input.distanceKm)) * rule.perKmMinor
  const security = Math.max(0, input.securityFeeMinor ?? 0)
  return {
    baseMinor: base,
    distanceMinor: distanceCharge,
    securityMinor: security,
    totalMinor: base + distanceCharge + security,
  }
}

export function calculateAnnualVehiclePrice(input: {
  vehicleType: VehicleType
  rule?: PricingRule
}) {
  const rule = input.rule ?? FALLBACK_PRICING[input.vehicleType]
  return rule.annualBaseMinor
}

export function calculateFleetAnnualPrice(vehicleTypes: VehicleType[]) {
  return vehicleTypes.reduce((sum, type) => sum + calculateAnnualVehiclePrice({ vehicleType: type }), 0)
}
