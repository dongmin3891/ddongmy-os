import Link from 'next/link'
import TrafficSummary from '@/features/traffic/components/TrafficSummary'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 px-6 py-8 sm:px-10 sm:py-12">
      <div
        className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-primary-500/15 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-end">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Frontend Developer · Service Operator
          </p>
          <h1 className="max-w-3xl text-balance text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            제품을 만들고,
            <br />
            <span className="text-primary-400">끝까지 운영합니다.</span>
          </h1>
          <p className="max-w-2xl text-balance text-lg leading-relaxed text-slate-300 sm:text-xl">
            사용자 경험을 구현하고, 배포 이후의 성능과 장애까지 직접 관찰하며 개선합니다.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="#selected-work"
              className="rounded-lg bg-primary-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-400"
            >
              대표 프로젝트
            </Link>
            <Link
              href="/log"
              className="rounded-lg border border-slate-600 bg-slate-800/80 px-5 py-3 font-semibold text-slate-100 transition-colors hover:border-slate-500 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-400"
            >
              개발 기록 읽기
            </Link>
          </div>
        </div>

        <aside
          className="rounded-xl border border-slate-700 bg-slate-950/70 p-5"
          aria-label="대표 프로젝트"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Featured project
            </p>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
              Live
            </span>
          </div>
          <h2 className="mt-5 text-2xl font-bold text-white">ddongmy-os</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            포트폴리오와 개발 기록을 직접 배포하고 관찰하며 개선하는 현재 이 사이트입니다.
          </p>
          <ul
            className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300"
            aria-label="ddongmy-os 기술"
          >
            {['Next.js', 'K3s', 'Argo CD', 'Cloudflare'].map((technology) => (
              <li key={technology} className="rounded-full border border-slate-700 px-2.5 py-1">
                {technology}
              </li>
            ))}
          </ul>
          <TrafficSummary />
          <Link
            href="/lab"
            className="mt-6 inline-flex font-semibold text-primary-300 hover:text-primary-200"
          >
            Home Lab 보기 →
          </Link>
        </aside>
      </div>
    </section>
  )
}
