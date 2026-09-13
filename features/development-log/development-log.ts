import { z } from 'zod'

export const developmentLogSlugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

const developmentLogCategoryValues = ['improvement', 'operations', 'retrospective'] as const

export const developmentLogCategorySchema = z.enum(developmentLogCategoryValues)

export type DevelopmentLogCategory = z.infer<typeof developmentLogCategorySchema>

export const developmentLogCategories: readonly {
  value: DevelopmentLogCategory
  label: string
}[] = [
  { value: 'improvement', label: '개선 사례' },
  { value: 'operations', label: '운영 분석' },
  { value: 'retrospective', label: '회고' },
]

export type DevelopmentLogStatus = 'draft' | 'published'

export type DevelopmentLogSummary = {
  slug: string
  title: string
  summary: string
  category: DevelopmentLogCategory
  tags: readonly string[]
  status: DevelopmentLogStatus
  thumbnailUrl?: string
  publishedAt?: string
  updatedAt?: string
  seoTitle?: string
  seoDescription?: string
}

export function parseDevelopmentLogCategory(value: string | string[] | undefined) {
  return developmentLogCategorySchema.safeParse(value).data
}

export function getDevelopmentLogCategoryLabel(category: DevelopmentLogCategory) {
  return developmentLogCategories.find((item) => item.value === category)?.label ?? category
}

export type DevelopmentLogDraft = DevelopmentLogSummary & {
  status: 'draft'
  topics: readonly string[]
}
