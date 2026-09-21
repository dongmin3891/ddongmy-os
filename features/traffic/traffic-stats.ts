import { z } from 'zod'

const availableTrafficStatsSchema = z.object({
  status: z.literal('available'),
  todayVisits: z.number().int().nonnegative(),
  lastSevenDaysVisits: z.number().int().nonnegative(),
  checkedAt: z.iso.datetime(),
})

const unavailableTrafficStatsSchema = z.object({
  status: z.literal('unavailable'),
  checkedAt: z.iso.datetime(),
})

export const publicTrafficStatsSchema = z.discriminatedUnion('status', [
  availableTrafficStatsSchema,
  unavailableTrafficStatsSchema,
])

export type PublicTrafficStats = z.infer<typeof publicTrafficStatsSchema>
