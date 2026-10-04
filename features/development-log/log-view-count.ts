export type DevelopmentLogViewStats = {
  todayViews: number
  totalViews: number
}

export type IncrementDevelopmentLogViewResponse = {
  status: 'counted' | 'duplicate'
  viewStats: DevelopmentLogViewStats
}

export const LOG_VIEW_DEDUPLICATION_WINDOW_MS = 30 * 60 * 1_000

function isViewCount(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0
}

export function parseIncrementDevelopmentLogViewResponse(
  value: unknown,
): IncrementDevelopmentLogViewResponse | undefined {
  if (!value || typeof value !== 'object') return undefined

  const response = value as Record<string, unknown>
  if (
    (response.status !== 'counted' && response.status !== 'duplicate') ||
    !response.viewStats ||
    typeof response.viewStats !== 'object'
  ) {
    return undefined
  }

  const viewStats = response.viewStats as Record<string, unknown>
  if (!isViewCount(viewStats.todayViews) || !isViewCount(viewStats.totalViews)) {
    return undefined
  }

  return {
    status: response.status,
    viewStats: {
      todayViews: viewStats.todayViews,
      totalViews: viewStats.totalViews,
    },
  }
}

export function getLogViewStorageKey(postId: string) {
  return `ddongmy:log-view-counted:${postId}`
}

export function wasDevelopmentLogRecentlyCounted(
  storedTimestamp: string | null,
  nowTimestamp: number,
) {
  if (storedTimestamp === null) return false

  const countedAt = Number(storedTimestamp)
  if (!Number.isFinite(countedAt)) return false

  const elapsedMs = nowTimestamp - countedAt
  return elapsedMs >= 0 && elapsedMs < LOG_VIEW_DEDUPLICATION_WINDOW_MS
}
