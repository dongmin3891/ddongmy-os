'use client'

import { useState } from 'react'
import type {
  DeploymentEvent,
  DeploymentStage,
  DeploymentStageStatus,
  DeploymentStatus,
} from '../deployment-event'
import { formatDeploymentDuration } from '../deployment-duration'

type DeployTimelineSectionProps = {
  deployments: DeploymentEvent[]
}

const stageDefinitions = [
  { key: 'githubPush', label: 'GitHub Push' },
  { key: 'githubActions', label: 'GitHub Actions' },
  { key: 'ghcr', label: 'GHCR' },
  { key: 'argoCd', label: 'Argo CD' },
  { key: 'k3sPodReady', label: 'K3s Pod Ready' },
] as const

const statusLabels: Record<DeploymentStageStatus | DeploymentStatus, string> = {
  pending: '대기 중',
  running: '진행 중',
  success: '성공',
  failed: '실패',
  unavailable: '수집 전',
}

const statusClasses: Record<DeploymentStageStatus | DeploymentStatus, string> = {
  pending: 'border-slate-600 bg-slate-700/60 text-slate-300',
  running: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  success: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  failed: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
  unavailable: 'border-slate-700 bg-slate-800 text-slate-400',
}

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Asia/Seoul',
})

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : '수집 전'
}

function getTotalDuration(deployment: DeploymentEvent) {
  return formatDeploymentDuration(
    deployment.stages.githubPush.startedAt,
    deployment.stages.k3sPodReady.completedAt,
  )
}

function StatusBadge({ status }: { status: DeploymentStageStatus | DeploymentStatus }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[status]}`}>
      {statusLabels[status]}
    </span>
  )
}

function StageTimelineItem({
  label,
  stage,
  isLast,
}: {
  label: string
  stage: DeploymentStage
  isLast: boolean
}) {
  const duration = formatDeploymentDuration(stage.startedAt, stage.completedAt)

  return (
    <li className="relative grid gap-3 pb-6 pl-9 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
      {!isLast && (
        <span className="absolute bottom-0 left-[0.69rem] top-5 border-l border-slate-700" aria-hidden="true" />
      )}
      <span
        className={`absolute left-0 top-1 size-6 rounded-full border-4 border-slate-900 ${
          stage.status === 'success'
            ? 'bg-emerald-400'
            : stage.status === 'failed'
              ? 'bg-rose-400'
              : stage.status === 'running'
                ? 'bg-sky-400'
                : 'bg-slate-600'
        }`}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-white">{label}</h3>
          <StatusBadge status={stage.status} />
        </div>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">시작</dt>
            <dd className="mt-1 text-slate-300">{formatDate(stage.startedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">완료</dt>
            <dd className="mt-1 text-slate-300">{formatDate(stage.completedAt)}</dd>
          </div>
        </dl>
      </div>
      <p className="font-mono text-sm text-slate-400 sm:pt-1">
        {duration ?? (stage.status === 'running' ? '측정 중' : '—')}
      </p>
    </li>
  )
}

export default function DeployTimelineSection({ deployments }: DeployTimelineSectionProps) {
  const [selectedDeploymentKey, setSelectedDeploymentKey] = useState(() => {
    const first = deployments[0]
    return first ? `${first.serviceName}:${first.commitSha}` : undefined
  })
  const selectedDeployment =
    deployments.find(
      (deployment) =>
        `${deployment.serviceName}:${deployment.commitSha}` === selectedDeploymentKey,
    ) ?? deployments[0]

  if (!selectedDeployment) {
    return (
      <section className="rounded-xl border border-slate-700 bg-slate-800 p-6" aria-labelledby="deploy-timeline-title">
        <h2 id="deploy-timeline-title" className="text-2xl font-bold text-white">Deploy Timeline</h2>
        <p className="mt-2 text-sm text-slate-400">아직 수집된 배포 기록이 없습니다.</p>
      </section>
    )
  }

  const totalDuration = getTotalDuration(selectedDeployment)

  return (
    <section className="space-y-5" aria-labelledby="deploy-timeline-title">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
          Deploy Timeline
        </p>
        <h2 id="deploy-timeline-title" className="mt-2 text-2xl font-bold text-white">
          배포가 서비스에 도달하기까지
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
          GitHub Push부터 K3s Pod Ready까지 실제로 수집된 단계와 소요시간입니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,2fr)]">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
          <h3 className="px-2 pb-3 text-sm font-semibold text-slate-300">최근 배포</h3>
          <ol className="flex snap-x gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
            {deployments.slice(0, 10).map((deployment) => {
              const key = `${deployment.serviceName}:${deployment.commitSha}`
              const isSelected = key === `${selectedDeployment.serviceName}:${selectedDeployment.commitSha}`
              return (
                <li key={key} className="min-w-56 snap-start lg:min-w-0">
                  <button
                    type="button"
                    className={`w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${
                      isSelected
                        ? 'border-primary-400/50 bg-primary-500/10'
                        : 'border-slate-700 bg-slate-900/60 hover:border-slate-600'
                    }`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedDeploymentKey(key)}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-mono text-sm font-semibold text-primary-300">
                        {deployment.commitSha.slice(0, 7)}
                      </span>
                      <StatusBadge status={deployment.status} />
                    </span>
                    <span className="mt-2 block text-sm text-slate-300">
                      {formatDate(deployment.deployedAt)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>

        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-700 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-mono text-lg font-bold text-white">
                  {selectedDeployment.commitSha.slice(0, 7)}
                </h3>
                <StatusBadge status={selectedDeployment.status} />
              </div>
              <p className="mt-2 break-all font-mono text-xs text-slate-500">
                {selectedDeployment.commitSha}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {selectedDeployment.serviceName} · {formatDate(selectedDeployment.deployedAt)}
              </p>
            </div>
            <div className="shrink-0 sm:text-right">
              <p className="text-xs text-slate-500">전체 배포 시간</p>
              <p className="mt-1 text-lg font-bold text-white">{totalDuration ?? '수집 전'}</p>
            </div>
          </div>

          <ol className="mt-6">
            {stageDefinitions.map((definition, index) => (
              <StageTimelineItem
                key={definition.key}
                label={definition.label}
                stage={selectedDeployment.stages[definition.key]}
                isLast={index === stageDefinitions.length - 1}
              />
            ))}
          </ol>
        </article>
      </div>
    </section>
  )
}
