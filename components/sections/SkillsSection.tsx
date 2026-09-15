const skills = [
  {
    number: '01',
    category: 'Product Frontend',
    description: '사용자 흐름을 화면과 상태 모델로 구체화하고, 유지할 수 있는 구조로 구현합니다.',
    items: ['React', 'Next.js', 'TypeScript', 'TanStack Query', 'Tailwind CSS'],
  },
  {
    number: '02',
    category: 'Service Backend',
    description: '제품에 필요한 API와 데이터 경계를 직접 설계하며 프론트엔드와 연결합니다.',
    items: ['NestJS', 'PostgreSQL', 'Prisma', 'REST API', 'Object Storage'],
  },
  {
    number: '03',
    category: 'Delivery & Operations',
    description: '빌드부터 배포, 관찰과 복구까지 서비스가 지속해서 동작하는 환경을 만듭니다.',
    items: ['Docker', 'K3s', 'GitHub Actions', 'Argo CD', 'Cloudflare'],
  },
] as const

export default function SkillsSection() {
  return (
    <section id="skills" className="space-y-6" aria-labelledby="skills-title">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
          Capabilities
        </p>
        <h2 id="skills-title" className="text-3xl font-bold text-white">
          다루는 영역
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {skills.map((skill) => (
          <article
            key={skill.category}
            className="flex min-h-72 flex-col rounded-xl border border-slate-700 bg-slate-800/70 p-6"
          >
            <span className="font-mono text-xs font-semibold text-primary-300">{skill.number}</span>
            <h3 className="mt-5 text-xl font-bold text-white">{skill.category}</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">
              {skill.description}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${skill.category} 기술`}>
              {skill.items.map((item) => (
                <li
                  key={item}
                  className="rounded bg-slate-700 px-2.5 py-1 text-xs text-slate-300"
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
