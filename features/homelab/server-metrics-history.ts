import type { HomelabSourceStatus } from './homelab-source-status'

export type ServerMetricPoint = {
  observedAt: string
  value: number
}

export type ServerMetricsHistory = {
  startsAt: string
  endsAt: string
  series: {
    cpuUsagePercent: ServerMetricPoint[]
    memoryUsagePercent: ServerMetricPoint[]
    diskUsagePercent: ServerMetricPoint[]
    temperatureCelsius: ServerMetricPoint[]
  }
}

export type ServerMetricsHistoryStatus = HomelabSourceStatus<ServerMetricsHistory>
