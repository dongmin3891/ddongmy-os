import type { Metadata } from 'next'
import PageIntro from '@/components/site/PageIntro'
import HomelabStatusPanel from '@/features/homelab/components/HomelabStatusPanel'
import { getHomelabStatus } from '@/features/homelab/kubernetes-homelab-status.server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Home Lab',
  description: 'ddongmy.com이 홈서버에서 사용자에게 도달하는 구조와 운영 기록입니다.',
  alternates: { canonical: '/lab' },
}

const requestPath = ['Internet', 'Home Network', 'K3s', 'Traefik', 'Ingress', 'Service', 'Next.js Pod']

export default async function HomeLabPage() {
  const homelabStatus = await getHomelabStatus()

  return (
    <div className="space-y-12">
      <PageIntro
        eyebrow="Home Lab"
        title="이 페이지가 사용자에게 도달하기까지"
        description="ddongmy.com은 직접 구성한 홈서버의 K3s 위에서 실행됩니다. 운영 데이터를 안전하게 공개하는 과정도 이곳에 기록합니다."
      />

      <HomelabStatusPanel homelabStatus={homelabStatus} />

      <section className="space-y-6" aria-labelledby="request-path-title">
        <div className="space-y-2">
          <h2 id="request-path-title" className="text-3xl font-bold text-white">How this page reached you</h2>
          <p className="text-slate-300">요청은 아래 경계를 지나 Next.js 애플리케이션에 도달합니다.</p>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {requestPath.map((step, index) => (
            <li key={step} className="rounded-lg border border-slate-700 bg-slate-800 p-4">
              <span className="text-xs font-semibold text-primary-400">{String(index + 1).padStart(2, '0')}</span>
              <p className="mt-2 font-medium text-white">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-lg border border-slate-700 bg-slate-800 p-6" aria-labelledby="lab-access-title">
        <h2 id="lab-access-title" className="text-2xl font-bold text-white">공개 데이터 경계</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-300">
          이 페이지는 web-app Deployment 하나의 준비된 replica 수, release SHA와 배포 시각만 공개합니다. Pod 이름, 내부 IP, Kubernetes endpoint와 Secret은 반환하지 않습니다.
        </p>
      </section>
    </div>
  )
}
