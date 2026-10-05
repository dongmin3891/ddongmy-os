import { closePostgresPool } from '@/database/postgres.server'
import { backfillSiteTraffic } from '@/features/traffic/site-traffic-backfill.server'

async function main() {
  try {
    const result = await backfillSiteTraffic()
    console.info('[traffic-backfill] Completed', result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown backfill failure'
    console.error(`[traffic-backfill] Failed: ${message}`)
    process.exitCode = 1
  } finally {
    await closePostgresPool()
  }
}

void main()
