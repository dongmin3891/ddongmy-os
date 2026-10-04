'use client'

import { useEffect, useState } from 'react'
import {
  getLogViewStorageKey,
  parseIncrementDevelopmentLogViewResponse,
  wasDevelopmentLogRecentlyCounted,
  type DevelopmentLogViewStats,
} from '../log-view-count'
import type { IncrementDevelopmentLogViewRequest } from '../log-view-request'
import DevelopmentLogMetadata from './DevelopmentLogMetadata'

type DevelopmentLogViewCounterProps = {
  postId: string
  postSlug: string
  publishedAt?: string
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
  publishedAt,
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

  return (
    <div aria-live="polite">
      <DevelopmentLogMetadata
        publishedAt={publishedAt}
        viewStats={counterState.status === 'available' ? counterState.viewStats : null}
      />
    </div>
  )
}
