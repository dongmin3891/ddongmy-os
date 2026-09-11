import { z } from 'zod'
import type { DevelopmentLogSummary } from './development-log'

const richTextSchema = z.object({ plain_text: z.string() })

const developmentLogPageSchema = z.object({
  object: z.literal('page'),
  id: z.string(),
  properties: z.object({
    Title: z.object({ type: z.literal('title'), title: z.array(richTextSchema) }),
    Slug: z.object({ type: z.literal('rich_text'), rich_text: z.array(richTextSchema) }),
    Summary: z.object({ type: z.literal('rich_text'), rich_text: z.array(richTextSchema) }),
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
    tags: page.properties.Tags.multi_select.map((tag) => tag.name),
    status: 'published',
    notionPageId: page.id,
    publishedAt: page.properties.PublishedAt.date?.start,
    seoTitle: seoTitle || undefined,
    seoDescription: seoDescription || undefined,
  }
}
