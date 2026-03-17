// VibeCode — Rate Limiter
// Sliding window 30 req/min via Upstash Redis
// Se UPSTASH não configurado, permite tudo (dev mode)

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Singleton do rate limiter (apenas inicializado se Redis configurado)
let _rateLimit: Ratelimit | null = null

function getRateLimiter(): Ratelimit | null {
  if (_rateLimit) return _rateLimit

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    // Dev mode — sem Redis configurado, não limitar
    return null
  }

  _rateLimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: false,
    prefix: 'vibecode:vi:rl',
  })

  return _rateLimit
}

export async function rateLimit(
  identifier: string
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  const limiter = getRateLimiter()

  if (!limiter) {
    // Dev mode: allow all
    return { success: true }
  }

  const result = await limiter.limit(identifier)

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}
