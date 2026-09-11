import type { PublicHomelabStatus } from '../homelab-status'
import { recentDeployments } from '../homelab-history'

type DeploymentHistorySectionProps = {
  homelabStatus: PublicHomelabStatus
}

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Seoul',
})

function formatDeploymentDate(value: string) {
  return dateFormatter.format(new Date(value))
}

export default function DeploymentHistorySection({ homelabStatus }: DeploymentHistorySectionProps) {
  const currentDeployment =
    homelabStatus.status === 'unavailable' || !homelabStatus.releaseSha || !homelabStatus.deployedAt
      ? undefined
      : {
          releaseSha: homelabStatus.releaseSha,
          deployedAt: homelabStatus.deployedAt,
          title: '현재 운영 버전',
          summary: `${homelabStatus.readyReplicas}/${homelabStatus.desiredReplicas} replicas가 준비된 상태입니다.`,
        }

  const deployments = currentDeployment
    ? [currentDeployment, ...recentDeployments.filter(({ releaseSha }) => releaseSha !== currentDeployment.releaseSha)]
    : recentDeployments

  return (
    <section className="space-y-6" aria-labelledby="deployment-history-title">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">Deployments</p>
        <h2 id="deployment-history-title" className="text-3xl font-bold text-white">
          최근 배포
        </h2>
        <p className="max-w-3xl text-slate-300">
          현재 Kubernetes release와 운영 방식이 바뀐 주요 배포를 함께 보여줍니다.
        </p>
      </div>

      <ol className="grid gap-4 md:grid-cols-2">
        {deployments.map((deployment, index) => (
          <li key={deployment.releaseSha} className="rounded-lg border border-slate-700 bg-slate-800 p-5">
            <div className="flex items-center justify-between gap-4">
              <a
                href={`https://github.com/dongmin3891/ddongmy-os/commit/${deployment.releaseSha}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-sm font-semibold text-primary-300 hover:text-primary-200"
                aria-label={`${deployment.releaseSha} 커밋 보기`}
              >
                {deployment.releaseSha}
              </a>
              <span className="text-xs font-medium text-slate-400">{index === 0 && currentDeployment ? '현재' : '배포 완료'}</span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">{deployment.title}</h3>
            <p className="mt-2 leading-relaxed text-slate-300">{deployment.summary}</p>
            <time dateTime={deployment.deployedAt} className="mt-4 block text-sm text-slate-400">
              {formatDeploymentDate(deployment.deployedAt)}
            </time>
          </li>
        ))}
      </ol>
    </section>
  )
}
