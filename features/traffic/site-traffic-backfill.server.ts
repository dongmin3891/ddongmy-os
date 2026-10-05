import 'server-only'
import {
  getCloudflareTrafficBackfillSnapshots,
  type CloudflareVisitSnapshot,
} from './cloudflare-traffic.server'
import {
  backfillSiteVisitSnapshots,
  type BackfillSiteVisitSnapshotsResult,
} from './site-visit-stats.server'

type SiteTrafficBackfillDependencies = {
  getSnapshots: (observedAt: Date) => Promise<CloudflareVisitSnapshot[]>
  saveSnapshots: (
    snapshots: CloudflareVisitSnapshot[],
  ) => Promise<BackfillSiteVisitSnapshotsResult>
}

const defaultDependencies: SiteTrafficBackfillDependencies = {
  getSnapshots: getCloudflareTrafficBackfillSnapshots,
  saveSnapshots: backfillSiteVisitSnapshots,
}

export async function backfillSiteTraffic(
  observedAt = new Date(),
  dependencies = defaultDependencies,
) {
  const snapshots = await dependencies.getSnapshots(observedAt)
  const result = await dependencies.saveSnapshots(snapshots)

  return {
    ...result,
    startsOn: snapshots[0].visitDate,
    endsOn: snapshots[snapshots.length - 1].visitDate,
    observedAt: observedAt.toISOString(),
  }
}
