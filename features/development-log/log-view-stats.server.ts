import 'server-only'
import type { Pool, PoolClient } from 'pg'
import { z } from 'zod'
import { getPostgresPool } from '@/database/postgres.server'
import type { DevelopmentLogViewStats } from './log-view-count'

const logViewStatsRowSchema = z.object({
  today_views: z.string().regex(/^\d+$/),
  total_views: z.string().regex(/^\d+$/),
})

type LogViewStatsRow = z.infer<typeof logViewStatsRowSchema>

const getLogViewStatsSql = `
  SELECT
    COALESCE(
      SUM(views) FILTER (
        WHERE view_date = (NOW() AT TIME ZONE 'Asia/Seoul')::date
      ),
      0
    )::text AS today_views,
    COALESCE(SUM(views), 0)::text AS total_views
  FROM public.log_view_stats
  WHERE post_id = $1
`

const incrementLogViewSql = `
  WITH incremented AS (
    INSERT INTO public.log_view_stats (
      post_id,
      post_slug,
      view_date,
      views
    )
    VALUES (
      $1,
      $2,
      (NOW() AT TIME ZONE 'Asia/Seoul')::date,
      1
    )
    ON CONFLICT (post_id, view_date)
    DO UPDATE SET
      views = log_view_stats.views + 1,
      post_slug = EXCLUDED.post_slug
    RETURNING views, view_date
  )
  SELECT
    incremented.views::text AS today_views,
    (
      incremented.views + COALESCE(
        (
          SELECT SUM(views)
          FROM public.log_view_stats
          WHERE post_id = $1
            AND view_date <> incremented.view_date
        ),
        0
      )
    )::text AS total_views
  FROM incremented
`

const acceptLogViewVisitorSql = `
  INSERT INTO public.log_view_visitors (
    post_id,
    visitor_hash,
    last_counted_at
  )
  VALUES ($1, $2, NOW())
  ON CONFLICT (post_id, visitor_hash)
  DO UPDATE SET
    last_counted_at = EXCLUDED.last_counted_at
  WHERE log_view_visitors.last_counted_at <=
    EXCLUDED.last_counted_at - ($3 * INTERVAL '1 second')
  RETURNING post_id
`

const LOG_VIEW_DEDUPLICATION_WINDOW_SECONDS = 30 * 60

type PostgresQueryable = Pool | PoolClient

function toSafeViewCount(value: string) {
  const count = BigInt(value)
  if (count > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error('Development log view count exceeds the safe integer range')
  }

  return Number(count)
}

export function parseDevelopmentLogViewStatsRow(value: unknown): DevelopmentLogViewStats {
  const row = logViewStatsRowSchema.parse(value)

  return {
    todayViews: toSafeViewCount(row.today_views),
    totalViews: toSafeViewCount(row.total_views),
  }
}

function readSingleStatsRow(rows: LogViewStatsRow[]) {
  if (rows.length !== 1) {
    throw new Error(`Expected one development log view stats row, received ${rows.length}`)
  }

  return parseDevelopmentLogViewStatsRow(rows[0])
}

async function queryDevelopmentLogViewStats(queryable: PostgresQueryable, postId: string) {
  const result = await queryable.query<LogViewStatsRow>(getLogViewStatsSql, [postId])
  return readSingleStatsRow(result.rows)
}

export async function getDevelopmentLogViewStats(
  postId: string,
): Promise<DevelopmentLogViewStats> {
  return queryDevelopmentLogViewStats(getPostgresPool(), postId)
}

type IncrementDevelopmentLogViewInput = {
  postId: string
  postSlug: string
  visitorHash: string
}

export type IncrementDevelopmentLogViewResult = {
  status: 'counted' | 'duplicate'
  viewStats: DevelopmentLogViewStats
}

export async function incrementDevelopmentLogView({
  postId,
  postSlug,
  visitorHash,
}: IncrementDevelopmentLogViewInput): Promise<IncrementDevelopmentLogViewResult> {
  const client = await getPostgresPool().connect()

  try {
    await client.query('BEGIN')

    const visitorResult = await client.query(acceptLogViewVisitorSql, [
      postId,
      visitorHash,
      LOG_VIEW_DEDUPLICATION_WINDOW_SECONDS,
    ])

    if (visitorResult.rows.length === 0) {
      const viewStats = await queryDevelopmentLogViewStats(client, postId)
      await client.query('COMMIT')
      return { status: 'duplicate', viewStats }
    }

    const incrementResult = await client.query<LogViewStatsRow>(incrementLogViewSql, [
      postId,
      postSlug,
    ])
    const viewStats = readSingleStatsRow(incrementResult.rows)
    await client.query('COMMIT')
    return { status: 'counted', viewStats }
  } catch (error) {
    try {
      await client.query('ROLLBACK')
    } catch (rollbackError) {
      console.error('[log-views] Failed to roll back view transaction', rollbackError)
    }
    throw error
  } finally {
    client.release()
  }
}
