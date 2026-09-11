import { homelabChanges } from '../homelab-history'

export default function HomelabChangelogSection() {
  return (
    <section className="space-y-6" aria-labelledby="homelab-changelog-title">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">Changelog</p>
        <h2 id="homelab-changelog-title" className="text-3xl font-bold text-white">
          홈랩이 바뀐 과정
        </h2>
        <p className="max-w-3xl text-slate-300">
          도구 목록보다 어떤 운영 문제를 해결하며 구조가 변했는지 기록합니다.
        </p>
      </div>

      <ol className="relative space-y-6 border-l border-slate-700 pl-6">
        {homelabChanges.map((change) => (
          <li key={`${change.period}-${change.title}`} className="relative">
            <span className="absolute -left-[1.77rem] top-1.5 size-3 rounded-full border-2 border-slate-900 bg-primary-400" aria-hidden="true" />
            <time className="text-sm font-semibold text-primary-300">{change.period}</time>
            <h3 className="mt-1 text-lg font-bold text-white">{change.title}</h3>
            <p className="mt-2 max-w-3xl leading-relaxed text-slate-300">{change.summary}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
