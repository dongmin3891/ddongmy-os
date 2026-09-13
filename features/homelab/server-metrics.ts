import type { HomelabSourceStatus } from './homelab-source-status'

export type ServerMetrics = {
  cpuUsagePercent: number
  memoryUsagePercent: number
  diskUsagePercent: number
  temperatureCelsius: number | null
  uptimeSeconds: number
}

export type ServerMetricsStatus = HomelabSourceStatus<ServerMetrics>
