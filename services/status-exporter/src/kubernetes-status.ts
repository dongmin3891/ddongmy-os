import { readFile } from 'node:fs/promises'
import type {
  PublicWorkloadStatus,
  StatusExporterResponse,
  WorkloadTarget,
} from './contracts.js'

const SERVICE_ACCOUNT_PATH = '/var/run/secrets/kubernetes.io/serviceaccount'
const REQUEST_TIMEOUT_MS = 2_000

type UnknownRecord = Record<string, unknown>

class KubernetesResponseError extends Error {
  constructor(readonly status: number) {
    super(`Kubernetes request failed with status ${status}`)
  }
}

function getRecord(value: unknown, field: string): UnknownRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Kubernetes response has invalid ${field}`)
  }

  return value as UnknownRecord
}

function getRequiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Kubernetes response has invalid ${field}`)
  }

  return value
}

function getNonnegativeInteger(value: unknown, field: string, fallback?: number) {
  if (value === undefined && fallback !== undefined) return fallback
  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new Error(`Kubernetes response has invalid ${field}`)
  }

  return value as number
}

function getOptionalDate(value: unknown) {
  if (value === undefined) return null
  const date = getRequiredString(value, 'condition timestamp')
  if (Number.isNaN(Date.parse(date))) {
    throw new Error('Kubernetes response has invalid condition timestamp')
  }

  return date
}

function getReleaseSha(image: string) {
  const match = image.match(/:([a-f0-9]{7,40})$/)
  return match?.[1]?.slice(0, 7) ?? null
}

function getKubernetesApiUrl(target: WorkloadTarget) {
  const host = process.env.KUBERNETES_SERVICE_HOST
  const port = process.env.KUBERNETES_SERVICE_PORT_HTTPS ?? '443'
  if (!host) throw new Error('Kubernetes API host is unavailable')

  const resource = target.kind === 'Deployment' ? 'deployments' : 'statefulsets'
  return new URL(
    `/apis/apps/v1/namespaces/${encodeURIComponent(target.namespace)}/${resource}/${encodeURIComponent(target.name)}`,
    `https://${host}:${port}`,
  )
}

async function readRequiredJson(response: Response): Promise<unknown> {
  if (!response.ok) throw new KubernetesResponseError(response.status)

  try {
    return await response.json()
  } catch (cause) {
    throw new Error('Kubernetes returned invalid JSON', { cause })
  }
}

function getContainerImage(spec: UnknownRecord, target: WorkloadTarget) {
  const template = getRecord(spec.template, 'spec.template')
  const podSpec = getRecord(template.spec, 'spec.template.spec')
  if (!Array.isArray(podSpec.containers)) {
    throw new Error('Kubernetes response has invalid containers')
  }

  const container = podSpec.containers
    .map((value) => getRecord(value, 'container'))
    .find((value) => value.name === target.containerName)

  if (!container) throw new Error(`Container ${target.containerName} was not found`)
  return getRequiredString(container.image, 'container image')
}

function getDeployedAt(status: UnknownRecord, target: WorkloadTarget) {
  if (!Array.isArray(status.conditions)) return null

  const condition = status.conditions
    .map((value) => getRecord(value, 'condition'))
    .find((value) => {
      if (value.status !== 'True') return false
      return target.kind === 'Deployment'
        ? value.type === 'Progressing'
        : value.type === 'Ready'
    })

  return condition
    ? getOptionalDate(condition.lastUpdateTime ?? condition.lastTransitionTime)
    : null
}

function toPublicWorkloadStatus(
  body: unknown,
  target: WorkloadTarget,
): PublicWorkloadStatus {
  const workload = getRecord(body, 'workload')
  const metadata = getRecord(workload.metadata, 'metadata')
  const spec = getRecord(workload.spec, 'spec')
  const status = getRecord(workload.status, 'status')
  const desiredReplicas = getNonnegativeInteger(spec.replicas, 'spec.replicas', 1)
  const readyReplicas = getNonnegativeInteger(
    status.readyReplicas,
    'status.readyReplicas',
    0,
  )
  const updatedReplicas = getNonnegativeInteger(
    status.updatedReplicas,
    'status.updatedReplicas',
    0,
  )
  const observedGeneration = getNonnegativeInteger(
    status.observedGeneration,
    'status.observedGeneration',
    0,
  )
  const generation = getNonnegativeInteger(metadata.generation, 'metadata.generation')
  const kindSpecificReplicas =
    target.kind === 'Deployment'
      ? getNonnegativeInteger(status.availableReplicas, 'status.availableReplicas', 0)
      : getNonnegativeInteger(status.currentReplicas, 'status.currentReplicas', 0)
  const isHealthy =
    desiredReplicas > 0 &&
    readyReplicas === desiredReplicas &&
    updatedReplicas === desiredReplicas &&
    kindSpecificReplicas === desiredReplicas &&
    observedGeneration >= generation

  return {
    status: isHealthy ? 'healthy' : 'degraded',
    readyReplicas,
    desiredReplicas,
    releaseSha: getReleaseSha(getContainerImage(spec, target)),
    deployedAt: getDeployedAt(status, target),
  }
}

function getFailureReason(error: unknown) {
  if (error instanceof KubernetesResponseError) return `http-${error.status}`
  if (error instanceof Error && error.name === 'TimeoutError') return 'timeout'
  return 'request-failed'
}

async function getWorkloadStatus(
  target: WorkloadTarget,
  token: string,
): Promise<PublicWorkloadStatus> {
  try {
    const response = await fetch(getKubernetesApiUrl(target), {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    return toPublicWorkloadStatus(await readRequiredJson(response), target)
  } catch (error) {
    console.error(`[status-exporter] ${target.publicKey} ${getFailureReason(error)}`)
    return { status: 'unavailable' }
  }
}

export async function getStatusExporterResponse(
  targets: readonly WorkloadTarget[],
): Promise<StatusExporterResponse> {
  const checkedAt = new Date().toISOString()

  try {
    const token = (
      await readFile(`${SERVICE_ACCOUNT_PATH}/token`, 'utf8')
    ).trim()
    const entries = await Promise.all(
      targets.map(async (target) => [
        target.publicKey,
        await getWorkloadStatus(target, token),
      ] as const),
    )
    const workloads = Object.fromEntries(entries)

    if (Object.values(workloads).every((workload) => workload.status === 'unavailable')) {
      return { status: 'unavailable', checkedAt }
    }

    return {
      status: 'available',
      checkedAt,
      observedAt: new Date().toISOString(),
      data: { workloads },
    }
  } catch (error) {
    console.error(`[status-exporter] credentials ${getFailureReason(error)}`)
    return { status: 'unavailable', checkedAt }
  }
}
