import 'server-only'
import { z } from 'zod'
import { getPostgresPool } from '@/database/postgres.server'

export const LOG_VIEW_RATE_LIMIT_MAX_REQUESTS = 20
export const LOG_VIEW_RATE_LIMIT_WINDOW_SECONDS = 10 * 60

const logViewRateLimitRowSchema = z.object({
  allowed: z.boolean(),
  retry_after_seconds: z.number().int().nonnegative(),
})

const consumeLogViewRateLimitSql = `
  INSERT INTO public.log_view_request_limits (
    requester_hash,
    window_started_at,
    request_count,
    last_seen_at
  )
  VALUES ($1, NOW(), 1, NOW())
  ON CONFLICT (requester_hash)
  DO UPDATE SET
    window_started_at = CASE
      WHEN log_view_request_limits.window_started_at <= NOW() - ($2 * INTERVAL '1 second')
        THEN NOW()
      ELSE log_view_request_limits.window_started_at
    END,
    request_count = CASE
      WHEN log_view_request_limits.window_started_at <= NOW() - ($2 * INTERVAL '1 second')
        THEN 1
      ELSE LEAST(log_view_request_limits.request_count + 1, $3 + 1)
    END,
    last_seen_at = NOW()
  RETURNING
    request_count <= $3 AS allowed,
    GREATEST(
      0,
      CEIL(
        EXTRACT(
          EPOCH FROM (
            window_started_at + ($2 * INTERVAL '1 second') - NOW()
          )
        )
      )
    )::integer AS retry_after_seconds
`

export type LogViewRateLimitResult =
  | { status: 'allowed' }
  | { status: 'limited'; retryAfterSeconds: number }

export function parseLogViewRateLimitRow(value: unknown): LogViewRateLimitResult {
  const row = logViewRateLimitRowSchema.parse(value)
  if (row.allowed) return { status: 'allowed' }

  return {
    status: 'limited',
    retryAfterSeconds: row.retry_after_seconds,
  }
}

export async function consumeLogViewRateLimit(
  requesterHash: string,
): Promise<LogViewRateLimitResult> {
  const result = await getPostgresPool().query(consumeLogViewRateLimitSql, [
    requesterHash,
    LOG_VIEW_RATE_LIMIT_WINDOW_SECONDS,
    LOG_VIEW_RATE_LIMIT_MAX_REQUESTS,
  ])

  if (result.rows.length !== 1) {
    throw new Error(`Expected one log view rate-limit row, received ${result.rows.length}`)
  }

  return parseLogViewRateLimitRow(result.rows[0])
}
