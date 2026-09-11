import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DevelopmentLogBody from '@/features/development-log/components/DevelopmentLogBody'
import { developmentLogSlugSchema } from '@/features/development-log/development-log'
import { getDevelopmentLog } from '@/features/development-log/notion-development-logs.server'

export const dynamic = 'force-dynamic'

type DevelopmentLogEntryPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: DevelopmentLogEntryPageProps): Promise<Metadata> {
  const parsedSlug = developmentLogSlugSchema.safeParse((await params).slug)
  if (!parsedSlug.success) return {}

  const slug = parsedSlug.data
  const log = await getDevelopmentLog(slug)

  if (!log) return {}

  return {
    title: log.seoTitle ?? log.title,
    description: log.seoDescription ?? log.summary,
    alternates: { canonical: `/log/${log.slug}` },
    robots: log.status === 'published' ? undefined : { index: false, follow: false },
  }
}

export default async function DevelopmentLogEntryPage({ params }: DevelopmentLogEntryPageProps) {
  const parsedSlug = developmentLogSlugSchema.safeParse((await params).slug)
  if (!parsedSlug.success) notFound()

  const slug = parsedSlug.data
  const log = await getDevelopmentLog(slug)

  if (!log) notFound()

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/log" className="text-sm font-medium text-primary-400 hover:text-primary-300">
        ← Development Log
      </Link>
      <header className="mt-8 space-y-5 border-b border-slate-700 pb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
          {log.status === 'published' ? 'Development Log' : 'Draft'}
        </p>
        <h1 className="text-balance text-4xl font-bold text-white sm:text-5xl">{log.title}</h1>
        <p className="text-lg leading-relaxed text-slate-300">{log.summary}</p>
        <ul className="flex flex-wrap gap-2" aria-label="태그">
          {log.tags.map((tag) => (
            <li key={tag} className="rounded bg-slate-800 px-3 py-1 text-sm text-slate-300">
              #{tag}
            </li>
          ))}
        </ul>
      </header>
      <section className="py-8">
        {log.status === 'published' ? (
          <DevelopmentLogBody markdown={log.markdown} />
        ) : (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-white">이 글에서 다룰 내용</h2>
            <ul className="list-disc space-y-3 pl-6 text-slate-300">
              {log.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
            <p className="rounded-lg border border-slate-700 bg-slate-800 p-5 leading-relaxed text-slate-300">
              본문은 Notion Development Log 연동 단계에서 공개합니다. 공개 전까지 이 페이지는 검색 결과에 포함되지 않습니다.
            </p>
          </div>
        )}
      </section>
    </article>
  )
}
