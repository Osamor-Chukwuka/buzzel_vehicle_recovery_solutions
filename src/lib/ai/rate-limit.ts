type Bucket = { count: number; resetAt: number }

const globalBuckets = globalThis as typeof globalThis & { __buzzelAiBuckets?: Map<string, Bucket> }
const buckets = globalBuckets.__buzzelAiBuckets ?? new Map<string, Bucket>()
globalBuckets.__buzzelAiBuckets = buckets

export function takeAiRequest(key: string, limit = 15, windowMs = 10 * 60 * 1000) {
  const now = Date.now()
  if (buckets.size > 500) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey)
    }
    while (buckets.size > 400) {
      const oldestKey = buckets.keys().next().value
      if (typeof oldestKey !== 'string') break
      buckets.delete(oldestKey)
    }
  }
  const current = buckets.get(key)
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (current.count >= limit) return false
  current.count += 1
  return true
}

export function requestClientKey(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'local'
}
