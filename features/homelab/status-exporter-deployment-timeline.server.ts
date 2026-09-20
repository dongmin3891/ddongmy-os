import 'server-only'
import { z } from 'zod'
import type { DeploymentRuntimeStatus } from './deployment-runtime-status'

const STATUS_EXPORTER_TIMEOUT_MS = 3_000

const runtimeStageSchema = z.object({
  status: z.enum(['running', 'success', 'failed', 'unavailable']),
  startedAt: z.iso.datetime().nullable(),
  completedAt: z.iso.datetime().nullable(),
})

const deploymentRuntimeSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.enum(['running', 'success', 'failed']),
    checkedAt: z.iso.datetime(),
    commitSha: z.string().regex(/^[a-f0-9]{40}$/),
    stages: z.object({
      argoCd: runtimeStageSchema,
      k3sPodReady: runtimeStageSchema,
    }),
  }),
  z.object({
    status: z.literal('unavailable'),
    checkedAt: z.iso.datetime(),
  }),
])

function getStatusExporterUrl() {
  const baseUrl = process.env.STATUS_EXPORTER_BASE_URL
  if (!baseUrl) return undefined

  const url = new URL('/deployment-timeline', baseUrl)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('STATUS_EXPORTER_BASE_URL must use HTTP or HTTPS')
  }
  return url
}

export async function getDeploymentRuntimeStatus(): Promise<DeploymentRuntimeStatus> {
  const checkedAt = new Date().toISOString()
  try {
    const url = getStatusExporterUrl()
    if (!url) return { status: 'unavailable', checkedAt }

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(STATUS_EXPORTER_TIMEOUT_MS),
    })
    if (!response.ok) throw new Error(`Status exporter request failed with ${response.status}`)

    const body: unknown = await response.json()
    return deploymentRuntimeSchema.parse(body)
  } catch (error) {
    const reason = error instanceof z.ZodError ? 'invalid-response' : 'request-failed'
    console.error(`[deployment-timeline-client] ${reason}`)
    return { status: 'unavailable', checkedAt }
  }
}
