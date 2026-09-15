import Link from 'next/link'
import notionImageSource from '@/config/notion-image-source'
import r2ImageSource from '@/config/r2-image-source'
import {
  getDevelopmentLogCategoryLabel,
  type DevelopmentLogSummary,
} from '../development-log'
import DevelopmentLogThumbnailImage from './DevelopmentLogThumbnailImage'

type DevelopmentLogListProps = {
  logs: readonly DevelopmentLogSummary[]
  emptyMessage?: string
}

export default function DevelopmentLogList({
  logs,
  emptyMessage = '공개된 개발 기록이 없습니다.',
}: DevelopmentLogListProps) {
  if (logs.length === 0) {
    return <p className="rounded-lg border border-slate-700 bg-slate-800 p-6 text-slate-300">{emptyMessage}</p>
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-6">
      {logs.map((log, index) => (
        <article
          key={log.slug}
          className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-800 transition duration-300 hover:-translate-y-1 hover:border-primary-400/60 hover:shadow-xl hover:shadow-slate-950/30 focus-within:ring-2 focus-within:ring-primary-400 motion-reduce:transform-none motion-reduce:transition-none"
        >
          <DevelopmentLogThumbnail log={log} shouldLoadEagerly={index === 0} />
          <div className="flex flex-1 flex-col p-6">
            <h2 className="line-clamp-2 text-xl font-bold leading-snug text-white transition-colors group-hover:text-primary-300">
              <Link
                href={`/log/${log.slug}`}
                className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
              >
                {log.title}
              </Link>
            </h2>
            <p className="mt-3 line-clamp-3 flex-1 leading-relaxed text-slate-300">{log.summary}</p>
            <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
              {log.tags.map((tag) => (
                <li key={tag}>#{tag}</li>
              ))}
            </ul>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary-300">
              글 읽기
              <span
                className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
                aria-hidden="true"
              >
                →
              </span>
            </span>
          </div>
        </article>
      ))}
    </div>
  )
}

type DevelopmentLogThumbnailProps = {
  log: DevelopmentLogSummary
  shouldLoadEagerly: boolean
}

function DevelopmentLogThumbnail({ log, shouldLoadEagerly }: DevelopmentLogThumbnailProps) {
  const categoryLabel =
    log.status === 'draft' ? '초안 준비 중' : getDevelopmentLogCategoryLabel(log.category)
  const isNotionThumbnail = Boolean(
    log.thumbnailUrl && matchesImageSource(log.thumbnailUrl, notionImageSource),
  )
  const isR2Thumbnail = Boolean(
    log.thumbnailUrl && matchesImageSource(log.thumbnailUrl, r2ImageSource),
  )
  const shouldRenderImage = isNotionThumbnail || isR2Thumbnail

  return (
    <div
      className={`relative aspect-video overflow-hidden ${getCategoryBackgroundClassName(log.category)}`}
    >
      {shouldRenderImage && log.thumbnailUrl && (
        <DevelopmentLogThumbnailImage
          key={log.thumbnailUrl}
          loading={shouldLoadEagerly ? 'eager' : 'lazy'}
          src={log.thumbnailUrl}
          quality={isNotionThumbnail ? 60 : undefined}
          unoptimized={isR2Thumbnail}
        />
      )}
      {log.thumbnailUrl && !shouldRenderImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
          style={{ backgroundImage: `url(${log.thumbnailUrl})` }}
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
      <span className="absolute bottom-4 left-4 rounded-md border border-white/10 bg-slate-950/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
        {categoryLabel}
      </span>
    </div>
  )
}

type ImageSource = {
  protocol: string
  hostname: string
  pathnamePrefix: string
}

function matchesImageSource(thumbnailUrl: string, source: ImageSource) {
  let url: URL

  try {
    url = new URL(thumbnailUrl)
  } catch {
    return false
  }

  return (
    url.protocol === `${source.protocol}:` &&
    url.hostname === source.hostname &&
    url.port === '' &&
    url.pathname.startsWith(source.pathnamePrefix)
  )
}

function getCategoryBackgroundClassName(category: DevelopmentLogSummary['category']) {
  switch (category) {
    case 'improvement':
      return 'bg-gradient-to-br from-blue-500/40 via-slate-800 to-cyan-400/20'
    case 'operations':
      return 'bg-gradient-to-br from-amber-500/35 via-slate-800 to-orange-400/20'
    case 'retrospective':
      return 'bg-gradient-to-br from-violet-500/35 via-slate-800 to-fuchsia-400/20'
  }
}
