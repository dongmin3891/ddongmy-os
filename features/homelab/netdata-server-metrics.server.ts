import 'server-only'
import { cache } from 'react'
import { z } from 'zod'
import type {
  ServerMetricPoint,
  ServerMetricsHistoryStatus,
} from './server-metrics-history'
import type { ServerMetricsStatus } from './server-metrics'

const NETDATA_REVALIDATE_SECONDS = 60
const NETDATA_TIMEOUT_MS = 2_000
const NETDATA_HISTORY_TIMEOUT_MS = 5_000
const HISTORY_DURATION_SECONDS = 7 * 24 * 60 * 60
const HISTORY_POINTS = 672

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

export function parseNetdataChart(body: unknown): NetdataChartSample[] {
  const chart = netdataChartSchema.parse(body)

  return chart.data
    .map((row) => {
      if (row.length !== chart.labels.length) {
        throw new Error('Netdata chart labels and values do not match')
      }

      const timestamp = row[0]
      if (typeof timestamp !== 'number') {
        throw new Error('Netdata chart is missing its observation time')
      }

      const values = new Map<string, number>()
      chart.labels.slice(1).forEach((label, index) => {
        const value = row[index + 1]
        if (typeof value === 'number' && Number.isFinite(value)) values.set(label, value)
      })

      return {
        observedAt: new Date(timestamp * 1_000).toISOString(),
        values,
      }
    })
    .sort((left, right) => left.observedAt.localeCompare(right.observedAt))
}

type GetChartOptions = {
  durationSeconds: number
  points: number
  timeoutMs: number
}

async function getChart(baseUrl: URL, chart: string, options: GetChartOptions) {
  const url = new URL('/api/v1/data', baseUrl)
  url.searchParams.set('chart', chart)
  url.searchParams.set('after', `-${options.durationSeconds}`)
  url.searchParams.set('points', String(options.points))
  url.searchParams.set('group', 'average')
  url.searchParams.set('format', 'json')

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: NETDATA_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(options.timeoutMs),
  })
  if (!response.ok) throw new NetdataResponseError(response.status)

  return parseNetdataChart(await readJson(response))
}

async function getLatestChart(baseUrl: URL, chart: string) {
  const samples = await getChart(baseUrl, chart, {
    durationSeconds: 60,
    points: 1,
    timeoutMs: NETDATA_TIMEOUT_MS,
  })

  const latestSample = samples.at(-1)
  if (!latestSample) throw new Error('Netdata chart has no samples')
  return latestSample
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

function toMetricPoints(
  samples: readonly NetdataChartSample[],
  getValue: (sample: NetdataChartSample) => number,
): ServerMetricPoint[] {
  return samples.map((sample) => ({
    observedAt: sample.observedAt,
    value: getValue(sample),
  }))
}

function getTemperatureValue(sample: NetdataChartSample) {
  const temperatures = [...sample.values.values()].filter(
    (value) => value >= -50 && value <= 200,
  )

  if (temperatures.length === 0) throw new Error('Netdata temperature chart has no sensor values')
  return Math.round(Math.max(...temperatures) * 10) / 10
}

async function getTemperatureCelsius(baseUrl: URL) {
  const temperatureChart = process.env.NETDATA_TEMPERATURE_CHART
  if (!temperatureChart) return null

  try {
    const sample = await getLatestChart(baseUrl, temperatureChart)
    return getTemperatureValue(sample)
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

async function getTemperatureHistory(baseUrl: URL, startsAt: string) {
  const temperatureChart = process.env.NETDATA_TEMPERATURE_CHART
  if (!temperatureChart) return []

  try {
    const samples = await getChart(baseUrl, temperatureChart, {
      durationSeconds: HISTORY_DURATION_SECONDS,
      points: HISTORY_POINTS,
      timeoutMs: NETDATA_HISTORY_TIMEOUT_MS,
    })

    return toMetricPoints(samples, getTemperatureValue).filter(
      (point) => point.observedAt >= startsAt,
    )
  } catch (error) {
    console.error(`[netdata-temperature-history] ${getFailureReason(error)}`)
    return []
  }
}

async function readServerMetricsHistory(): Promise<ServerMetricsHistoryStatus> {
  const checkedAt = new Date().toISOString()
  const startsAt = new Date(
    Date.parse(checkedAt) - HISTORY_DURATION_SECONDS * 1_000,
  ).toISOString()

  try {
    const baseUrl = getNetdataBaseUrl()
    if (!baseUrl) return { status: 'unavailable', checkedAt }

    const chartIds = getChartIds()
    const historyOptions = {
      durationSeconds: HISTORY_DURATION_SECONDS,
      points: HISTORY_POINTS,
      timeoutMs: NETDATA_HISTORY_TIMEOUT_MS,
    }
    const [cpu, memory, rootDisk, temperatureCelsius] = await Promise.all([
      getChart(baseUrl, chartIds.cpu, historyOptions),
      getChart(baseUrl, chartIds.memory, historyOptions),
      getChart(baseUrl, chartIds.rootDisk, historyOptions),
      getTemperatureHistory(baseUrl, startsAt),
    ])
    const observedAt = [cpu.at(-1), memory.at(-1), rootDisk.at(-1)]
      .map((sample) => sample?.observedAt)
      .filter((value): value is string => value !== undefined)
      .sort()
      .at(-1)

    if (!observedAt) throw new Error('Netdata history has no samples')

    return {
      status: 'available',
      checkedAt,
      observedAt,
      data: {
        startsAt,
        endsAt: checkedAt,
        series: {
          cpuUsagePercent: toMetricPoints(cpu, getCpuUsagePercent),
          memoryUsagePercent: toMetricPoints(memory, getUsedPercent),
          diskUsagePercent: toMetricPoints(rootDisk, getUsedPercent),
          temperatureCelsius,
        },
      },
    }
  } catch (error) {
    console.error(`[netdata-server-metrics-history] ${getFailureReason(error)}`)
    return { status: 'unavailable', checkedAt }
  }
}

export const getServerMetrics = cache(readServerMetrics)
export const getServerMetricsHistory = cache(readServerMetricsHistory)
