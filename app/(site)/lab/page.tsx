import type { Metadata } from 'next'
import PageIntro from '@/components/site/PageIntro'
import HomelabActivityGrid from '@/features/homelab/components/HomelabActivityGrid'
import HomelabArchitecturePanel from '@/features/homelab/components/HomelabArchitecturePanel'
import HomelabOverviewCards from '@/features/homelab/components/HomelabOverviewCards'
import ServerHistorySection from '@/features/homelab/components/ServerHistorySection'
import { getDeploymentEvents } from '@/features/homelab/deployment-events.server'
import { getHomelabStatus } from '@/features/homelab/homelab-status.server'
import {
  getServerMetrics,
  getServerMetricsHistory,
} from '@/features/homelab/netdata-server-metrics.server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Home Lab',
  description: 'ddongmy.com이 홈서버에서 사용자에게 도달하는 구조와 운영 기록입니다.',
  alternates: { canonical: '/lab' },
}

export default async function HomeLabPage() {
  const [homelabStatus, serverMetrics, serverMetricsHistory] = await Promise.all([
    getHomelabStatus(),
    getServerMetrics(),
    getServerMetricsHistory(),
  ])
  const deploymentEvents = getDeploymentEvents()

  return (
    <div className="space-y-10">
      <PageIntro
        eyebrow="Home Lab"
        title="운영 중인 홈서버를 한눈에"
        description="ddongmy.com이 실행되는 K3s의 현재 상태와 배포, 요청 경로와 운영 기록을 보여줍니다."
      />

      <HomelabOverviewCards homelabStatus={homelabStatus} serverMetrics={serverMetrics} />

      <ServerHistorySection
        history={serverMetricsHistory}
        deployments={deploymentEvents}
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <HomelabArchitecturePanel />
        <HomelabActivityGrid homelabStatus={homelabStatus} />
      </div>

      <section
        className="rounded-xl border border-slate-700 bg-slate-800/70 p-5"
        aria-labelledby="lab-access-title"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between md:gap-8">
          <h2 id="lab-access-title" className="shrink-0 text-lg font-bold text-white">
            공개 데이터 경계
          </h2>
          <p className="max-w-4xl text-sm leading-relaxed text-slate-400">
            이 페이지는 web-app Deployment의 준비된 replica 수, release SHA와 배포 시각,
            GitOps 배포 기록, 홈서버의 가공된 리소스 사용률과 7일 이력만 공개합니다. 원본
            Netdata 응답, Pod 이름, 내부 IP, Kubernetes endpoint와 Secret은 반환하지 않습니다.
          </p>
        </div>
      </section>
    </div>
  )
}
