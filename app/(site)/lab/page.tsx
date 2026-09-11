import type { Metadata } from 'next'
import PageIntro from '@/components/site/PageIntro'

export const metadata: Metadata = {
  title: 'Home Lab',
  description: 'ddongmy.com이 홈서버에서 사용자에게 도달하는 구조와 운영 기록입니다.',
  alternates: { canonical: '/lab' },
}

const requestPath = ['Internet', 'Home Network', 'K3s', 'Traefik', 'Ingress', 'Service', 'Next.js Pod']

export default function HomeLabPage() {
  return (
    <div className="space-y-12">
      <PageIntro
        eyebrow="Home Lab"
        title="이 페이지가 사용자에게 도달하기까지"
        description="ddongmy.com은 직접 구성한 홈서버의 K3s 위에서 실행됩니다. 운영 데이터를 안전하게 공개하는 과정도 이곳에 기록합니다."
      />

      <section className="grid gap-6 md:grid-cols-3" aria-labelledby="lab-status-title">
        <h2 id="lab-status-title" className="sr-only">현재 연결 상태</h2>
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6 md:col-span-2">
          <p className="text-sm font-medium text-green-300">Site status</p>
          <p className="mt-2 text-2xl font-bold text-white">서비스 응답 정상</p>
          <p className="mt-2 text-sm text-slate-300">상세 cluster metric은 read-only 데이터 경계를 만든 뒤 연결합니다.</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <p className="text-sm text-slate-400">Runtime</p>
          <p className="mt-2 text-xl font-bold text-white">Next.js 16.3</p>
          <p className="mt-1 text-sm text-slate-300">Node.js 22 · Docker</p>
        </div>
      </section>

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

      <section className="rounded-lg border border-slate-700 bg-slate-800 p-6" aria-labelledby="lab-next-title">
        <h2 id="lab-next-title" className="text-2xl font-bold text-white">다음 연결</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-300">
          공개 가능한 replica 상태, release SHA와 배포 시간을 별도의 최소 권한 read-only 경계에서 가공해 제공합니다.
        </p>
      </section>
    </div>
  )
}
