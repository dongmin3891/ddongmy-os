'use client'

import { useEffect, useState } from 'react'
import {
  publicHomelabStatusSchema,
  type PublicHomelabStatus,
} from '../homelab-status'

export default function HomelabStatusBadge() {
  const [homelabStatus, setHomelabStatus] = useState<PublicHomelabStatus>()

  useEffect(() => {
    const controller = new AbortController()

    async function loadHomelabStatus() {
      try {
        const response = await fetch('/api/server-status', { signal: controller.signal })
        if (!response.ok) throw new Error(`Status request failed with ${response.status}`)

        setHomelabStatus(publicHomelabStatusSchema.parse(await response.json()))
      } catch {
        if (controller.signal.aborted) return
        setHomelabStatus({ status: 'unavailable', checkedAt: new Date().toISOString() })
      }
    }

    void loadHomelabStatus()

    return () => controller.abort()
  }, [])

  if (!homelabStatus) {
    return <span className="text-slate-500">상태 확인 중</span>
  }

  if (homelabStatus.status === 'unavailable') {
    return <span className="text-slate-500">상태 확인 불가</span>
  }

  const isHealthy = homelabStatus.status === 'healthy'

  return (
    <span className={isHealthy ? 'text-green-400' : 'text-amber-300'}>
      <span aria-hidden="true">{isHealthy ? '●' : '▲'}</span>{' '}
      {homelabStatus.readyReplicas}/{homelabStatus.desiredReplicas} replicas{' '}
      {isHealthy ? 'healthy' : 'ready'}
    </span>
  )
}
