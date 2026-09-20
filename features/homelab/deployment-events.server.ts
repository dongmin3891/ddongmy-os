import 'server-only'
import { cache } from 'react'
import { z } from 'zod'
import deploymentHistoryFallback from '../../data/homelab/deployment-history.json'
import type { DeploymentEvent } from './deployment-event'

const DEPLOYMENT_HISTORY_TIMEOUT_MS = 3_000
const DEFAULT_DEPLOYMENT_HISTORY_URL =
  'https://raw.githubusercontent.com/dongmin3891/ddongmy-os/main/data/homelab/deployment-history.json'

const deploymentStageSchema = z.object({
  status: z.enum(['pending', 'running', 'success', 'failed', 'unavailable']),
  startedAt: z.iso.datetime().nullable(),
  completedAt: z.iso.datetime().nullable(),
})

const deploymentEventSchema = z.object({
  deployedAt: z.iso.datetime(),
  serviceName: z.string().min(1).max(100),
  commitSha: z.string().regex(/^[a-f0-9]{40}$/),
  status: z.enum(['running', 'success', 'failed']),
  stages: z.object({
    githubPush: deploymentStageSchema,
    githubActions: deploymentStageSchema,
    ghcr: deploymentStageSchema,
    argoCd: deploymentStageSchema,
    k3sPodReady: deploymentStageSchema,
  }),
})

const deploymentHistorySchema = z.array(deploymentEventSchema).max(500)

export function parseDeploymentEvents(body: unknown): DeploymentEvent[] {
  return deploymentHistorySchema.parse(body)
}

function getDeploymentHistoryUrl() {
  const value = process.env.DEPLOYMENT_HISTORY_URL ?? DEFAULT_DEPLOYMENT_HISTORY_URL
  const url = new URL(value)
  if (url.protocol !== 'https:') {
    throw new Error('DEPLOYMENT_HISTORY_URL must use HTTPS')
  }

  return url
}

async function readDeploymentEvents(): Promise<DeploymentEvent[]> {
  try {
    const response = await fetch(getDeploymentHistoryUrl(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(DEPLOYMENT_HISTORY_TIMEOUT_MS),
    })
    if (!response.ok) throw new Error(`Deployment history request failed with ${response.status}`)

    const body: unknown = await response.json()
    return parseDeploymentEvents(body)
  } catch (error) {
    const reason = error instanceof z.ZodError ? 'invalid-response' : 'request-failed'
    console.error(`[deployment-history] ${reason}`)
    return parseDeploymentEvents(deploymentHistoryFallback)
  }
}

export const getDeploymentEvents = cache(readDeploymentEvents)
