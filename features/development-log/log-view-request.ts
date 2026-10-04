import { z } from 'zod'
import { developmentLogSlugSchema } from './development-log'

export const incrementDevelopmentLogViewRequestSchema = z
  .object({
    postId: z.string().trim().min(1).max(128),
    postSlug: developmentLogSlugSchema,
  })
  .strict()

export type IncrementDevelopmentLogViewRequest = z.infer<
  typeof incrementDevelopmentLogViewRequestSchema
>
