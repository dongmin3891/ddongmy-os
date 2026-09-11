import Link from 'next/link'
import type { DevelopmentLogSummary } from '../development-log'

type DevelopmentLogListProps = {
  logs: readonly DevelopmentLogSummary[]
}

export default function DevelopmentLogList({ logs }: DevelopmentLogListProps) {
  if (logs.length === 0) {
    return <p className="rounded-lg border border-slate-700 bg-slate-800 p-6 text-slate-300">공개된 개발 기록이 없습니다.</p>
  }

  return (
    <div className="grid gap-6">
      {logs.map((log) => (
        <article key={log.slug} className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="rounded bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-300">
              {log.status === 'draft' ? '초안 준비 중' : '공개'}
            </span>
            <ul className="flex flex-wrap gap-2 text-xs text-slate-400" aria-label={`${log.title} 태그`}>
              {log.tags.map((tag) => (
                <li key={tag}>#{tag}</li>
              ))}
            </ul>
          </div>
          <h2 className="text-xl font-bold text-white">
            <Link href={`/log/${log.slug}`} className="hover:text-primary-400">
              {log.title}
            </Link>
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">{log.summary}</p>
        </article>
      ))}
    </div>
  )
}
