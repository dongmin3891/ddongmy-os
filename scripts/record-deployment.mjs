import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'

const HISTORY_PATH = new URL('../data/homelab/deployment-history.json', import.meta.url)
const MAX_HISTORY_DAYS = 90
const MAX_RECORDS = 500
const stageStatuses = new Set(['pending', 'running', 'success', 'failed', 'unavailable'])
const deploymentStatuses = new Set(['running', 'success', 'failed'])

const [commitSha, serviceName] = process.argv.slice(2)

if (!commitSha || !/^[a-f0-9]{40}$/.test(commitSha)) {
  throw new Error('A full lowercase commit SHA is required')
}

if (!serviceName || serviceName.length > 100) {
  throw new Error('A service name between 1 and 100 characters is required')
}

function readIsoDate(value, field, fallback = null) {
  if (!value) return fallback
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) throw new Error(`${field} must be an ISO date`)
  return parsed.toISOString()
}

function readStatus(value, allowed, field, fallback) {
  const status = value || fallback
  if (!allowed.has(status)) throw new Error(`${field} has an invalid status`)
  return status
}

function readStage(prefix, current = {}) {
  return {
    status: readStatus(
      process.env[`${prefix}_STATUS`],
      stageStatuses,
      prefix,
      current.status ?? 'unavailable',
    ),
    startedAt: readIsoDate(
      process.env[`${prefix}_STARTED_AT`],
      `${prefix}_STARTED_AT`,
      current.startedAt ?? null,
    ),
    completedAt: readIsoDate(
      process.env[`${prefix}_COMPLETED_AT`],
      `${prefix}_COMPLETED_AT`,
      current.completedAt ?? null,
    ),
  }
}

async function readRuntimeStages() {
  const path = process.env.DEPLOYMENT_RUNTIME_PATH
  if (!path) return undefined

  const runtime = JSON.parse(await readFile(path, 'utf8'))
  if (runtime.commitSha !== commitSha || !runtime.stages) {
    throw new Error('Runtime deployment status does not match the deployment')
  }

  return runtime.stages
}

const recordedAt = new Date().toISOString()
const cutoffTime = Date.parse(recordedAt) - MAX_HISTORY_DAYS * 24 * 60 * 60 * 1_000
const history = JSON.parse(await readFile(HISTORY_PATH, 'utf8'))

if (!Array.isArray(history)) throw new Error('Deployment history must be an array')

const existing = history.find(
  (event) => event?.commitSha === commitSha && event?.serviceName === serviceName,
)
const runtimeStages = await readRuntimeStages()
const stages = {
  githubPush: readStage('GITHUB_PUSH', existing?.stages?.githubPush),
  githubActions: readStage('GITHUB_ACTIONS', existing?.stages?.githubActions),
  ghcr: readStage('GHCR', existing?.stages?.ghcr),
  argoCd: runtimeStages?.argoCd ?? existing?.stages?.argoCd ?? readStage('ARGO_CD'),
  k3sPodReady:
    runtimeStages?.k3sPodReady ??
    existing?.stages?.k3sPodReady ??
    readStage('K3S_POD_READY'),
}
const deployedAt =
  stages.k3sPodReady.completedAt ??
  existing?.deployedAt ??
  stages.githubPush.startedAt ??
  recordedAt
const status = readStatus(
  process.env.DEPLOYMENT_STATUS,
  deploymentStatuses,
  'DEPLOYMENT_STATUS',
  existing?.status ?? 'running',
)
const nextEvent = { deployedAt, serviceName, commitSha, status, stages }
const recentHistory = history.filter((event) => {
  if (!event || typeof event !== 'object') return false
  if (event.commitSha === commitSha && event.serviceName === serviceName) return false
  return typeof event.deployedAt === 'string' && Date.parse(event.deployedAt) >= cutoffTime
})

await writeFile(
  HISTORY_PATH,
  `${JSON.stringify([nextEvent, ...recentHistory].slice(0, MAX_RECORDS), null, 2)}\n`,
)
