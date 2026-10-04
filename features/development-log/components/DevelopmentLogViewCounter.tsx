'use client'

import { useEffect, useState } from 'react'
import {
  getLogViewStorageKey,
  parseIncrementDevelopmentLogViewResponse,
  wasDevelopmentLogRecentlyCounted,
  type DevelopmentLogViewStats,
} from '../log-view-count'
import type { IncrementDevelopmentLogViewRequest } from '../log-view-request'

type DevelopmentLogViewCounterProps = {
  postId: string
  postSlug: string
  initialViewStats: DevelopmentLogViewStats | null
}

type ViewCounterState =
  | { status: 'available'; viewStats: DevelopmentLogViewStats }
  | { status: 'unavailable' }

async function countDevelopmentLogView(request: IncrementDevelopmentLogViewRequest) {
  const response = await fetch('/api/log-views', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Development log view request failed with status ${response.status}`)
  }

  let body: unknown
  try {
    body = await response.json()
  } catch (cause) {
    throw new Error('Development log view request returned invalid JSON', { cause })
  }

  const result = parseIncrementDevelopmentLogViewResponse(body)
  if (!result) {
    throw new Error('Development log view request returned an invalid response')
  }

  return result.viewStats
}

function getInitialViewCounterState(
  initialViewStats: DevelopmentLogViewStats | null,
): ViewCounterState {
  if (!initialViewStats) return { status: 'unavailable' }
  return { status: 'available', viewStats: initialViewStats }
}

export default function DevelopmentLogViewCounter({
  postId,
  postSlug,
  initialViewStats,
}: DevelopmentLogViewCounterProps) {
  const [counterState, setCounterState] = useState<ViewCounterState>(() =>
    getInitialViewCounterState(initialViewStats),
  )

  useEffect(() => {
    const storageKey = getLogViewStorageKey(postId)
    const nowTimestamp = Date.now()

    try {
      if (wasDevelopmentLogRecentlyCounted(localStorage.getItem(storageKey), nowTimestamp)) {
        return
      }

      localStorage.setItem(storageKey, String(nowTimestamp))
    } catch {
      // Storage can be unavailable in restricted browser contexts. Counting still remains usable.
    }

    countDevelopmentLogView({ postId, postSlug })
      .then((viewStats) => setCounterState({ status: 'available', viewStats }))
      .catch(() => {
        setCounterState((currentState) =>
          currentState.status === 'available' ? currentState : { status: 'unavailable' },
        )
      })
  }, [initialViewStats, postId, postSlug])

  if (counterState.status === 'unavailable') {
    return <p className="text-sm text-slate-500">조회수 정보를 불러올 수 없습니다.</p>
  }

  return (
    <p className="text-sm text-slate-400" aria-live="polite">
      오늘 {counterState.viewStats.todayViews.toLocaleString('ko-KR')} · 누적{' '}
      {counterState.viewStats.totalViews.toLocaleString('ko-KR')}
    </p>
  )
}
