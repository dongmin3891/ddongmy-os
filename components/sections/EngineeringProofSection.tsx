import Link from 'next/link'
import LiveProductionCard from '@/features/homelab/components/LiveProductionCard'
import { measuredResults } from '@/features/profile/measured-results'

export default function EngineeringProofSection() {
  return (
    <section className="space-y-6" aria-labelledby="engineering-proof-title">
      <div className="max-w-3xl space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
          Engineering proof
        </p>
        <h2
          id="engineering-proof-title"
          className="text-2xl font-bold text-white sm:text-3xl"
        >
          운영과 개선, 숫자로 증명합니다
        </h2>
        <p className="leading-relaxed text-slate-400">
          실제 서비스의 상태를 관찰하고, 추측 대신 측정한 결과로 문제 해결의 효과를
          확인합니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <LiveProductionCard />

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {measuredResults.map((result, index) => (
            <Link
              key={result.label}
              href={result.logHref}
              className="group grid gap-4 rounded-xl border border-slate-700 bg-slate-800/70 p-5 transition-colors hover:border-primary-400/70 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-400 sm:block lg:grid lg:grid-cols-[2.5rem_minmax(9rem,0.55fr)_minmax(0,1fr)] lg:items-center lg:p-6"
            >
              <span className="hidden font-mono text-xs font-semibold text-primary-300 lg:block">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="font-mono text-xl font-bold tracking-tight text-primary-300 sm:text-2xl">
                  {result.value}
                </p>
                <h3 className="mt-2 text-sm font-bold text-white">{result.label}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{result.detail}</p>
              </div>
              <div className="sm:mt-4 lg:mt-0">
                <p className="text-sm leading-6 text-slate-400">{result.summary}</p>
                <span className="mt-3 inline-flex text-sm font-semibold text-primary-300 transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  개선 기록 읽기 →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-xs leading-relaxed text-slate-500">
        성능 수치는 개발 환경 Lighthouse 또는 동일 조건의 로컬 반복 요청에서 측정한
        결과입니다.
      </p>
    </section>
  )
}
