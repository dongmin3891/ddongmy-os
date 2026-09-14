import 'server-only'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { z } from 'zod'

const r2EnvironmentSchema = z.object({
  R2_ACCOUNT_ID: z.string().trim().min(1),
  R2_ACCESS_KEY_ID: z.string().trim().min(1),
  R2_SECRET_ACCESS_KEY: z.string().trim().min(1),
  R2_BUCKET: z.string().trim().min(1),
  R2_PUBLIC_URL: z.url(),
})

const contentSha256Schema = z.string().regex(/^[a-f0-9]{64}$/)

type R2Config = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  publicUrl: URL
}

type UploadDevelopmentLogCoverInput = {
  pageId: string
  contentSha256: string
  webp: Uint8Array
}

export type UploadedDevelopmentLogCover = {
  key: string
  publicUrl: string
}

let r2Client: S3Client | undefined

function getR2Config(): R2Config {
  const result = r2EnvironmentSchema.safeParse(process.env)

  if (!result.success) {
    const invalidKeys = [...new Set(result.error.issues.map((issue) => issue.path[0]))]
    throw new Error(`Invalid R2 configuration: ${invalidKeys.join(', ')}`)
  }

  const publicUrl = new URL(result.data.R2_PUBLIC_URL)
  if (
    publicUrl.protocol !== 'https:' ||
    publicUrl.username ||
    publicUrl.password ||
    publicUrl.port ||
    publicUrl.pathname !== '/' ||
    publicUrl.search ||
    publicUrl.hash
  ) {
    throw new Error('R2_PUBLIC_URL must be an HTTPS origin without credentials, port, path, or query')
  }

  return {
    accountId: result.data.R2_ACCOUNT_ID,
    accessKeyId: result.data.R2_ACCESS_KEY_ID,
    secretAccessKey: result.data.R2_SECRET_ACCESS_KEY,
    bucket: result.data.R2_BUCKET,
    publicUrl,
  }
}

function getR2Client(config: R2Config) {
  r2Client ??= new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })

  return r2Client
}

export async function uploadDevelopmentLogCover({
  pageId,
  contentSha256,
  webp,
}: UploadDevelopmentLogCoverInput): Promise<UploadedDevelopmentLogCover> {
  const config = getR2Config()
  const hash = contentSha256Schema.parse(contentSha256)
  const key = `covers/${encodeURIComponent(pageId)}/${hash}.webp`

  await getR2Client(config).send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: webp,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  )

  return {
    key,
    publicUrl: new URL(key, config.publicUrl).toString(),
  }
}
