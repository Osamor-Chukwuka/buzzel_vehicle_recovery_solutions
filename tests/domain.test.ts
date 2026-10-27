import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateAnnualVehiclePrice, calculateOneOffQuote, FALLBACK_PRICING } from '../src/lib/domain/pricing.ts'
import { assessRisk, haversineKm } from '../src/lib/domain/risk.ts'
import { canTransition, teamNextStatuses } from '../src/lib/domain/status.ts'
import { annualCoverageDates, isCoverageActive } from '../src/lib/domain/coverage.ts'
import { emergencyRequestPath, normalizeEmergencyRequestPath } from '../src/lib/emergency-intent.ts'
import { roleHomePath, safeInternalPath } from '../src/lib/role-routing.ts'
import { matchesPaystackRequestedAmount } from '../src/lib/payments/paystack.ts'

test('vehicle types have different annual pricing', () => {
  assert.ok(calculateAnnualVehiclePrice({ vehicleType: 'motorcycle' }) < calculateAnnualVehiclePrice({ vehicleType: 'car_suv' }))
  assert.ok(calculateAnnualVehiclePrice({ vehicleType: 'car_suv' }) < calculateAnnualVehiclePrice({ vehicleType: 'lorry' }))
})

test('one-off quote includes distance and mandatory security fee', () => {
  const rule = FALLBACK_PRICING.car_suv
  const quote = calculateOneOffQuote({ serviceType: 'vehicle_recovery', vehicleType: 'car_suv', distanceKm: 12.2, securityFeeMinor: 2_500_000, rule })
  assert.equal(quote.baseMinor, rule.recoveryBaseMinor)
  assert.equal(quote.distanceMinor, 12 * rule.perKmMinor)
  assert.equal(quote.securityMinor, 2_500_000)
  assert.equal(quote.totalMinor, quote.baseMinor + quote.distanceMinor + quote.securityMinor)
})

test('risk assessment flags coordinates inside a configured high-risk zone', () => {
  const result = assessRisk(9.1125, 7.3845, [{ name: 'Demo', centerLat: 9.1125, centerLng: 7.3845, radiusKm: 2.5, level: 'high', securityFeeMinor: 2_500_000 }])
  assert.equal(result.level, 'high')
  assert.equal(result.securityRequired, true)
  assert.equal(result.securityFeeMinor, 2_500_000)
})

test('risk assessment is normal outside configured zones', () => {
  const result = assessRisk(9.40, 7.80, [{ name: 'Demo', centerLat: 9.1125, centerLng: 7.3845, radiusKm: 1, level: 'high', securityFeeMinor: 2_500_000 }])
  assert.equal(result.level, 'normal')
  assert.equal(result.securityRequired, false)
})

test('distance helper is symmetric and zero for same point', () => {
  assert.equal(haversineKm(9.0, 7.0, 9.0, 7.0), 0)
  const a = haversineKm(9.0, 7.0, 9.1, 7.2)
  const b = haversineKm(9.1, 7.2, 9.0, 7.0)
  assert.ok(Math.abs(a - b) < 1e-9)
})

test('team lifecycle cannot directly complete a request', () => {
  assert.deepEqual(teamNextStatuses('in_progress'), ['awaiting_customer_confirmation'])
  assert.equal(canTransition('in_progress', 'completed'), false)
  assert.equal(canTransition('awaiting_customer_confirmation', 'completed'), true)
})

test('annual coverage spans one year and active check respects boundaries', () => {
  const start = new Date('2026-10-08T00:00:00Z')
  const { startsAt, endsAt } = annualCoverageDates(start)
  assert.equal(startsAt.toISOString(), '2026-10-08T00:00:00.000Z')
  assert.equal(endsAt.toISOString(), '2027-10-08T00:00:00.000Z')
  assert.equal(isCoverageActive({ status: 'active', starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString() }, new Date('2027-01-01T00:00:00Z')), true)
  assert.equal(isCoverageActive({ status: 'active', starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString() }, new Date('2027-10-08T00:00:00Z')), false)
})

test('emergency request resume path only accepts a valid internal request location', () => {
  assert.equal(emergencyRequestPath(9.082, 8.6753), '/requests/new?lat=9.082&lng=8.6753')
  assert.equal(emergencyRequestPath(91, 8.6753), '/requests/new')
  assert.equal(normalizeEmergencyRequestPath('/requests/new?lat=9.082&lng=8.6753'), '/requests/new?lat=9.082&lng=8.6753')
  assert.equal(normalizeEmergencyRequestPath('https://example.com'), null)
})

test('staff accounts return to their role workspace after authentication', () => {
  assert.equal(roleHomePath('customer'), '/dashboard')
  assert.equal(roleHomePath('team'), '/team')
  assert.equal(roleHomePath('admin'), '/admin')
  assert.equal(roleHomePath('super_admin'), '/admin')
})

test('authentication redirects only accept internal application paths', () => {
  assert.equal(safeInternalPath('/requests/new?vehicle=123'), '/requests/new?vehicle=123')
  assert.equal(safeInternalPath('https://example.com'), '/dashboard')
  assert.equal(safeInternalPath('//example.com'), '/dashboard')
  assert.equal(safeInternalPath('/\\example.com'), '/dashboard')
})

test('Paystack validates the initialized amount rather than a bank-transfer amount including fees', () => {
  assert.equal(matchesPaystackRequestedAmount({ amount: 8_639_594, requested_amount: 8_500_000 }, 8_500_000), true)
  assert.equal(matchesPaystackRequestedAmount({ amount: 8_639_594, requested_amount: 8_500_000 }, 8_639_594), false)
  assert.equal(matchesPaystackRequestedAmount({ amount: 8_500_000 }, 8_500_000), true)
})
