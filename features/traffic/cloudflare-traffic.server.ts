import 'server-only'
import { z } from 'zod'
import {
  getSeoulVisitDate,
  getSeoulTrafficQueryWindow,
  getSeoulYesterdayTrafficQueryWindow,
  parseCloudflareTrafficCounts,
  parseCloudflareYesterdayVisits,
} from './cloudflare-traffic'
import { saveSiteVisitSnapshotAndGetTotal } from './site-visit-stats.server'
import type { PublicTrafficStats } from './traffic-stats'

const CLOUDFLARE_GRAPHQL_URL = 'https://api.cloudflare.com/client/v4/graphql'
const TRAFFIC_HOSTNAME = 'ddongmy.com'
const TRAFFIC_REQUEST_TIMEOUT_MS = 10_000

const cloudflareTrafficEnvironmentSchema = z.object({
  CLOUDFLARE_ANALYTICS_API_TOKEN: z.string().trim().min(1),
  CLOUDFLARE_ZONE_ID: z.string().trim().min(1),
})

type CloudflareTrafficConfig = {
  apiToken: string
  zoneId: string
}

class CloudflareTrafficResponseError extends Error {
  constructor(readonly status: number) {
    super(`Cloudflare Analytics request failed with status ${status}`)
  }
}

const trafficQuery = `
  query Traffic(
    $zoneTag: string
    $hostname: string
    $todayStartsAt: Time
    $lastSevenDaysStartAt: Time
    $endsAt: Time
  ) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        today: httpRequestsAdaptiveGroups(
          limit: 1
          filter: {
            clientRequestHTTPHost: $hostname
            requestSource: "eyeball"
            datetime_geq: $todayStartsAt
            datetime_lt: $endsAt
          }
        ) {
          sum {
            visits
          }
        }
        lastSevenDays: httpRequestsAdaptiveGroups(
          limit: 1
          filter: {
            clientRequestHTTPHost: $hostname
            requestSource: "eyeball"
            datetime_geq: $lastSevenDaysStartAt
            datetime_lt: $endsAt
          }
        ) {
          sum {
            visits
          }
        }
      }
    }
  }
`

const yesterdayTrafficQuery = `
  query YesterdayTraffic(
    $zoneTag: string
    $hostname: string
    $startsAt: Time
    $endsAt: Time
  ) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        yesterday: httpRequestsAdaptiveGroups(
          limit: 1
          filter: {
            clientRequestHTTPHost: $hostname
            requestSource: "eyeball"
            datetime_geq: $startsAt
            datetime_lt: $endsAt
          }
        ) {
          sum {
            visits
          }
        }
      }
    }
  }
`

function getCloudflareTrafficConfig(): CloudflareTrafficConfig | undefined {
  const hasAnyConfig =
    process.env.CLOUDFLARE_ANALYTICS_API_TOKEN || process.env.CLOUDFLARE_ZONE_ID

  if (!hasAnyConfig) return undefined

  const result = cloudflareTrafficEnvironmentSchema.safeParse(process.env)
  if (!result.success) {
    const invalidKeys = [...new Set(result.error.issues.map((issue) => issue.path[0]))]
    throw new Error(`Invalid Cloudflare Analytics configuration: ${invalidKeys.join(', ')}`)
  }

  return {
    apiToken: result.data.CLOUDFLARE_ANALYTICS_API_TOKEN,
    zoneId: result.data.CLOUDFLARE_ZONE_ID,
  }
}

async function readRequiredJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch (cause) {
    throw new Error('Cloudflare Analytics returned an invalid JSON response', { cause })
  }
}

async function requestCloudflareAnalytics({
  config,
  query,
  variables,
}: {
  config: CloudflareTrafficConfig
  query: string
  variables: Record<string, string>
}) {
  const response = await fetch(CLOUDFLARE_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        zoneTag: config.zoneId,
        hostname: TRAFFIC_HOSTNAME,
        ...variables,
      },
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(TRAFFIC_REQUEST_TIMEOUT_MS),
  })
  const body = await readRequiredJson(response)

  if (!response.ok) throw new CloudflareTrafficResponseError(response.status)

  return body
}

async function readCloudflareTrafficStats(): Promise<PublicTrafficStats> {
  const checkedAt = new Date()

  try {
    const config = getCloudflareTrafficConfig()
    if (!config) return { status: 'unavailable', checkedAt: checkedAt.toISOString() }

    const queryWindow = getSeoulTrafficQueryWindow(checkedAt)
    const body = await requestCloudflareAnalytics({
      config,
      query: trafficQuery,
      variables: queryWindow,
    })

    const trafficCounts = parseCloudflareTrafficCounts(body)
    let totalVisits: number | null = null

    try {
      totalVisits = await saveSiteVisitSnapshotAndGetTotal({
        visitDate: getSeoulVisitDate(checkedAt),
        visits: trafficCounts.todayVisits,
        observedAt: checkedAt,
      })
    } catch (error) {
      console.error('[traffic] Site visit snapshot is unavailable', error)
    }

    return {
      status: 'available',
      ...trafficCounts,
      totalVisits,
      checkedAt: checkedAt.toISOString(),
    }
  } catch (error) {
    console.error('[traffic] Cloudflare Analytics is unavailable', error)
    return { status: 'unavailable', checkedAt: checkedAt.toISOString() }
  }
}

export type CloudflareVisitSnapshot = {
  visitDate: string
  visits: number
  observedAt: Date
}

export async function getYesterdayCloudflareVisitSnapshot(
  observedAt = new Date(),
): Promise<CloudflareVisitSnapshot> {
  const config = getCloudflareTrafficConfig()
  if (!config) throw new Error('Cloudflare Analytics configuration is required')

  const queryWindow = getSeoulYesterdayTrafficQueryWindow(observedAt)
  const body = await requestCloudflareAnalytics({
    config,
    query: yesterdayTrafficQuery,
    variables: {
      startsAt: queryWindow.startsAt,
      endsAt: queryWindow.endsAt,
    },
  })

  return {
    visitDate: queryWindow.visitDate,
    visits: parseCloudflareYesterdayVisits(body),
    observedAt,
  }
}

export const getCloudflareTrafficStats = readCloudflareTrafficStats
