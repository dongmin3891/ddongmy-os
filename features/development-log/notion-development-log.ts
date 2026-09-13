import { z } from 'zod'
import type { DevelopmentLogCategory, DevelopmentLogSummary } from './development-log'

const richTextSchema = z.object({ plain_text: z.string() })

const notionCoverSchema = z
  .discriminatedUnion('type', [
    z.object({ type: z.literal('external'), external: z.object({ url: z.url() }) }),
    z.object({ type: z.literal('file'), file: z.object({ url: z.url() }) }),
  ])
  .nullable()

const developmentLogPageSchema = z.object({
  object: z.literal('page'),
  id: z.string(),
  last_edited_time: z.string(),
  cover: notionCoverSchema.optional(),
  properties: z.object({
    Title: z.object({ type: z.literal('title'), title: z.array(richTextSchema) }),
    Slug: z.object({ type: z.literal('rich_text'), rich_text: z.array(richTextSchema) }),
    Summary: z.object({ type: z.literal('rich_text'), rich_text: z.array(richTextSchema) }),
    Category: z
      .object({
        type: z.literal('select'),
        select: z.object({ name: z.string() }).nullable(),
      })
      .optional(),
    Series: z
      .object({ type: z.literal('rich_text'), rich_text: z.array(richTextSchema) })
      .optional(),
    Tags: z.object({
      type: z.literal('multi_select'),
      multi_select: z.array(z.object({ name: z.string() })),
    }),
    Published: z.object({ type: z.literal('checkbox'), checkbox: z.literal(true) }),
    PublishedAt: z.object({
      type: z.literal('date'),
      date: z.object({ start: z.string() }).nullable(),
    }),
    'SEO Title': z.object({ type: z.literal('rich_text'), rich_text: z.array(richTextSchema) }),
    'SEO Description': z.object({ type: z.literal('rich_text'), rich_text: z.array(richTextSchema) }),
  }),
})

export const notionDevelopmentLogQuerySchema = z.object({
  object: z.literal('list'),
  results: z.array(developmentLogPageSchema),
  has_more: z.boolean(),
  next_cursor: z.string().nullable(),
})

export const notionPageMarkdownSchema = z.object({
  object: z.literal('page_markdown'),
  id: z.string(),
  markdown: z.string(),
  truncated: z.boolean(),
  unknown_block_ids: z.array(z.string()),
})

export type PublishedDevelopmentLog = DevelopmentLogSummary & {
  status: 'published'
  notionPageId: string
}

function joinPlainText(items: readonly z.infer<typeof richTextSchema>[]) {
  return items.map((item) => item.plain_text).join('')
}

function getNotionCoverUrl(cover: z.infer<typeof notionCoverSchema> | undefined) {
  if (!cover) return undefined
  return cover.type === 'external' ? cover.external.url : cover.file.url
}

function toDevelopmentLogCategory(
  page: z.infer<typeof developmentLogPageSchema>,
): DevelopmentLogCategory {
  const category = page.properties.Category?.select?.name
  const legacySeries = joinPlainText(page.properties.Series?.rich_text ?? [])

  switch (category ?? legacySeries) {
    case '개선 사례':
      return 'improvement'
    case '운영 분석':
      return 'operations'
    case '회고':
    case '홈서버에서 Kubernetes까지':
      return 'retrospective'
    default:
      throw new Error(`Published Notion page ${page.id} has an unsupported Category`)
  }
}

export function toPublishedDevelopmentLog(
  page: z.infer<typeof developmentLogPageSchema>,
): PublishedDevelopmentLog {
  const title = joinPlainText(page.properties.Title.title)
  const slug = joinPlainText(page.properties.Slug.rich_text)
  const summary = joinPlainText(page.properties.Summary.rich_text)
  const seoTitle = joinPlainText(page.properties['SEO Title'].rich_text)
  const seoDescription = joinPlainText(page.properties['SEO Description'].rich_text)

  if (!title || !slug || !summary) {
    throw new Error(`Published Notion page ${page.id} is missing Title, Slug, or Summary`)
  }

  return {
    slug,
    title,
    summary,
    category: toDevelopmentLogCategory(page),
    tags: page.properties.Tags.multi_select.map((tag) => tag.name),
    status: 'published',
    thumbnailUrl: getNotionCoverUrl(page.cover),
    notionPageId: page.id,
    publishedAt: page.properties.PublishedAt.date?.start,
    updatedAt: page.last_edited_time,
    seoTitle: seoTitle || undefined,
    seoDescription: seoDescription || undefined,
  }
}
