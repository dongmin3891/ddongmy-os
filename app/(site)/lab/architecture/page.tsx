import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PageIntro from '@/components/site/PageIntro'

export const metadata: Metadata = {
  title: 'Home Lab Architecture',
  description: 'ddongmy.com의 GitOps 배포와 K3s 내부 리소스, 네트워크 및 권한 경계입니다.',
  alternates: { canonical: '/lab/architecture' },
}

export default function HomelabArchitecturePage() {
  return (
    <div className="space-y-8">
      <Link
        href="/lab"
        className="inline-flex rounded-sm text-sm font-semibold text-primary-300 hover:text-primary-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-400"
      >
        ← Home Lab으로 돌아가기
      </Link>

      <PageIntro
        eyebrow="Home Lab Architecture"
        title="K3s 안에서는 어떻게 동작할까"
        description="배포 자동화부터 Ingress, Service, Pod, Secret, NetworkPolicy와 최소 RBAC까지 실제 운영 경계를 펼쳐 봅니다."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          작은 화면에서는 다이어그램을 좌우로 움직여 확인할 수 있습니다.
        </p>
        <a
          href="/diagrams/ddongmy-architecture-detailed.svg"
          download
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-primary-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-400"
        >
          SVG 원본 받기
        </a>
      </div>

      <figure className="relative left-1/2 w-[calc(100vw-2rem)] max-w-[100rem] -translate-x-1/2 overflow-x-auto rounded-xl border border-slate-700 bg-slate-950 p-2 sm:p-4">
        <Image
          src="/diagrams/ddongmy-architecture-detailed.svg"
          width={1800}
          height={1280}
          unoptimized
          preload
          alt="GitHub Actions와 Argo CD 배포 흐름, K3s 내부의 Traefik, Ingress, Service, Next.js Pods, Secret, status-exporter, NetworkPolicy와 RBAC를 표현한 ddongmy 상세 아키텍처"
          className="h-auto min-w-[72rem] max-w-none rounded-lg lg:min-w-0 lg:w-full"
        />
        <figcaption className="sr-only">
          ddongmy.com의 코드 배포, 사용자 요청, 콘텐츠 처리와 Kubernetes 상태 조회 구조
        </figcaption>
      </figure>

      <section className="grid gap-4 md:grid-cols-3" aria-label="아키텍처 핵심 설계">
        <article className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="font-bold text-white">GitOps deployment</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            main push 이후 이미지와 manifest의 commit SHA가 함께 배포 상태를 결정합니다.
          </p>
        </article>
        <article className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="font-bold text-white">Separated delivery</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            페이지 요청과 CDN 이미지 요청을 분리해 사용자 경로에서 이미지 가공을 제거했습니다.
          </p>
        </article>
        <article className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="font-bold text-white">Minimum privilege</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            웹앱 대신 내부 exporter만 Kubernetes API의 제한된 조회 권한을 갖습니다.
          </p>
        </article>
      </section>
    </div>
  )
}
