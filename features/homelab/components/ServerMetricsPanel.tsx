import type { ServerMetricsStatus } from '../server-metrics'

type ServerMetricsPanelProps = {
  serverMetrics: ServerMetricsStatus
}

const checkedAtFormatter = new Intl.DateTimeFormat('ko-KR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Asia/Seoul',
})

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86_400)
  const hours = Math.floor((seconds % 86_400) / 3_600)

  if (days > 0) return `${days}일 ${hours}시간`

  const minutes = Math.floor((seconds % 3_600) / 60)
  return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`
}

type UsageCardProps = {
  label: string
  value: number
}

function UsageCard({ label, value }: UsageCardProps) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-5">
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-sm font-medium text-slate-400">{label}</dt>
        <dd className="text-xl font-bold text-white">{value.toFixed(1)}%</dd>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700" aria-hidden="true">
        <div className="h-full rounded-full bg-primary-400" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default function ServerMetricsPanel({ serverMetrics }: ServerMetricsPanelProps) {
  if (serverMetrics.status === 'unavailable') {
    return (
      <section className="space-y-4" aria-labelledby="server-metrics-title">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Home server
          </p>
          <h2 id="server-metrics-title" className="text-3xl font-bold text-white">
            서버 리소스
          </h2>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <p className="font-medium text-white">서버 지표를 확인할 수 없습니다</p>
          <p className="mt-2 text-sm text-slate-400">
            사이트는 정상적으로 응답하고 있으며 서버 지표만 일시적으로 사용할 수 없습니다.
          </p>
        </div>
      </section>
    )
  }

  const { data } = serverMetrics

  return (
    <section className="space-y-6" aria-labelledby="server-metrics-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Home server
          </p>
          <h2 id="server-metrics-title" className="text-3xl font-bold text-white">
            서버 리소스
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          확인{' '}
          <time dateTime={serverMetrics.checkedAt}>
            {checkedAtFormatter.format(new Date(serverMetrics.checkedAt))}
          </time>
        </p>
      </div>

      <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))] gap-4">
        <UsageCard label="CPU" value={data.cpuUsagePercent} />
        <UsageCard label="Memory" value={data.memoryUsagePercent} />
        <UsageCard label="Root disk" value={data.diskUsagePercent} />
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-5">
          <dt className="text-sm font-medium text-slate-400">Temperature</dt>
          <dd className="mt-3 text-xl font-bold text-white">
            {data.temperatureCelsius === null ? '센서 확인 불가' : `${data.temperatureCelsius}°C`}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-5">
          <dt className="text-sm font-medium text-slate-400">Uptime</dt>
          <dd className="mt-3 text-xl font-bold text-white">{formatUptime(data.uptimeSeconds)}</dd>
        </div>
      </dl>
    </section>
  )
}
