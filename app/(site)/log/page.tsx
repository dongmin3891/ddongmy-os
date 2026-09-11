import type { Metadata } from 'next'
import PageIntro from '@/components/site/PageIntro'
import DevelopmentLogList from '@/features/development-log/components/DevelopmentLogList'
import { developmentLogs } from '@/features/development-log/development-logs'

export const metadata: Metadata = {
  title: 'Development Log',
  description: '개발 회고, 장애 분석, 기술 선택과 문제 해결 과정을 기록합니다.',
  alternates: { canonical: '/log' },
}

export default function DevelopmentLogPage() {
  return (
    <div className="space-y-12">
      <PageIntro
        eyebrow="Development Log"
        title="만들고 운영하며 배운 것"
        description="결과만 나열하지 않고 가설, 확인한 증거, 선택과 해결 과정을 남깁니다. 현재 글은 Notion 공개 연동을 준비하고 있습니다."
      />
      <DevelopmentLogList logs={developmentLogs} />
    </div>
  )
}
