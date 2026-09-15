import Link from 'next/link'

const destinations = [
  {
    eyebrow: 'Development log',
    title: '결과보다 판단의 과정',
    description: '성능 개선, 장애 분석과 기술 선택에서 무엇을 확인하고 결정했는지 기록합니다.',
    href: '/log',
    linkLabel: '개발 기록 보기',
    detail: 'Improvement · Operations · Retrospective',
  },
  {
    eyebrow: 'Home lab',
    title: '서비스가 실행되는 곳',
    description: 'K3s, GitOps와 Cloudflare로 구성한 홈서버의 현재 상태와 구조를 공개합니다.',
    href: '/lab',
    linkLabel: '운영 대시보드 보기',
    detail: 'K3s · Argo CD · Cloudflare · R2',
  },
  {
    eyebrow: 'About',
    title: '만드는 사람에 대하여',
    description: '사용자 경험에서 운영까지 관심을 넓혀 온 경험과 사용하는 기술을 소개합니다.',
    href: '/about',
    linkLabel: '소개 보기',
    detail: 'Frontend · Product · Infrastructure',
  },
] as const

export default function ExploreSection() {
  return (
    <section className="space-y-6" aria-labelledby="explore-title">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
          Explore
        </p>
        <h2 id="explore-title" className="text-3xl font-bold text-white">
          더 살펴보기
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {destinations.map((destination) => (
          <article
            key={destination.href}
            className="group relative flex min-h-64 flex-col rounded-xl border border-slate-700 bg-slate-800/60 p-6 transition-colors hover:border-slate-500 hover:bg-slate-800 focus-within:ring-2 focus-within:ring-primary-400"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-400">
              {destination.eyebrow}
            </p>
            <h3 className="mt-4 text-xl font-bold text-white">
              <Link
                href={destination.href}
                className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
              >
                {destination.title}
              </Link>
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">
              {destination.description}
            </p>
            <p className="mt-6 border-t border-slate-700 pt-4 font-mono text-xs text-slate-500">
              {destination.detail}
            </p>
            <span className="mt-4 text-sm font-semibold text-primary-300" aria-hidden="true">
              {destination.linkLabel} →
            </span>
          </article>
        ))}
      </div>
    </section>
  )
}
