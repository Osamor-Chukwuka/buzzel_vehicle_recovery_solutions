export function isCoverageActive(policy: { status: string; starts_at: string; ends_at: string } | null | undefined, now = new Date()) {
  if (!policy || policy.status !== 'active') return false
  const start = new Date(policy.starts_at)
  const end = new Date(policy.ends_at)
  return start <= now && now < end
}

export function annualCoverageDates(start = new Date()) {
  const startsAt = new Date(start)
  const endsAt = new Date(start)
  endsAt.setUTCFullYear(endsAt.getUTCFullYear() + 1)
  return { startsAt, endsAt }
}
