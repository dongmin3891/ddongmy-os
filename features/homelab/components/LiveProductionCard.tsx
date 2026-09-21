'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  publicHomelabStatusSchema,
  type PublicHomelabStatus,
} from '../homelab-status'

const deployedAtFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Seoul',
})

function getStatusLabel(homelabStatus: PublicHomelabStatus | undefined) {
  if (!homelabStatus) return '확인 중'
  if (homelabStatus.status === 'healthy') return 'Production healthy'
  if (homelabStatus.status === 'degraded') return '일부 인스턴스 확인 필요'
  return '상세 상태 확인 불가'
}

function getStatusTone(homelabStatus: PublicHomelabStatus | undefined) {
  if (homelabStatus?.status === 'healthy') return 'bg-emerald-400'
  if (homelabStatus?.status === 'degraded') return 'bg-amber-300'
  return 'bg-slate-500'
}

export default function LiveProductionCard() {
  const [homelabStatus, setHomelabStatus] = useState<PublicHomelabStatus>()

  useEffect(() => {
    const controller = new AbortController()

    async function loadHomelabStatus() {
      try {
        const response = await fetch('/api/server-status', { signal: controller.signal })
        if (!response.ok) throw new Error(`Server status request failed with ${response.status}`)

        setHomelabStatus(publicHomelabStatusSchema.parse(await response.json()))
      } catch {
        if (controller.signal.aborted) return
        setHomelabStatus({ status: 'unavailable', checkedAt: new Date().toISOString() })
      }
    }

    void loadHomelabStatus()

    return () => controller.abort()
  }, [])

  const hasLiveStatus = homelabStatus && homelabStatus.status !== 'unavailable'

  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 p-6 sm:p-8">
      <div
        className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-emerald-400/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Live production
          </p>
          <p
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-200"
            aria-live="polite"
          >
            <span
              className={`size-2 rounded-full ${getStatusTone(homelabStatus)}`}
              aria-hidden="true"
            />
            {getStatusLabel(homelabStatus)}
          </p>
        </div>

        <h3 className="mt-7 text-3xl font-bold text-white">ddongmy.com</h3>
        <p className="mt-3 max-w-lg text-sm leading-7 text-slate-400">
          지금 보고 있는 이 사이트를 K3s에 배포하고, 준비 상태와 릴리스를 최소 권한으로
          직접 관찰합니다.
        </p>

        <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-800 bg-slate-800 sm:grid-cols-3">
          <div className="bg-slate-900 p-4">
            <dt className="text-xs text-slate-500">Replicas</dt>
            <dd className="mt-2 font-mono text-lg font-bold text-white">
              {hasLiveStatus
                ? `${homelabStatus.readyReplicas}/${homelabStatus.desiredReplicas}`
                : '—'}
            </dd>
          </div>
          <div className="bg-slate-900 p-4">
            <dt className="text-xs text-slate-500">Release</dt>
            <dd className="mt-2 font-mono text-lg font-bold text-white">
              {hasLiveStatus ? (homelabStatus.releaseSha ?? 'unknown') : '—'}
            </dd>
          </div>
          <div className="col-span-2 bg-slate-900 p-4 sm:col-span-1">
            <dt className="text-xs text-slate-500">Deployed</dt>
            <dd className="mt-2 text-sm font-bold text-white">
              {hasLiveStatus && homelabStatus.deployedAt
                ? deployedAtFormatter.format(new Date(homelabStatus.deployedAt))
                : '—'}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-xs text-slate-500">GitHub Actions → Argo CD → K3s</p>
          <Link href="/lab" className="font-semibold text-primary-300 hover:text-primary-200">
            운영 대시보드 보기 →
          </Link>
        </div>
      </div>
    </article>
  )
}
