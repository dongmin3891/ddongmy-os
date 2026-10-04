import type { DevelopmentLogSummary } from './development-log'
import type { DevelopmentLogViewStats } from './log-view-count'

export const developmentLogSortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'today', label: '오늘 조회순' },
  { value: 'total', label: '누적 조회순' },
] as const

export type DevelopmentLogSort = (typeof developmentLogSortOptions)[number]['value']

export type DevelopmentLogListItem = {
  log: DevelopmentLogSummary
  viewStats: DevelopmentLogViewStats | null
}

export function parseDevelopmentLogSort(
  value: string | string[] | undefined,
): DevelopmentLogSort {
  switch (value) {
    case 'today':
    case 'total':
      return value
    default:
      return 'latest'
  }
}

export function sortDevelopmentLogListItems(
  items: readonly DevelopmentLogListItem[],
  sort: DevelopmentLogSort,
) {
  if (sort === 'latest') return items

  const viewCountKey = sort === 'today' ? 'todayViews' : 'totalViews'
  return [...items].sort(
    (left, right) =>
      (right.viewStats?.[viewCountKey] ?? 0) - (left.viewStats?.[viewCountKey] ?? 0),
  )
}

type DevelopmentLogListHrefOptions = {
  category?: string
  sort?: DevelopmentLogSort
}

export function getDevelopmentLogListHref({
  category,
  sort = 'latest',
}: DevelopmentLogListHrefOptions) {
  const searchParams = new URLSearchParams()
  if (category) searchParams.set('category', category)
  if (sort !== 'latest') searchParams.set('sort', sort)

  const query = searchParams.toString()
  return query ? `/log?${query}` : '/log'
}
