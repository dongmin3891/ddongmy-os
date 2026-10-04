import type { ReactNode } from 'react'
import type { DevelopmentLogViewStats } from '../log-view-count'

const publishedDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'medium',
  timeZone: 'Asia/Seoul',
})

type DevelopmentLogMetadataProps = {
  publishedAt?: string
  viewStats: DevelopmentLogViewStats | null
}

export default function DevelopmentLogMetadata({
  publishedAt,
  viewStats,
}: DevelopmentLogMetadataProps) {
  if (!publishedAt && !viewStats) return null

  return (
    <ul
      className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-slate-400"
      aria-label="게시글 정보"
    >
      {publishedAt && (
        <li className="inline-flex items-center gap-1.5">
          <CalendarIcon />
          <time dateTime={publishedAt}>{formatPublishedDate(publishedAt)}</time>
        </li>
      )}
      {viewStats && (
        <>
          <li className="inline-flex items-center gap-1.5">
            {publishedAt && <MetadataSeparator />}
            <EyeIcon />
            <span>오늘 {viewStats.todayViews.toLocaleString('ko-KR')}</span>
          </li>
          <li className="inline-flex items-center gap-1.5">
            <MetadataSeparator />
            <TrendingUpIcon />
            <span>누적 {viewStats.totalViews.toLocaleString('ko-KR')}</span>
          </li>
        </>
      )}
    </ul>
  )
}

function MetadataSeparator() {
  return (
    <span className="mr-0.5 text-slate-600" aria-hidden="true">
      ·
    </span>
  )
}

function formatPublishedDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : publishedDateFormatter.format(date)
}

type MetadataIconProps = {
  children: ReactNode
}

function MetadataIcon({ children }: MetadataIconProps) {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0 text-slate-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      {children}
    </svg>
  )
}

function CalendarIcon() {
  return (
    <MetadataIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3.75 9h16.5m-15 11.25h13.5a1.5 1.5 0 0 0 1.5-1.5v-12a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5Z"
      />
    </MetadataIcon>
  )
}

function EyeIcon() {
  return (
    <MetadataIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6-9.75-6-9.75-6Z"
      />
      <circle cx="12" cy="12" r="2.75" />
    </MetadataIcon>
  )
}

function TrendingUpIcon() {
  return (
    <MetadataIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3.75 16.5 5.25-5.25 3.75 3.75 7.5-7.5m-5.25 0h5.25v5.25"
      />
    </MetadataIcon>
  )
}
