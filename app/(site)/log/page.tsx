import type { Metadata } from 'next'
import PageIntro from '@/components/site/PageIntro'
import DevelopmentLogCategoryFilter from '@/features/development-log/components/DevelopmentLogCategoryFilter'
import DevelopmentLogList from '@/features/development-log/components/DevelopmentLogList'
import DevelopmentLogSortFilter from '@/features/development-log/components/DevelopmentLogSortFilter'
import { parseDevelopmentLogCategory } from '@/features/development-log/development-log'
import {
  parseDevelopmentLogSort,
  sortDevelopmentLogListItems,
} from '@/features/development-log/development-log-list'
import { getDevelopmentLogViewStatsBatch } from '@/features/development-log/log-view-stats.server'
import { getDevelopmentLogSummaries } from '@/features/development-log/notion-development-logs.server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Development Log',
  description: '개발 회고, 장애 분석, 기술 선택과 문제 해결 과정을 기록합니다.',
  alternates: { canonical: '/log' },
}

type DevelopmentLogPageProps = {
  searchParams: Promise<{
    category?: string | string[]
    sort?: string | string[]
  }>
}

export default async function DevelopmentLogPage({ searchParams }: DevelopmentLogPageProps) {
  const query = await searchParams
  const selectedCategory = parseDevelopmentLogCategory(query.category)
  const selectedSort = parseDevelopmentLogSort(query.sort)
  const logs = await getDevelopmentLogSummaries()

  let viewStatsByPostId: Awaited<ReturnType<typeof getDevelopmentLogViewStatsBatch>> | null = null
  try {
    viewStatsByPostId = await getDevelopmentLogViewStatsBatch(
      logs.filter((log) => log.status === 'published').map((log) => log.notionPageId),
    )
  } catch (error) {
    console.error('[log-views] Failed to read development log list view stats', error)
  }

  const listItems = logs.map((log) => ({
    log,
    viewStats:
      log.status === 'published'
        ? (viewStatsByPostId?.get(log.notionPageId) ?? null)
        : null,
  }))
  const visibleItems = selectedCategory
    ? listItems.filter(({ log }) => log.category === selectedCategory)
    : listItems
  const sortedItems = sortDevelopmentLogListItems(visibleItems, selectedSort)

  return (
    <div className="space-y-12">
      <PageIntro
        eyebrow="Development Log"
        title="만들고 운영하며 배운 것"
        description="결과만 나열하지 않고 가설, 확인한 증거, 선택과 해결 과정을 남깁니다."
      />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <DevelopmentLogCategoryFilter
            selectedCategory={selectedCategory}
            selectedSort={selectedSort}
          />
          <DevelopmentLogSortFilter
            selectedCategory={selectedCategory}
            selectedSort={selectedSort}
          />
        </div>
        <DevelopmentLogList
          items={sortedItems}
          emptyMessage={selectedCategory ? '선택한 분류에 공개된 개발 기록이 없습니다.' : undefined}
        />
      </div>
    </div>
  )
}
