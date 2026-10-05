import 'server-only'
import {
  getYesterdayCloudflareVisitSnapshot,
  type CloudflareVisitSnapshot,
} from './cloudflare-traffic.server'
import {
  finalizeSiteVisitSnapshot,
  type FinalizeSiteVisitSnapshotInput,
} from './site-visit-stats.server'

type SiteVisitFinalizationDependencies = {
  getYesterdaySnapshot: (observedAt: Date) => Promise<CloudflareVisitSnapshot>
  saveFinalizedSnapshot: (snapshot: FinalizeSiteVisitSnapshotInput) => Promise<void>
}

const defaultDependencies: SiteVisitFinalizationDependencies = {
  getYesterdaySnapshot: getYesterdayCloudflareVisitSnapshot,
  saveFinalizedSnapshot: finalizeSiteVisitSnapshot,
}

export async function finalizeYesterdaySiteVisits(
  observedAt = new Date(),
  dependencies = defaultDependencies,
) {
  const snapshot = await dependencies.getYesterdaySnapshot(observedAt)
  await dependencies.saveFinalizedSnapshot(snapshot)

  return snapshot
}
