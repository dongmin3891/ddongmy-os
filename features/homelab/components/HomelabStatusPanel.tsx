import type { PublicHomelabStatus } from '../homelab-status'

type HomelabStatusPanelProps = {
  homelabStatus: PublicHomelabStatus
}

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Seoul',
})

function formatDate(value: string | null) {
  if (!value) return '확인할 수 없음'
  return dateFormatter.format(new Date(value))
}

export default function HomelabStatusPanel({ homelabStatus }: HomelabStatusPanelProps) {
  if (homelabStatus.status === 'unavailable') {
    return (
      <section
        className="rounded-lg border border-slate-700 bg-slate-800 p-6"
        aria-labelledby="lab-status-title"
      >
        <p className="text-sm font-medium text-slate-400">Live status</p>
        <h2 id="lab-status-title" className="mt-2 text-2xl font-bold text-white">
          상태를 확인할 수 없습니다
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          사이트는 응답하고 있지만 Kubernetes의 공개 상태 데이터를 가져오지 못했습니다.
        </p>
      </section>
    )
  }

  const isHealthy = homelabStatus.status === 'healthy'

  return (
    <section className="grid gap-6 md:grid-cols-3" aria-labelledby="lab-status-title">
      <div
        className={`rounded-lg border p-6 md:col-span-2 ${
          isHealthy
            ? 'border-green-500/30 bg-green-500/10'
            : 'border-amber-400/30 bg-amber-400/10'
        }`}
      >
        <p className={`text-sm font-medium ${isHealthy ? 'text-green-300' : 'text-amber-300'}`}>
          Live status
        </p>
        <h2 id="lab-status-title" className="mt-2 text-2xl font-bold text-white">
          {isHealthy ? '정상 운영 중' : '일부 인스턴스 확인 필요'}
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          {homelabStatus.readyReplicas}/{homelabStatus.desiredReplicas} replicas ready
        </p>
      </div>
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
        <p className="text-sm text-slate-400">Current release</p>
        <p className="mt-2 font-mono text-xl font-bold text-white">
          {homelabStatus.releaseSha ?? 'unknown'}
        </p>
        <p className="mt-2 text-sm text-slate-300">
          배포 {formatDate(homelabStatus.deployedAt)}
        </p>
      </div>
    </section>
  )
}
