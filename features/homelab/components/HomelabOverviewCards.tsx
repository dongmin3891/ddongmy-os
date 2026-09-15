import type { PublicHomelabStatus } from '../homelab-status'
import type { ServerMetricsStatus } from '../server-metrics'

type HomelabOverviewCardsProps = {
  homelabStatus: PublicHomelabStatus
  serverMetrics: ServerMetricsStatus
}

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Seoul',
})

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : '확인 불가'
}

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86_400)
  const hours = Math.floor((seconds % 86_400) / 3_600)

  if (days > 0) return `${days}일 ${hours}시간`

  const minutes = Math.floor((seconds % 3_600) / 60)
  return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`
}

type MetricBarProps = {
  label: string
  value: number
}

function MetricBar({ label, value }: MetricBarProps) {
  const safeValue = Math.min(100, Math.max(0, value))

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <dt className="text-slate-400">{label}</dt>
        <dd className="font-semibold text-slate-200">{value.toFixed(1)}%</dd>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700" aria-hidden="true">
        <div className="h-full rounded-full bg-primary-400" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  )
}

export default function HomelabOverviewCards({
  homelabStatus,
  serverMetrics,
}: HomelabOverviewCardsProps) {
  const hasHomelabStatus = homelabStatus.status !== 'unavailable'
  const hasServerMetrics = serverMetrics.status !== 'unavailable'
  const isHealthy = hasHomelabStatus && homelabStatus.status === 'healthy'

  return (
    <section className="space-y-4" aria-labelledby="lab-overview-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Live overview
          </p>
          <h2 id="lab-overview-title" className="mt-2 text-2xl font-bold text-white">
            지금 운영 상태
          </h2>
        </div>
        <p className="w-full text-xs text-slate-500 sm:w-auto">
          상태와 서버 지표는 독립적으로 조회됩니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <article
          className={`rounded-xl border p-4 sm:p-5 ${
            isHealthy
              ? 'border-emerald-500/30 bg-emerald-500/10'
              : hasHomelabStatus
                ? 'border-amber-400/30 bg-amber-400/10'
                : 'border-slate-700 bg-slate-800'
          }`}
        >
          <p className="text-sm font-medium text-slate-300">Service</p>
          <div className="mt-3 flex items-center gap-3">
            <span
              className={`size-2.5 rounded-full ${
                isHealthy ? 'bg-emerald-400' : hasHomelabStatus ? 'bg-amber-300' : 'bg-slate-500'
              }`}
              aria-hidden="true"
            />
            <h3 className="text-lg font-bold text-white sm:text-xl">
              {isHealthy ? '정상 운영 중' : hasHomelabStatus ? '확인 필요' : '확인 불가'}
            </h3>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            {hasHomelabStatus
              ? `${homelabStatus.readyReplicas}/${homelabStatus.desiredReplicas} replicas ready`
              : '사이트는 응답 중입니다.'}
          </p>
        </article>

        <article className="rounded-xl border border-slate-700 bg-slate-800 p-4 sm:p-5">
          <p className="text-sm text-slate-400">Current release</p>
          <p className="mt-3 break-all font-mono text-lg font-bold text-white sm:text-2xl">
            {hasHomelabStatus ? (homelabStatus.releaseSha ?? 'unknown') : 'unavailable'}
          </p>
          <p className="mt-3 text-sm text-slate-400">
            배포 {hasHomelabStatus ? formatDate(homelabStatus.deployedAt) : '확인 불가'}
          </p>
        </article>

        <article className="rounded-xl border border-slate-700 bg-slate-800 p-4 sm:p-5">
          <p className="text-sm text-slate-400">Home server</p>
          <p className="mt-3 text-lg font-bold text-white sm:text-xl">
            {hasServerMetrics ? formatUptime(serverMetrics.data.uptimeSeconds) : '지표 확인 불가'}
          </p>
          <p className="mt-3 text-sm text-slate-400">
            Uptime ·{' '}
            {hasServerMetrics && serverMetrics.data.temperatureCelsius !== null
              ? `${serverMetrics.data.temperatureCelsius}°C`
              : '온도 센서 확인 불가'}
          </p>
        </article>

        <article className="rounded-xl border border-slate-700 bg-slate-800 p-4 sm:p-5">
          <h3 className="text-sm font-medium text-slate-300">Resources</h3>
          {hasServerMetrics ? (
            <dl className="mt-4 space-y-3">
              <MetricBar label="CPU" value={serverMetrics.data.cpuUsagePercent} />
              <MetricBar label="Memory" value={serverMetrics.data.memoryUsagePercent} />
              <MetricBar label="Disk" value={serverMetrics.data.diskUsagePercent} />
            </dl>
          ) : (
            <p className="mt-4 text-sm text-slate-400">서버 지표를 일시적으로 사용할 수 없습니다.</p>
          )}
        </article>
      </div>
    </section>
  )
}
