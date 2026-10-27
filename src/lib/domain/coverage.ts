export function isCoverageActive(policy: { status: string; starts_at: string | null; ends_at: string | null } | null | undefined, now = new Date()) {
  if (!policy || policy.status !== 'active') return false
  const start = Date.parse(policy.starts_at ?? '')
  const end = Date.parse(policy.ends_at ?? '')
  const current = now.getTime()
  return Number.isFinite(start) && Number.isFinite(end) && start <= current && current < end
}

export function annualCoverageDates(start = new Date()) {
  const startsAt = new Date(start)
  const endsAt = new Date(start)
  endsAt.setUTCFullYear(endsAt.getUTCFullYear() + 1)
  return { startsAt, endsAt }
}
