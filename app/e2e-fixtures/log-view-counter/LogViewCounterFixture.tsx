'use client'

import { useEffect, useRef } from 'react'
import DevelopmentLogViewCounter from '@/features/development-log/components/DevelopmentLogViewCounter'

export const E2E_LOG_POST_ID = 'playwright-log-view-post'
export const E2E_LOG_POST_SLUG = 'playwright-log-view-regression'

export default function LogViewCounterFixture() {
  const hydrationStatusRef = useRef<HTMLOutputElement>(null)

  useEffect(() => {
    if (hydrationStatusRef.current) {
      hydrationStatusRef.current.textContent = '준비됨'
    }
  }, [])

  return (
    <main>
      <h1>개발 로그 조회수 회귀 테스트</h1>
      <DevelopmentLogViewCounter
        initialViewStats={{ todayViews: 6, totalViews: 41 }}
        postId={E2E_LOG_POST_ID}
        postSlug={E2E_LOG_POST_SLUG}
        publishedAt="2026-11-10T00:00:00.000Z"
      />
      <output aria-label="브라우저 준비 상태" ref={hydrationStatusRef}>
        준비 중
      </output>
    </main>
  )
}
