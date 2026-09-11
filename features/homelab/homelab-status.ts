import { z } from 'zod'

const availableHomelabStatusSchema = z.object({
  status: z.enum(['healthy', 'degraded']),
  readyReplicas: z.number().int().nonnegative(),
  desiredReplicas: z.number().int().nonnegative(),
  releaseSha: z.string().regex(/^[a-f0-9]{7}$/).nullable(),
  deployedAt: z.iso.datetime().nullable(),
  checkedAt: z.iso.datetime(),
})

const unavailableHomelabStatusSchema = z.object({
  status: z.literal('unavailable'),
  checkedAt: z.iso.datetime(),
})

export const publicHomelabStatusSchema = z.discriminatedUnion('status', [
  availableHomelabStatusSchema,
  unavailableHomelabStatusSchema,
])

export type PublicHomelabStatus = z.infer<typeof publicHomelabStatusSchema>
