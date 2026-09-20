'use client'

import { useState } from 'react'
import type { DeploymentEvent } from '../deployment-event'
import type {
  ServerMetricPoint,
  ServerMetricsHistoryStatus,
} from '../server-metrics-history'

type ServerHistorySectionProps = {
  history: ServerMetricsHistoryStatus
  deployments: DeploymentEvent[]
}

type HistoryRange = '24h' | '7d'

type MetricChartDefinition = {
  key:
    | 'cpuUsagePercent'
    | 'memoryUsagePercent'
    | 'diskUsagePercent'
    | 'temperatureCelsius'
  label: string
  unit: '%' | '°C'
  color: string
  fixedDomain?: readonly [number, number]
}

const RANGE_DURATION_MS: Record<HistoryRange, number> = {
  '24h': 24 * 60 * 60 * 1_000,
  '7d': 7 * 24 * 60 * 60 * 1_000,
}

const metricCharts: readonly MetricChartDefinition[] = [
  {
    key: 'cpuUsagePercent',
    label: 'CPU',
    unit: '%',
    color: '#38bdf8',
    fixedDomain: [0, 100],
  },
  {
    key: 'memoryUsagePercent',
    label: 'Memory',
    unit: '%',
    color: '#a78bfa',
    fixedDomain: [0, 100],
  },
  {
    key: 'diskUsagePercent',
    label: 'Disk',
    unit: '%',
    color: '#34d399',
    fixedDomain: [0, 100],
  },
  {
    key: 'temperatureCelsius',
    label: 'Temperature',
    unit: '°C',
    color: '#fb923c',
  },
]

const deploymentDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Seoul',
})

const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Seoul',
})

const dayFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'numeric',
  day: 'numeric',
  timeZone: 'Asia/Seoul',
})

function getVisibleStart(endsAt: string, range: HistoryRange) {
  return new Date(Date.parse(endsAt) - RANGE_DURATION_MS[range]).toISOString()
}

function getMetricDomain(
  points: readonly ServerMetricPoint[],
  fixedDomain?: readonly [number, number],
) {
  if (fixedDomain) return fixedDomain
  if (points.length === 0) return [0, 100] as const

  const values = points.map((point) => point.value)
  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  const padding = Math.max(2, (maximum - minimum) * 0.15)

  return [Math.floor(minimum - padding), Math.ceil(maximum + padding)] as const
}

function getAverage(points: readonly ServerMetricPoint[]) {
  if (points.length === 0) return null
  return points.reduce((total, point) => total + point.value, 0) / points.length
}

type MetricChartProps = {
  definition: MetricChartDefinition
  points: ServerMetricPoint[]
  deployments: DeploymentEvent[]
  startsAt: string
  endsAt: string
  range: HistoryRange
  onDeploymentSelect: (deployment: DeploymentEvent) => void
}

