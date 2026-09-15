import Image from 'next/image'
import Link from 'next/link'

export default function HomelabArchitecturePanel() {
  return (
    <section
      className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800 lg:col-span-8 lg:row-span-2"
      aria-labelledby="architecture-panel-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 p-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Architecture
          </p>
          <h2 id="architecture-panel-title" className="mt-2 text-2xl font-bold text-white">
            코드가 홈서버에 도달하기까지
          </h2>
          <p className="mt-2 leading-relaxed text-slate-300">
            GitOps 배포, 사용자 요청, 콘텐츠와 운영 상태 조회 경계를 한 장에 정리했습니다.
          </p>
        </div>
        <Link
          href="/lab/architecture"
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-300"
        >
          상세 구조 보기
        </Link>
      </div>

      <Link
        href="/lab/architecture"
        aria-label="ddongmy 상세 아키텍처 보기"
        className="group block border-t border-slate-700 bg-slate-950 p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-primary-400"
      >
        <Image
          src="/diagrams/ddongmy-pipeline.svg"
          width={1600}
          height={1080}
          unoptimized
          alt="ddongmy의 코드 배포, 런타임 요청, 운영 상태 조회 파이프라인 개요"
          className="h-auto w-full rounded-lg transition-transform duration-300 group-hover:scale-[1.01]"
        />
      </Link>
    </section>
  )
}
