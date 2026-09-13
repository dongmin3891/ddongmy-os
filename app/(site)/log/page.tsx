import type { Metadata } from 'next'
import PageIntro from '@/components/site/PageIntro'
import DevelopmentLogCategoryFilter from '@/features/development-log/components/DevelopmentLogCategoryFilter'
import DevelopmentLogList from '@/features/development-log/components/DevelopmentLogList'
import { parseDevelopmentLogCategory } from '@/features/development-log/development-log'
import { getDevelopmentLogSummaries } from '@/features/development-log/notion-development-logs.server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Development Log',
  description: '개발 회고, 장애 분석, 기술 선택과 문제 해결 과정을 기록합니다.',
  alternates: { canonical: '/log' },
}

type DevelopmentLogPageProps = {
  searchParams: Promise<{ category?: string | string[] }>
}

export default async function DevelopmentLogPage({ searchParams }: DevelopmentLogPageProps) {
  const selectedCategory = parseDevelopmentLogCategory((await searchParams).category)
  const logs = await getDevelopmentLogSummaries()
  const visibleLogs = selectedCategory
    ? logs.filter((log) => log.category === selectedCategory)
    : logs

  return (
    <div className="space-y-12">
      <PageIntro
        eyebrow="Development Log"
        title="만들고 운영하며 배운 것"
        description="결과만 나열하지 않고 가설, 확인한 증거, 선택과 해결 과정을 남깁니다."
      />
      <div className="space-y-6">
        <DevelopmentLogCategoryFilter selectedCategory={selectedCategory} />
        <DevelopmentLogList
          logs={visibleLogs}
          emptyMessage={selectedCategory ? '선택한 분류에 공개된 개발 기록이 없습니다.' : undefined}
        />
      </div>
    </div>
  )
}
