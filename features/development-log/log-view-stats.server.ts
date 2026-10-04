import 'server-only'
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

export async function getDevelopmentLogViewStats(
  postId: string,
): Promise<DevelopmentLogViewStats> {
  const result = await getPostgresPool().query<LogViewStatsRow>(getLogViewStatsSql, [postId])
  return readSingleStatsRow(result.rows)
}

type IncrementDevelopmentLogViewInput = {
  postId: string
  postSlug: string
}

export async function incrementDevelopmentLogView({
  postId,
  postSlug,
}: IncrementDevelopmentLogViewInput): Promise<DevelopmentLogViewStats> {
  const result = await getPostgresPool().query<LogViewStatsRow>(incrementLogViewSql, [
    postId,
    postSlug,
  ])
  return readSingleStatsRow(result.rows)
}
