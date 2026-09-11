import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="pb-8 pt-12 sm:pt-16">
      <div className="space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
          Frontend Developer · Homelab Operator
        </p>
        <h1 className="text-balance text-5xl font-bold lg:text-6xl">
          프론트엔드 개발자 <span className="text-primary-400">천재동민</span>
        </h1>
        <p className="max-w-3xl text-balance text-xl leading-relaxed text-slate-300 lg:text-2xl">
          일상의 문제를 제품으로 해결하고, 만든 서비스를 직접 운영하며 배운 것을 기록합니다.
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
          <Link
            href="/projects"
            className="rounded-lg bg-primary-500 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-600"
          >
            프로젝트 보기
          </Link>
          <Link
            href="/lab"
            className="rounded-lg bg-slate-700 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-600"
          >
            Home Lab 보기
          </Link>
        </div>
      </div>
    </section>
  )
}