function MetricChart({
  definition,
  points,
  deployments,
  startsAt,
  endsAt,
  range,
  onDeploymentSelect,
}: MetricChartProps) {
  const width = 720
  const height = 210
  const plot = { left: 44, right: 704, top: 18, bottom: 170 }
  const startTime = Date.parse(startsAt)
  const endTime = Date.parse(endsAt)
  const duration = Math.max(1, endTime - startTime)
  const [domainMinimum, domainMaximum] = getMetricDomain(points, definition.fixedDomain)
  const domainSize = Math.max(1, domainMaximum - domainMinimum)
  const xForTime = (value: string) =>
    plot.left + ((Date.parse(value) - startTime) / duration) * (plot.right - plot.left)
  const yForValue = (value: number) =>
    plot.bottom - ((value - domainMinimum) / domainSize) * (plot.bottom - plot.top)
  const linePoints = points
    .map((point) => `${xForTime(point.observedAt)},${yForValue(point.value)}`)
    .join(' ')
  const average = getAverage(points)
  const rangeFormatter = range === '24h' ? timeFormatter : dayFormatter
  const middleAt = new Date(startTime + duration / 2).toISOString()

  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold text-white">{definition.label}</h3>
        <p className="text-xs text-slate-400">
          {average === null
            ? '표시할 데이터 없음'
            : `평균 ${average.toFixed(1)}${definition.unit}`}
        </p>
      </div>

      {points.length === 0 ? (
        <div className="mt-4 flex h-52 items-center justify-center rounded-lg bg-slate-950/60 px-4 text-center text-sm text-slate-400">
          선택한 범위에 수집된 {definition.label} 데이터가 없습니다.
        </div>
      ) : (
        <div
          className="mt-4"
          role="region"
          aria-label={`${definition.label} 그래프`}
        >
          <div className="relative w-full">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="h-auto w-full"
              role="img"
              aria-label={`${definition.label} 변화 그래프. 평균 ${average?.toFixed(1)}${definition.unit}`}
            >
              {[0, 0.5, 1].map((ratio) => {
                const y = plot.top + ratio * (plot.bottom - plot.top)
                const value = domainMaximum - ratio * domainSize
                return (
                  <g key={ratio}>
                    <line
                      x1={plot.left}
                      x2={plot.right}
                      y1={y}
                      y2={y}
                      stroke="#334155"
                      strokeDasharray="4 6"
                    />
                    <text x={plot.left - 8} y={y + 4} fill="#94a3b8" fontSize="11" textAnchor="end">
                      {value.toFixed(0)}
                    </text>
                  </g>
                )
              })}
              <polyline
                points={linePoints}
                fill="none"
                stroke={definition.color}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <text x={plot.left} y="198" fill="#94a3b8" fontSize="11">
                {rangeFormatter.format(new Date(startsAt))}
              </text>
              <text x={(plot.left + plot.right) / 2} y="198" fill="#94a3b8" fontSize="11" textAnchor="middle">
                {rangeFormatter.format(new Date(middleAt))}
              </text>
              <text x={plot.right} y="198" fill="#94a3b8" fontSize="11" textAnchor="end">
                {rangeFormatter.format(new Date(endsAt))}
              </text>
            </svg>

            {deployments.map((deployment) => {
              const left = (xForTime(deployment.deployedAt) / width) * 100
              return (
                <button
                  key={`${definition.key}-${deployment.serviceName}-${deployment.commitSha}`}
                  type="button"
                  className="group absolute w-6 -translate-x-1/2 focus-visible:outline-none"
                  style={{
                    left: `${left}%`,
                    top: `${(plot.top / height) * 100}%`,
                    height: `${((plot.bottom - plot.top) / height) * 100}%`,
                  }}
                  onClick={() => onDeploymentSelect(deployment)}
                  aria-label={`${deployment.serviceName} 배포 ${deployment.commitSha.slice(0, 7)} 상세 보기`}
                >
                  <span className="absolute left-1/2 top-0 h-full -translate-x-1/2 border-l border-dashed border-amber-300/80 group-hover:border-amber-200 group-focus-visible:border-amber-100" />
                  <span className="absolute left-1/2 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-900 bg-amber-300 ring-2 ring-amber-300/20 group-focus-visible:ring-4" />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </article>
  )
}

export default function ServerHistorySection({
  history,
  deployments,
}: ServerHistorySectionProps) {
  const [range, setRange] = useState<HistoryRange>('24h')
  const [selectedDeploymentKey, setSelectedDeploymentKey] = useState<string>()

  if (history.status === 'unavailable') {
    return (
      <section className="space-y-4" aria-labelledby="server-history-title">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Server history
          </p>
          <h2 id="server-history-title" className="mt-2 text-2xl font-bold text-white">
            서버 변화
          </h2>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <p className="font-medium text-white">히스토리를 확인할 수 없습니다</p>
          <p className="mt-2 text-sm text-slate-400">
            현재 상태와 기존 /lab 기능은 계속 사용할 수 있으며 Netdata 이력 조회만 일시적으로 실패했습니다.
          </p>
        </div>
      </section>
    )
  }

  const startsAt = getVisibleStart(history.data.endsAt, range)
  const visibleDeployments = deployments.filter(
    (deployment) =>
      deployment.deployedAt >= startsAt && deployment.deployedAt <= history.data.endsAt,
  )
  const selectedDeployment =
    visibleDeployments.find(
      (deployment) =>
        `${deployment.serviceName}:${deployment.commitSha}` === selectedDeploymentKey,
    ) ?? visibleDeployments[0]

  function changeRange(nextRange: HistoryRange) {
    setRange(nextRange)
    setSelectedDeploymentKey(undefined)
  }

  return (
    <section className="space-y-5" aria-labelledby="server-history-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Server history
          </p>
          <h2 id="server-history-title" className="mt-2 text-2xl font-bold text-white">
            서버 변화
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
            Netdata가 보관한 리소스 지표와 GitOps 배포 기록을 같은 시간축에서 확인합니다.
          </p>
        </div>

        <div className="inline-flex w-fit rounded-lg border border-slate-700 bg-slate-900 p-1" aria-label="조회 범위">
          {(['24h', '7d'] as const).map((option) => (
            <button
              key={option}
              type="button"
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${
                range === option
                  ? 'bg-primary-500 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              aria-pressed={range === option}
              onClick={() => changeRange(option)}
            >
              {option === '24h' ? '24시간' : '7일'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {metricCharts.map((definition) => (
          <MetricChart
            key={definition.key}
            definition={definition}
            points={history.data.series[definition.key].filter(
              (point) => point.observedAt >= startsAt && point.observedAt <= history.data.endsAt,
            )}
            deployments={visibleDeployments}
            startsAt={startsAt}
            endsAt={history.data.endsAt}
            range={range}
            onDeploymentSelect={(deployment) =>
              setSelectedDeploymentKey(`${deployment.serviceName}:${deployment.commitSha}`)
            }
          />
        ))}
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 sm:p-5" aria-live="polite">
        {selectedDeployment ? (
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">배포 시간</dt>
              <dd className="mt-1 text-sm text-slate-200">
                <time dateTime={selectedDeployment.deployedAt}>
                  {deploymentDateFormatter.format(new Date(selectedDeployment.deployedAt))}
                </time>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">서비스</dt>
              <dd className="mt-1 text-sm font-semibold text-white">{selectedDeployment.serviceName}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Commit SHA</dt>
              <dd className="mt-1 break-all font-mono text-sm text-primary-300">
                {selectedDeployment.commitSha}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-slate-400">
            그래프의 <span className="text-amber-300">배포 마커</span>를 선택하면 배포 시간,
            서비스명과 commit SHA를 확인할 수 있습니다.
            {visibleDeployments.length === 0 && ' 선택한 범위에는 기록된 배포가 없습니다.'}
          </p>
        )}
      </div>
    </section>
  )
}
