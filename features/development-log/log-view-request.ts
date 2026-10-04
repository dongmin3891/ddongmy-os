import { z } from 'zod'
import { developmentLogSlugSchema } from './development-log'

export const MAX_LOG_VIEW_REQUEST_BODY_BYTES = 4 * 1024

export class LogViewRequestBodyTooLargeError extends Error {}

export const incrementDevelopmentLogViewRequestSchema = z
  .object({
    postId: z.string().trim().min(1).max(128),
    postSlug: developmentLogSlugSchema,
  })
  .strict()

export type IncrementDevelopmentLogViewRequest = z.infer<
  typeof incrementDevelopmentLogViewRequestSchema
>

export async function readLogViewRequestBody(
  request: Request,
  maxBytes = MAX_LOG_VIEW_REQUEST_BODY_BYTES,
) {
  const contentLength = request.headers.get('content-length')
  if (contentLength !== null) {
    const declaredBytes = Number(contentLength)
    if (Number.isFinite(declaredBytes) && declaredBytes > maxBytes) {
      throw new LogViewRequestBodyTooLargeError('Log view request body is too large')
    }
  }

  if (!request.body) return ''

  const reader = request.body.getReader()
  const decoder = new TextDecoder()
  let bytesRead = 0
  let body = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    bytesRead += value.byteLength
    if (bytesRead > maxBytes) {
      await reader.cancel()
      throw new LogViewRequestBodyTooLargeError('Log view request body is too large')
    }

    body += decoder.decode(value, { stream: true })
  }

  return body + decoder.decode()
}
