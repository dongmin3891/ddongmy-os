import Link from 'next/link'
import { homelabIncidents } from '../homelab-history'

export default function IncidentLogSection() {
  return (
    <section className="space-y-6" aria-labelledby="incident-log-title">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">Incident Log</p>
        <h2 id="incident-log-title" className="text-3xl font-bold text-white">
          장애와 해결 기록
        </h2>
        <p className="max-w-3xl text-slate-300">
          증상에서 실제 원인까지 범위를 좁히고 운영 기준으로 남긴 사례입니다.
        </p>
      </div>

      <div className="space-y-4">
        {homelabIncidents.map((incident) => (
          <article key={incident.id} className="rounded-lg border border-slate-700 bg-slate-800 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-300">해결됨</span>
              <time dateTime={incident.occurredAt} className="text-sm text-slate-400">
                {incident.occurredAt}
              </time>
            </div>
            <h3 className="mt-4 text-xl font-bold text-white">{incident.title}</h3>
            <dl className="mt-5 grid gap-4 md:grid-cols-3">
              <div>
                <dt className="text-sm font-semibold text-slate-200">증상</dt>
                <dd className="mt-1 leading-relaxed text-slate-300">{incident.symptom}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-slate-200">실제 원인</dt>
                <dd className="mt-1 leading-relaxed text-slate-300">{incident.cause}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-slate-200">해결</dt>
                <dd className="mt-1 leading-relaxed text-slate-300">{incident.resolution}</dd>
              </div>
            </dl>
            <Link href={incident.developmentLogHref} className="mt-6 inline-flex font-semibold text-primary-300 hover:text-primary-200">
              자세한 장애 분석 읽기
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
