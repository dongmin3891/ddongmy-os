'use client'

import { useEffect, useState } from 'react'
import {
  publicTrafficStatsSchema,
  type PublicTrafficStats,
} from '../traffic-stats'

const visitNumberFormatter = new Intl.NumberFormat('ko-KR')

export default function TrafficSummary() {
  const [trafficStats, setTrafficStats] = useState<PublicTrafficStats>()

  useEffect(() => {
    const controller = new AbortController()

    async function loadTrafficStats() {
      try {
        const response = await fetch('/api/traffic', { signal: controller.signal })
        if (!response.ok) throw new Error(`Traffic request failed with ${response.status}`)

        setTrafficStats(publicTrafficStatsSchema.parse(await response.json()))
      } catch {
        if (controller.signal.aborted) return
        setTrafficStats({ status: 'unavailable', checkedAt: new Date().toISOString() })
      }
    }

    void loadTrafficStats()

    return () => controller.abort()
  }, [])

  if (!trafficStats || trafficStats.status === 'unavailable') return null

  return (
    <div className="mt-5 border-y border-slate-800 py-4" aria-live="polite">
      <dl className="grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs text-slate-500">오늘 방문</dt>
          <dd className="mt-1 font-mono text-lg font-bold text-white">
            {visitNumberFormatter.format(trafficStats.todayVisits)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">최근 7일 방문</dt>
          <dd className="mt-1 font-mono text-lg font-bold text-white">
            {visitNumberFormatter.format(trafficStats.lastSevenDaysVisits)}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-[11px] text-slate-600">Cloudflare visits · 10분 단위 갱신</p>
    </div>
  )
}
