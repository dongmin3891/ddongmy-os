import 'server-only'
import { z } from 'zod'
import { getPostgresPool } from '@/database/postgres.server'

const siteVisitTotalRowSchema = z.object({
  total_visits: z.string().regex(/^\d+$/),
})

const upsertSiteVisitSnapshotSql = `
  INSERT INTO public.site_visit_stats (
    visit_date,
    visits,
    observed_at
  )
  VALUES ($1, $2, $3)
  ON CONFLICT (visit_date)
  DO UPDATE SET
    visits = EXCLUDED.visits,
    observed_at = EXCLUDED.observed_at
  WHERE site_visit_stats.observed_at <= EXCLUDED.observed_at
`

const getSiteVisitTotalSql = `
  SELECT COALESCE(SUM(visits), 0)::text AS total_visits
  FROM public.site_visit_stats
`

const finalizeSiteVisitSnapshotSql = `
  INSERT INTO public.site_visit_stats (
    visit_date,
    visits,
    observed_at,
    finalized_at
  )
  VALUES ($1, $2, $3, $3)
  ON CONFLICT (visit_date)
  DO UPDATE SET
    visits = EXCLUDED.visits,
    observed_at = EXCLUDED.observed_at,
    finalized_at = EXCLUDED.finalized_at
  WHERE site_visit_stats.observed_at <= EXCLUDED.observed_at
`

type SaveSiteVisitSnapshotInput = {
  visitDate: string
  visits: number
  observedAt: Date
}

export type FinalizeSiteVisitSnapshotInput = SaveSiteVisitSnapshotInput

export function parseSiteVisitTotalRow(value: unknown) {
  const row = siteVisitTotalRowSchema.parse(value)
  const totalVisits = BigInt(row.total_visits)

  if (totalVisits > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error('Site visit total exceeds the safe integer range')
  }

  return Number(totalVisits)
}

export async function saveSiteVisitSnapshotAndGetTotal({
  visitDate,
  visits,
  observedAt,
}: SaveSiteVisitSnapshotInput) {
  const client = await getPostgresPool().connect()

  try {
    await client.query('BEGIN')
    await client.query(upsertSiteVisitSnapshotSql, [visitDate, visits, observedAt])

    const result = await client.query(getSiteVisitTotalSql)
    if (result.rows.length !== 1) {
      throw new Error(`Expected one site visit total row, received ${result.rows.length}`)
    }

    const totalVisits = parseSiteVisitTotalRow(result.rows[0])
    await client.query('COMMIT')
    return totalVisits
  } catch (error) {
    try {
      await client.query('ROLLBACK')
    } catch (rollbackError) {
      console.error('[traffic] Failed to roll back site visit snapshot', rollbackError)
    }

    throw error
  } finally {
    client.release()
  }
}

export async function finalizeSiteVisitSnapshot({
  visitDate,
  visits,
  observedAt,
}: FinalizeSiteVisitSnapshotInput) {
  await getPostgresPool().query(finalizeSiteVisitSnapshotSql, [visitDate, visits, observedAt])
}
