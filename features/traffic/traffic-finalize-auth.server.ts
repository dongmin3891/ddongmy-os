import 'server-only'
import { timingSafeEqual } from 'node:crypto'
import { z } from 'zod'

const trafficFinalizeEnvironmentSchema = z.object({
  SITE_TRAFFIC_FINALIZE_SECRET: z.string().trim().min(32),
})

export function getSiteTrafficFinalizeSecret() {
  const result = trafficFinalizeEnvironmentSchema.safeParse(process.env)
  if (!result.success) {
    throw new Error('SITE_TRAFFIC_FINALIZE_SECRET must contain at least 32 characters')
  }

  return result.data.SITE_TRAFFIC_FINALIZE_SECRET
}

export function hasValidTrafficFinalizeAuthorization(
  authorization: string | null,
  expectedSecret: string,
) {
  if (!authorization?.startsWith('Bearer ')) return false

  const suppliedSecret = authorization.slice('Bearer '.length)
  if (!suppliedSecret || /\s/.test(suppliedSecret)) return false

  const suppliedBuffer = Buffer.from(suppliedSecret)
  const expectedBuffer = Buffer.from(expectedSecret)

  return (
    suppliedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(suppliedBuffer, expectedBuffer)
  )
}
