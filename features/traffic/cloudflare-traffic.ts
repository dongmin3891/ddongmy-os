import { z } from 'zod'

const SEOUL_UTC_OFFSET_MS = 9 * 60 * 60 * 1_000
const DAY_MS = 24 * 60 * 60 * 1_000

const visitGroupSchema = z.object({
  sum: z.object({
    visits: z.number().int().nonnegative(),
  }),
})

const cloudflareTrafficResponseSchema = z.object({
  data: z.object({
    viewer: z.object({
      zones: z.array(
        z.object({
          today: z.array(visitGroupSchema),
          lastSevenDays: z.array(visitGroupSchema),
        }),
      ),
    }),
  }),
  errors: z
    .array(
      z.object({
        message: z.string(),
      }),
    )
    .nullable()
    .optional(),
})

export type TrafficQueryWindow = {
  todayStartsAt: string
  lastSevenDaysStartAt: string
  endsAt: string
}

export type CloudflareTrafficCounts = {
  todayVisits: number
  lastSevenDaysVisits: number
}

export function getSeoulTrafficQueryWindow(now: Date): TrafficQueryWindow {
  if (!Number.isFinite(now.getTime())) throw new Error('Traffic query time must be valid')

  const seoulNow = new Date(now.getTime() + SEOUL_UTC_OFFSET_MS)
  const todayStartsAtMs =
    Date.UTC(seoulNow.getUTCFullYear(), seoulNow.getUTCMonth(), seoulNow.getUTCDate()) -
    SEOUL_UTC_OFFSET_MS

  return {
    todayStartsAt: new Date(todayStartsAtMs).toISOString(),
    lastSevenDaysStartAt: new Date(todayStartsAtMs - 6 * DAY_MS).toISOString(),
    endsAt: now.toISOString(),
  }
}

export function parseCloudflareTrafficCounts(body: unknown): CloudflareTrafficCounts {
  const response = cloudflareTrafficResponseSchema.parse(body)

  if (response.errors && response.errors.length > 0) {
    throw new Error('Cloudflare Analytics returned GraphQL errors')
  }

  if (response.data.viewer.zones.length !== 1) {
    throw new Error('Cloudflare Analytics must return exactly one zone')
  }

  const zone = response.data.viewer.zones[0]

  return {
    todayVisits: sumVisits(zone.today),
    lastSevenDaysVisits: sumVisits(zone.lastSevenDays),
  }
}

function sumVisits(groups: z.infer<typeof visitGroupSchema>[]) {
  return groups.reduce((total, group) => total + group.sum.visits, 0)
}
