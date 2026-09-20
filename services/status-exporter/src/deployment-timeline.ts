import { readFile } from 'node:fs/promises'
import type {
  DeploymentRuntimeResponse,
  DeploymentRuntimeStage,
} from './contracts.js'

const SERVICE_ACCOUNT_PATH = '/var/run/secrets/kubernetes.io/serviceaccount'
const REQUEST_TIMEOUT_MS = 2_000
const WEB_APP_LABEL_SELECTOR = 'app=web'

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

function getOptionalDate(value: unknown) {
  if (value === undefined || value === null) return null
  const date = getRequiredString(value, 'timestamp')
  if (Number.isNaN(Date.parse(date))) throw new Error('Kubernetes response has invalid timestamp')
  return new Date(date).toISOString()
}

function getKubernetesUrl(path: string) {
  const host = process.env.KUBERNETES_SERVICE_HOST
  const port = process.env.KUBERNETES_SERVICE_PORT_HTTPS ?? '443'
  if (!host) throw new Error('Kubernetes API host is unavailable')
  return new URL(path, `https://${host}:${port}`)
}

async function readRequiredJson(response: Response): Promise<unknown> {
  if (!response.ok) throw new KubernetesResponseError(response.status)
  try {
    return await response.json()
  } catch (cause) {
    throw new Error('Kubernetes returned invalid JSON', { cause })
  }
}

