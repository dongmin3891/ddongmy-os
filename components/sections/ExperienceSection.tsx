const experienceHighlights = [
  {
    period: '2025.09 - 현재',
    title: 'U+tv모바일 차세대 서비스',
    description:
      'Pages Router 기반 서비스를 Next.js 16, React 19와 App Router 구조로 전환하며 SSR 데이터와 화면 조합, Native 연동의 책임을 정리했습니다.',
  },
  {
    period: '2022.05 - 2026.04',
    title: 'U+ 미디어 서비스 운영과 고도화',
    description:
      '웹과 WebView의 콘텐츠 탐색·재생·결제 흐름을 개발하고, SSR·Hydration·이미지 요청과 메모리 생명주기를 분석해 성능과 운영 안정성을 개선했습니다.',
  },
  {
    period: '2021.06 - 현재',
    title: '여러 제품 도메인의 문제 해결',
    description:
      '미디어를 중심으로 물류 배차, 교육 콘텐츠·커머스와 AI 학습 서비스까지 사용자와 운영자 화면의 복잡한 상태와 업무 흐름을 제품으로 구현했습니다.',
  },
] as const

const measuredResults = [
  {
    value: '34 → 84',
    label: 'Lighthouse Performance',
    detail: '기존 U+모아tv 개발 환경',
  },
  {
    value: '12.2s → 1.3s',
    label: 'LCP',
    detail: '핵심 패널과 이미지 요청 개선',
  },
  {
    value: '155MB → 93MB',
    label: 'Node.js heapUsed',
    detail: '동일한 로컬 반복 요청 기준',
  },
] as const

export default function ExperienceSection() {
  return (
    <section className="space-y-6" aria-labelledby="experience-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Experience
          </p>
          <h2 id="experience-title" className="text-3xl font-bold text-white">
            상용 서비스에서 검증한 경험
          </h2>
        </div>
        <a
          href="/documents/career-profile.pdf"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="경력기술서 보기 (새 탭)"
          className="inline-flex w-fit items-center rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-primary-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-400"
        >
          경력기술서 보기&nbsp;↗
        </a>
      </div>

      <article className="grid gap-8 rounded-xl border border-slate-700 bg-slate-800/70 p-6 sm:p-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <header>
          <p className="font-mono text-sm font-semibold text-primary-300">2021.06 - 현재</p>
          <h3 className="mt-3 text-2xl font-bold text-white">KIINS</h3>
          <p className="mt-1 font-medium text-slate-300">Frontend Engineer</p>
          <p className="mt-5 text-sm leading-7 text-slate-400">
            약 5년간 React·Next.js 기반 상용 웹과 WebView 서비스를 개발하고 운영했습니다.
            화면 구현에 머무르지 않고 SSR, 데이터 캐싱, Core Web Vitals와 Node.js 서버
            장애까지 실제 사용자와 운영 환경에서 발생하는 문제를 다뤘습니다.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="경험한 제품 영역">
            {['미디어', '콘텐츠', '물류', '커머스', 'AI 학습'].map((domain) => (
              <li
                key={domain}
                className="rounded-full border border-slate-600 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300"
              >
                {domain}
              </li>
            ))}
          </ul>
        </header>

        <ol className="divide-y divide-slate-700">
          {experienceHighlights.map((experience, index) => (
            <li
              key={`${experience.period}-${experience.title}`}
              className="grid gap-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-[2.5rem_1fr]"
            >
              <span className="font-mono text-xs font-semibold text-primary-300">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="font-mono text-xs text-slate-500">{experience.period}</p>
                <h4 className="mt-1 font-bold text-white">{experience.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {experience.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </article>

      <div className="grid gap-4 md:grid-cols-3" aria-label="대표 성과">
        {measuredResults.map((result) => (
          <article
            key={result.label}
            className="rounded-xl border border-slate-700 bg-slate-900 p-6"
          >
            <p className="font-mono text-2xl font-bold text-primary-300">{result.value}</p>
            <h3 className="mt-3 font-bold text-white">{result.label}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{result.detail}</p>
          </article>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-slate-500">
        성능 수치는 개발 환경 Lighthouse 또는 동일 조건의 로컬 반복 요청에서 측정한
        결과입니다. 측정 환경이 다른 수치를 서로 직접 비교하지 않았습니다.
      </p>
    </section>
  )
}
