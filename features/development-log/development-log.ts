import { z } from 'zod'

export const developmentLogSlugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export type DevelopmentLogStatus = 'draft' | 'published'

export type DevelopmentLogSummary = {
  slug: string
  title: string
  summary: string
  tags: readonly string[]
  status: DevelopmentLogStatus
  publishedAt?: string
  seoTitle?: string
  seoDescription?: string
}

export type DevelopmentLogDraft = DevelopmentLogSummary & {
  status: 'draft'
  topics: readonly string[]
}
