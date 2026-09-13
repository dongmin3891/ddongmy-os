import 'server-only'
import { cache } from 'react'
import { z } from 'zod'
import type { ServerMetricsStatus } from './server-metrics'

const NETDATA_REVALIDATE_SECONDS = 60
const NETDATA_TIMEOUT_MS = 2_000

const defaultChartIds = {
  cpu: 'system.cpu',
  memory: 'system.ram',
  rootDisk: 'disk_space._',
  uptime: 'system.uptime',
} as const

function getChartIds() {
  return {
    ...defaultChartIds,
    rootDisk: process.env.NETDATA_ROOT_DISK_CHART ?? defaultChartIds.rootDisk,
  }
}

const netdataChartSchema = z.object({
  labels: z.array(z.string()).min(2),
  data: z.array(z.array(z.number().nullable())).min(1),
})

type NetdataChartSample = {
  observedAt: string
  values: ReadonlyMap<string, number>
}

class NetdataResponseError extends Error {
  constructor(readonly status: number) {
    super(`Netdata request failed with status ${status}`)
  }
}

function getNetdataBaseUrl() {
  const value = process.env.NETDATA_BASE_URL
  if (!value) return undefined

  const url = new URL(value)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('NETDATA_BASE_URL must use HTTP or HTTPS')
  }

  return url
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch (cause) {
    throw new Error('Netdata returned an invalid JSON response', { cause })
  }
}

function toChartSample(body: unknown): NetdataChartSample {
  const chart = netdataChartSchema.parse(body)
  const latestValues = chart.data[0]

  if (latestValues.length !== chart.labels.length) {
    throw new Error('Netdata chart labels and values do not match')
  }

  const timestamp = latestValues[0]
  if (typeof timestamp !== 'number') {
    throw new Error('Netdata chart is missing its observation time')
  }

  const values = new Map<string, number>()
  chart.labels.slice(1).forEach((label, index) => {
    const value = latestValues[index + 1]
    if (typeof value === 'number' && Number.isFinite(value)) values.set(label, value)
  })

  return {
    observedAt: new Date(timestamp * 1_000).toISOString(),
    values,
  }
}

async function getLatestChart(baseUrl: URL, chart: string) {
  const url = new URL('/api/v1/data', baseUrl)
  url.searchParams.set('chart', chart)
  url.searchParams.set('after', '-60')
  url.searchParams.set('points', '1')
  url.searchParams.set('group', 'average')
  url.searchParams.set('format', 'json')

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: NETDATA_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(NETDATA_TIMEOUT_MS),
  })
  const body = await readJson(response)

  if (!response.ok) throw new NetdataResponseError(response.status)

  return toChartSample(body)
}

function getRequiredValue(sample: NetdataChartSample, dimension: string) {
  const value = sample.values.get(dimension)
  if (value === undefined) throw new Error(`Netdata chart is missing ${dimension}`)
  return value
}

function clampPercent(value: number) {
  return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10
}

function getUsedPercent(sample: NetdataChartSample) {
  const used = Math.max(0, getRequiredValue(sample, 'used'))
  const total = [...sample.values.values()].reduce((sum, value) => sum + Math.max(0, value), 0)

  if (total <= 0) throw new Error('Netdata chart has no usable capacity values')
  return clampPercent((used / total) * 100)
}

function getCpuUsagePercent(sample: NetdataChartSample) {
  const idle = sample.values.get('idle')
  if (idle !== undefined) return clampPercent(100 - idle)

  const usage = [...sample.values.entries()].reduce((total, [dimension, value]) => {
    if (dimension === 'guest' || dimension === 'guest_nice') return total
    return total + Math.max(0, value)
  }, 0)

  return clampPercent(usage)
}

async function getTemperatureCelsius(baseUrl: URL) {
  const temperatureChart = process.env.NETDATA_TEMPERATURE_CHART
  if (!temperatureChart) return null

  try {
    const sample = await getLatestChart(baseUrl, temperatureChart)
    const temperatures = [...sample.values.values()].filter(
      (value) => value >= -50 && value <= 200,
    )

    if (temperatures.length === 0) return null
    return Math.round(Math.max(...temperatures) * 10) / 10
  } catch (error) {
    console.error(`[netdata-temperature] ${getFailureReason(error)}`)
    return null
  }
}

function getFailureReason(error: unknown) {
  if (error instanceof NetdataResponseError) return `http-${error.status}`
  if (error instanceof z.ZodError) return 'invalid-response'
  if (error instanceof Error && error.name === 'TimeoutError') return 'timeout'
  return 'request-failed'
}

async function readServerMetrics(): Promise<ServerMetricsStatus> {
  const checkedAt = new Date().toISOString()

  try {
    const baseUrl = getNetdataBaseUrl()
    if (!baseUrl) return { status: 'unavailable', checkedAt }

    const chartIds = getChartIds()
    const [cpu, memory, rootDisk, uptime, temperatureCelsius] = await Promise.all([
      getLatestChart(baseUrl, chartIds.cpu),
      getLatestChart(baseUrl, chartIds.memory),
      getLatestChart(baseUrl, chartIds.rootDisk),
      getLatestChart(baseUrl, chartIds.uptime),
      getTemperatureCelsius(baseUrl),
    ])
    const observedAt = [cpu, memory, rootDisk, uptime]
      .map((sample) => sample.observedAt)
      .sort()[0]

    return {
      status: 'available',
      checkedAt,
      observedAt,
      data: {
        cpuUsagePercent: getCpuUsagePercent(cpu),
        memoryUsagePercent: getUsedPercent(memory),
        diskUsagePercent: getUsedPercent(rootDisk),
        temperatureCelsius,
        uptimeSeconds: Math.max(0, Math.round(getRequiredValue(uptime, 'uptime'))),
      },
    }
  } catch (error) {
    console.error(`[netdata-server-metrics] ${getFailureReason(error)}`)
    return { status: 'unavailable', checkedAt }
  }
}

export const getServerMetrics = cache(readServerMetrics)
