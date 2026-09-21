const workingPrinciples = [
  {
    number: '01',
    title: '사용자의 흐름부터 봅니다',
    description: '기능의 개수보다 사용자가 어디에서 막히고 무엇을 기대하는지 먼저 확인합니다.',
  },
  {
    number: '02',
    title: '추측을 증거로 바꿉니다',
    description: '성능 수치와 운영 로그를 확인하고, 재현할 수 있는 근거 위에서 해결책을 선택합니다.',
  },
  {
    number: '03',
    title: '배포 이후까지 책임집니다',
    description: '코드가 실제 환경에서 실행되고 관찰되며 안전하게 갱신되는 과정까지 설계합니다.',
  },
] as const

export default function AboutSection() {
  return (
    <section id="about" className="grid gap-4 lg:grid-cols-12" aria-labelledby="about-title">
      <article className="rounded-xl border border-slate-700 bg-slate-800/70 p-6 sm:p-8 lg:col-span-7">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
          How I work
        </p>
        <h2 id="about-title" className="mt-3 max-w-xl text-3xl font-bold leading-tight text-white">
          만드는 것과 운영하는 것을 따로 보지 않습니다
        </h2>
        <div className="mt-8 space-y-5 text-base leading-8 text-slate-300">
          <p>
            미디어·콘텐츠·물류·커머스 서비스에서 사용자가 직접 만나는 화면과 복잡한 상태
            흐름을 구현해 왔습니다. 동시에 느린 응답, 불안정한 데이터와 관찰하기 어려운
            장애도 결국 사용자 경험의 일부라고 생각합니다.
          </p>
          <p>
            그래서 Lighthouse와 실제 사용자 성능 데이터, 서버 메모리와 운영 로그를 근거로
            문제를 재현합니다. 개인 프로젝트에서도 구현에 멈추지 않고 직접 배포하고
            관찰하며, 해결한 과정과 선택의 이유를 다시 기록합니다.
          </p>
        </div>
        <blockquote className="mt-8 border-l-2 border-primary-400 pl-5 text-lg font-medium leading-relaxed text-slate-100">
          잘 동작하는 화면을 넘어, 오래 운영할 수 있는 제품을 만들고 싶습니다.
        </blockquote>
      </article>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 sm:p-8 lg:col-span-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
          Principles
        </p>
        <h2 className="mt-3 text-2xl font-bold text-white">일할 때 중요하게 보는 것</h2>
        <ol className="mt-7 divide-y divide-slate-700">
          {workingPrinciples.map((principle) => (
            <li key={principle.number} className="grid grid-cols-[2rem_1fr] gap-3 py-5 first:pt-0 last:pb-0">
              <span className="font-mono text-xs font-semibold text-primary-300">
                {principle.number}
              </span>
              <div>
                <h3 className="font-semibold text-white">{principle.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {principle.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
