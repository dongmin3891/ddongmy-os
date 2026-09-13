import 'server-only'
import { cache } from 'react'
import { z } from 'zod'
import type { PublicHomelabStatus } from './homelab-status'

const STATUS_EXPORTER_TIMEOUT_MS = 2_000

const workloadStatusSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.enum(['healthy', 'degraded']),
    readyReplicas: z.number().int().nonnegative(),
    desiredReplicas: z.number().int().nonnegative(),
    releaseSha: z.string().regex(/^[a-f0-9]{7}$/).nullable(),
    deployedAt: z.iso.datetime().nullable(),
  }),
  z.object({ status: z.literal('unavailable') }),
])

const statusExporterResponseSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('available'),
    checkedAt: z.iso.datetime(),
    observedAt: z.iso.datetime(),
    data: z.object({
      workloads: z.object({
        webApp: workloadStatusSchema,
      }),
    }),
  }),
  z.object({
    status: z.literal('unavailable'),
    checkedAt: z.iso.datetime(),
  }),
])

class StatusExporterResponseError extends Error {
  constructor(readonly status: number) {
    super(`Status exporter request failed with status ${status}`)
  }
}

function getStatusExporterUrl() {
  const baseUrl = process.env.STATUS_EXPORTER_BASE_URL
  if (!baseUrl) return undefined

  const url = new URL('/status', baseUrl)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('STATUS_EXPORTER_BASE_URL must use HTTP or HTTPS')
  }

  return url
}

async function readRequiredJson(response: Response): Promise<unknown> {
  if (!response.ok) throw new StatusExporterResponseError(response.status)

  try {
    return await response.json()
  } catch (cause) {
    throw new Error('Status exporter returned invalid JSON', { cause })
  }
}

function getFailureReason(error: unknown) {
  if (error instanceof StatusExporterResponseError) return `http-${error.status}`
  if (error instanceof z.ZodError) return 'invalid-response'
  if (error instanceof Error && error.name === 'TimeoutError') return 'timeout'
  return 'request-failed'
}

async function readStatusExporterHomelabStatus(): Promise<PublicHomelabStatus> {
  const checkedAt = new Date().toISOString()

  try {
    const url = getStatusExporterUrl()
    if (!url) return { status: 'unavailable', checkedAt }

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(STATUS_EXPORTER_TIMEOUT_MS),
    })
    const exporterStatus = statusExporterResponseSchema.parse(
      await readRequiredJson(response),
    )

    if (exporterStatus.status === 'unavailable') {
      return { status: 'unavailable', checkedAt: exporterStatus.checkedAt }
    }

    const webApp = exporterStatus.data.workloads.webApp
    if (webApp.status === 'unavailable') {
      return { status: 'unavailable', checkedAt: exporterStatus.checkedAt }
    }

    return {
      status: webApp.status,
      readyReplicas: webApp.readyReplicas,
      desiredReplicas: webApp.desiredReplicas,
      releaseSha: webApp.releaseSha,
      deployedAt: webApp.deployedAt,
      checkedAt: exporterStatus.checkedAt,
    }
  } catch (error) {
    console.error(`[status-exporter-client] ${getFailureReason(error)}`)
    return { status: 'unavailable', checkedAt }
  }
}

export const getStatusExporterHomelabStatus = cache(
  readStatusExporterHomelabStatus,
)
