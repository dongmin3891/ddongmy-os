import 'server-only'
import { readFile } from 'node:fs/promises'
import { cache } from 'react'
import { z } from 'zod'
import type { PublicHomelabStatus } from './homelab-status'

const SERVICE_ACCOUNT_PATH = '/var/run/secrets/kubernetes.io/serviceaccount'
const DEPLOYMENT_NAME = 'web-app'
const CONTAINER_NAME = 'web'

const kubernetesDeploymentSchema = z.object({
  metadata: z.object({
    generation: z.number().int().nonnegative(),
  }),
  spec: z.object({
    replicas: z.number().int().nonnegative().default(1),
    template: z.object({
      spec: z.object({
        containers: z.array(
          z.object({
            name: z.string(),
            image: z.string(),
          }),
        ),
      }),
    }),
  }),
  status: z.object({
    observedGeneration: z.number().int().nonnegative().default(0),
    readyReplicas: z.number().int().nonnegative().default(0),
    updatedReplicas: z.number().int().nonnegative().default(0),
    availableReplicas: z.number().int().nonnegative().default(0),
    conditions: z
      .array(
        z.object({
          type: z.string(),
          status: z.string(),
          lastUpdateTime: z.iso.datetime(),
        }),
      )
      .default([]),
  }),
})

class KubernetesResponseError extends Error {
  constructor(readonly status: number) {
    super(`Kubernetes request failed with status ${status}`)
  }
}

function getKubernetesApiUrl(namespace: string) {
  const host = process.env.KUBERNETES_SERVICE_HOST
  const port = process.env.KUBERNETES_SERVICE_PORT_HTTPS ?? '443'

  if (!host) return undefined

  return new URL(
    `/apis/apps/v1/namespaces/${encodeURIComponent(namespace)}/deployments/${DEPLOYMENT_NAME}`,
    `https://${host}:${port}`,
  )
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch (cause) {
    throw new Error('Kubernetes returned an invalid JSON response', { cause })
  }
}

function getReleaseSha(image: string) {
  const tag = image.slice(image.lastIndexOf(':') + 1)
  return /^[a-f0-9]{7,40}$/.test(tag) ? tag.slice(0, 7) : null
}

function getFailureReason(error: unknown) {
  if (error instanceof KubernetesResponseError) return `http-${error.status}`
  if (error instanceof z.ZodError) return 'invalid-response'
  if (error instanceof Error && error.name === 'TimeoutError') return 'timeout'
  return 'request-failed'
}

async function readHomelabStatus(): Promise<PublicHomelabStatus> {
  const checkedAt = new Date().toISOString()
  if (!process.env.KUBERNETES_SERVICE_HOST) return { status: 'unavailable', checkedAt }

  try {
    const [namespace, token] = await Promise.all([
      readFile(`${SERVICE_ACCOUNT_PATH}/namespace`, 'utf8'),
      readFile(`${SERVICE_ACCOUNT_PATH}/token`, 'utf8'),
    ])
    const url = getKubernetesApiUrl(namespace.trim())
    if (!url) return { status: 'unavailable', checkedAt }

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token.trim()}`,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(2_000),
    })
    const body = await readJson(response)

    if (!response.ok) throw new KubernetesResponseError(response.status)

    const deployment = kubernetesDeploymentSchema.parse(body)
    const container = deployment.spec.template.spec.containers.find(
      (item) => item.name === CONTAINER_NAME,
    )
    if (!container) throw new Error(`Container ${CONTAINER_NAME} was not found`)

    const desiredReplicas = deployment.spec.replicas
    const readyReplicas = deployment.status.readyReplicas
    const isHealthy =
      desiredReplicas > 0 &&
      readyReplicas === desiredReplicas &&
      deployment.status.updatedReplicas === desiredReplicas &&
      deployment.status.availableReplicas === desiredReplicas &&
      deployment.status.observedGeneration >= deployment.metadata.generation
    const rolloutCondition = deployment.status.conditions.find(
      (condition) => condition.type === 'Progressing' && condition.status === 'True',
    )

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      readyReplicas,
      desiredReplicas,
      releaseSha: getReleaseSha(container.image),
      deployedAt: rolloutCondition?.lastUpdateTime ?? null,
      checkedAt,
    }
  } catch (error) {
    console.error(`[homelab-status] ${getFailureReason(error)}`)
    return { status: 'unavailable', checkedAt }
  }
}

export const getHomelabStatus = cache(readHomelabStatus)