async function getKubernetesResource(path: string, token: string) {
  const response = await fetch(getKubernetesUrl(path), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  return readRequiredJson(response)
}

function getContainerImage(spec: UnknownRecord, containerName: string) {
  const template = getRecord(spec.template, 'spec.template')
  const podSpec = getRecord(template.spec, 'spec.template.spec')
  if (!Array.isArray(podSpec.containers)) throw new Error('Deployment has invalid containers')

  const container = podSpec.containers
    .map((value) => getRecord(value, 'container'))
    .find((value) => value.name === containerName)
  if (!container) throw new Error(`Container ${containerName} was not found`)
  return getRequiredString(container.image, 'container image')
}

function getReleaseSha(image: string) {
  const match = image.match(/:([a-f0-9]{40})$/)
  if (!match?.[1]) throw new Error('Deployment image does not have a full release SHA')
  return match[1]
}

function deploymentHasFailed(status: UnknownRecord) {
  if (!Array.isArray(status.conditions)) return false
  return status.conditions
    .map((value) => getRecord(value, 'deployment condition'))
    .some(
      (condition) =>
        condition.type === 'Progressing' &&
        condition.status === 'False' &&
        condition.reason === 'ProgressDeadlineExceeded',
    )
}

type DeploymentDetails = {
  commitSha: string
  desiredReplicas: number
  hasFailed: boolean
}

function parseDeployment(body: unknown): DeploymentDetails {
  const deployment = getRecord(body, 'deployment')
  const spec = getRecord(deployment.spec, 'deployment spec')
  const status = getRecord(deployment.status, 'deployment status')
  const desiredReplicas = spec.replicas === undefined ? 1 : spec.replicas
  if (!Number.isInteger(desiredReplicas) || (desiredReplicas as number) < 1) {
    throw new Error('Deployment has invalid replicas')
  }

  return {
    commitSha: getReleaseSha(getContainerImage(spec, 'web')),
    desiredReplicas: desiredReplicas as number,
    hasFailed: deploymentHasFailed(status),
  }
}

function getPodImage(pod: UnknownRecord) {
  const spec = getRecord(pod.spec, 'pod spec')
  if (!Array.isArray(spec.containers)) throw new Error('Pod has invalid containers')
  const container = spec.containers
    .map((value) => getRecord(value, 'pod container'))
    .find((value) => value.name === 'web')
  return container ? getRequiredString(container.image, 'pod container image') : null
}

function getPodReadyAt(pod: UnknownRecord) {
  const status = getRecord(pod.status, 'pod status')
  if (!Array.isArray(status.conditions)) return null
  const ready = status.conditions
    .map((value) => getRecord(value, 'pod condition'))
    .find((condition) => condition.type === 'Ready' && condition.status === 'True')
  return ready ? getOptionalDate(ready.lastTransitionTime) : null
}

function parseK3sStage(
  body: unknown,
  deployment: DeploymentDetails,
): DeploymentRuntimeStage {
  const podList = getRecord(body, 'pod list')
  if (!Array.isArray(podList.items)) throw new Error('Pod list has invalid items')
  const releasePods = podList.items
    .map((value) => getRecord(value, 'pod'))
    .filter((pod) => getPodImage(pod)?.endsWith(`:${deployment.commitSha}`))
  const startedAtValues = releasePods
    .map((pod) => getOptionalDate(getRecord(pod.metadata, 'pod metadata').creationTimestamp))
    .filter((value): value is string => value !== null)
    .sort()
  const readyAtValues = releasePods
    .map(getPodReadyAt)
    .filter((value): value is string => value !== null)
    .sort()
  const isReady =
    releasePods.length >= deployment.desiredReplicas &&
    readyAtValues.length >= deployment.desiredReplicas

  return {
    status: deployment.hasFailed ? 'failed' : isReady ? 'success' : 'running',
    startedAt: startedAtValues[0] ?? null,
    completedAt: isReady ? (readyAtValues.at(-1) ?? null) : null,
  }
}

function parseArgoCdStage(body: unknown): DeploymentRuntimeStage {
  const application = getRecord(body, 'Argo CD Application')
  const status = getRecord(application.status, 'Application status')
  if (!status.operationState) {
    return { status: 'unavailable', startedAt: null, completedAt: null }
  }

  const operation = getRecord(status.operationState, 'Application operation state')
  const phase = getRequiredString(operation.phase, 'Application operation phase')
  const stageStatus =
    phase === 'Succeeded'
      ? 'success'
      : phase === 'Failed' || phase === 'Error' || phase === 'Terminated'
        ? 'failed'
        : phase === 'Running' || phase === 'Waiting'
          ? 'running'
          : 'unavailable'

  return {
    status: stageStatus,
    startedAt: getOptionalDate(operation.startedAt),
    completedAt: getOptionalDate(operation.finishedAt),
  }
}

function getFailureReason(error: unknown) {
  if (error instanceof KubernetesResponseError) return `http-${error.status}`
  if (error instanceof Error && error.name === 'TimeoutError') return 'timeout'
  return 'request-failed'
}

export async function getDeploymentRuntimeResponse(): Promise<DeploymentRuntimeResponse> {
  const checkedAt = new Date().toISOString()
  try {
    const token = (await readFile(`${SERVICE_ACCOUNT_PATH}/token`, 'utf8')).trim()
    const deployment = parseDeployment(
      await getKubernetesResource('/apis/apps/v1/namespaces/default/deployments/web-app', token),
    )
    const [podsResult, argoResult] = await Promise.allSettled([
      getKubernetesResource(
        `/api/v1/namespaces/default/pods?labelSelector=${encodeURIComponent(WEB_APP_LABEL_SELECTOR)}`,
        token,
      ),
      getKubernetesResource(
        '/apis/argoproj.io/v1alpha1/namespaces/argocd/applications/ddongmy-os',
        token,
      ),
    ])
    const k3sPodReady =
      podsResult.status === 'fulfilled'
        ? parseK3sStage(podsResult.value, deployment)
        : { status: 'unavailable' as const, startedAt: null, completedAt: null }
    const argoCd =
      argoResult.status === 'fulfilled'
        ? parseArgoCdStage(argoResult.value)
        : { status: 'unavailable' as const, startedAt: null, completedAt: null }
    const status =
      argoCd.status === 'failed' || k3sPodReady.status === 'failed'
        ? 'failed'
        : argoCd.status === 'success' && k3sPodReady.status === 'success'
          ? 'success'
          : 'running'

    return {
      status,
      checkedAt,
      commitSha: deployment.commitSha,
      stages: { argoCd, k3sPodReady },
    }
  } catch (error) {
    console.error(`[deployment-timeline] ${getFailureReason(error)}`)
    return { status: 'unavailable', checkedAt }
  }
}
