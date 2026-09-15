import Link from 'next/link'
import type { PublicHomelabStatus } from '../homelab-status'
import { homelabChanges, homelabIncidents, recentDeployments } from '../homelab-history'

type HomelabActivityGridProps = {
  homelabStatus: PublicHomelabStatus
}

const requestPath = ['Internet', 'Cloudflare', 'K3s', 'Traefik', 'Ingress', 'Service', 'Next.js']

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Seoul',
})

function getDeployments(homelabStatus: PublicHomelabStatus) {
  if (
    homelabStatus.status === 'unavailable' ||
    !homelabStatus.releaseSha ||
    !homelabStatus.deployedAt
  ) {
    return recentDeployments.slice(0, 2)
  }

  return [
    {
      releaseSha: homelabStatus.releaseSha,
      deployedAt: homelabStatus.deployedAt,
      title: '현재 운영 버전',
      summary: `${homelabStatus.readyReplicas}/${homelabStatus.desiredReplicas} replicas ready`,
    },
    ...recentDeployments.filter(({ releaseSha }) => releaseSha !== homelabStatus.releaseSha),
  ].slice(0, 2)
}

export default function HomelabActivityGrid({ homelabStatus }: HomelabActivityGridProps) {
  const deployments = getDeployments(homelabStatus)
  const latestIncident = homelabIncidents[0]

  return (
    <>
      <section
        className="rounded-xl border border-slate-700 bg-slate-800 p-6 lg:col-span-4"
        aria-labelledby="request-path-title"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
          Request path
        </p>
        <h2 id="request-path-title" className="mt-2 text-xl font-bold text-white">
          이 페이지가 도달한 경로
        </h2>
        <ol className="mt-5 flex flex-wrap gap-2">
          {requestPath.map((step, index) => (
            <li
              key={step}
              className="rounded-full border border-slate-600 bg-slate-900 px-3 py-1.5 text-xs text-slate-300"
            >
              <span className="mr-1.5 font-mono text-primary-300">{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section
        className="rounded-xl border border-slate-700 bg-slate-800 p-6 lg:col-span-4"
        aria-labelledby="recent-deployments-title"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
          Deployments
        </p>
        <h2 id="recent-deployments-title" className="mt-2 text-xl font-bold text-white">
          최근 배포
        </h2>
        <ol className="mt-5 divide-y divide-slate-700">
          {deployments.map((deployment) => (
            <li key={deployment.releaseSha} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-4">
                <a
                  href={`https://github.com/dongmin3891/ddongmy-os/commit/${deployment.releaseSha}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-sm font-semibold text-primary-300 hover:text-primary-200"
                >
                  {deployment.releaseSha}
                </a>
                <time className="text-xs text-slate-500" dateTime={deployment.deployedAt}>
                  {dateFormatter.format(new Date(deployment.deployedAt))}
                </time>
              </div>
              <p className="mt-1 text-sm font-medium text-white">{deployment.title}</p>
            </li>
          ))}
        </ol>
      </section>

      {latestIncident && (
        <section
          className="rounded-xl border border-slate-700 bg-slate-800 p-6 lg:col-span-6"
          aria-labelledby="latest-incident-title"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
              Latest incident
            </p>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
              해결됨
            </span>
          </div>
          <h2 id="latest-incident-title" className="mt-3 text-xl font-bold text-white">
            {latestIncident.title}
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">{latestIncident.resolution}</p>
          <Link
            href={latestIncident.developmentLogHref}
            className="mt-5 inline-flex font-semibold text-primary-300 hover:text-primary-200"
          >
            장애 분석 읽기
          </Link>
        </section>
      )}

      <section
        className="rounded-xl border border-slate-700 bg-slate-800 p-6 lg:col-span-6"
        aria-labelledby="recent-changes-title"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
          Recent changes
        </p>
        <h2 id="recent-changes-title" className="mt-2 text-xl font-bold text-white">
          홈랩이 바뀐 과정
        </h2>
        <ol className="mt-5 space-y-4">
          {homelabChanges.slice(-3).reverse().map((change) => (
            <li key={`${change.period}-${change.title}`} className="flex gap-4">
              <time className="shrink-0 font-mono text-xs text-primary-300">{change.period}</time>
              <div>
                <h3 className="text-sm font-semibold text-white">{change.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{change.summary}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
