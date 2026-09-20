import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'

const HISTORY_PATH = new URL('../k8s/deployment-history.json', import.meta.url)
const MAX_HISTORY_DAYS = 90

const [commitSha, serviceName] = process.argv.slice(2)

if (!commitSha || !/^[a-f0-9]{40}$/.test(commitSha)) {
  throw new Error('A full lowercase commit SHA is required')
}

if (!serviceName || serviceName.length > 100) {
  throw new Error('A service name between 1 and 100 characters is required')
}

const deployedAt = new Date().toISOString()
const cutoffTime = Date.parse(deployedAt) - MAX_HISTORY_DAYS * 24 * 60 * 60 * 1_000
const history = JSON.parse(await readFile(HISTORY_PATH, 'utf8'))

if (!Array.isArray(history)) throw new Error('Deployment history must be an array')

const recentHistory = history.filter((event) => {
  if (!event || typeof event !== 'object') return false
  if (event.commitSha === commitSha && event.serviceName === serviceName) return false
  return typeof event.deployedAt === 'string' && Date.parse(event.deployedAt) >= cutoffTime
})

const nextHistory = [{ deployedAt, serviceName, commitSha }, ...recentHistory].slice(0, 500)
await writeFile(HISTORY_PATH, `${JSON.stringify(nextHistory, null, 2)}\n`)
