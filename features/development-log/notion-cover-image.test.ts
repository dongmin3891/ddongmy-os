import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import test from 'node:test'
import sharp from 'sharp'
import {
  CoverDownloadError,
  CoverTooLargeError,
  createOptimizedCover,
  getNotionCoverSource,
  readCoverImageBytes,
} from './notion-cover-image.server'
import { stillHasNotionCoverSource } from './sync-development-log-cover.server'

test('허용한 Notion S3 HTTPS URL만 source로 사용한다', () => {
  const first = getNotionCoverSource(
    'https://prod-files-secure.s3.us-west-2.amazonaws.com/path/cover.png?signature=first',
  )
  const second = getNotionCoverSource(
    'https://prod-files-secure.s3.us-west-2.amazonaws.com/path/cover.png?signature=second',
  )

  assert.ok(first)
  assert.ok(second)
  assert.equal(first.identity, second.identity)
  assert.equal(
    getNotionCoverSource('http://prod-files-secure.s3.us-west-2.amazonaws.com/path/cover.png'),
    undefined,
  )
  assert.equal(
    getNotionCoverSource(
      'https://prod-files-secure.s3.us-west-2.amazonaws.com.evil.example/path/cover.png',
    ),
    undefined,
  )
})

test('image 응답의 Content-Length가 제한을 넘으면 body를 읽기 전에 거절한다', async () => {
  const response = new Response('oversized', {
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': '11',
    },
  })

  await assert.rejects(() => readCoverImageBytes(response, 10), CoverTooLargeError)
})

test('Content-Length가 없어도 실제 image byte 수를 제한한다', async () => {
  const response = new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2, 3]))
        controller.enqueue(new Uint8Array([4, 5, 6]))
        controller.close()
      },
    }),
    { headers: { 'Content-Type': 'image/png' } },
  )

  await assert.rejects(() => readCoverImageBytes(response, 5), CoverTooLargeError)
})

test('image가 아닌 성공 응답을 거절한다', async () => {
  const response = new Response('not an image', {
    headers: { 'Content-Type': 'text/html' },
  })

  await assert.rejects(() => readCoverImageBytes(response), CoverDownloadError)
})

test('원본 bytes hash를 유지하면서 최대 1200px WebP로 변환한다', async () => {
  const original = await sharp({
    create: {
      width: 1600,
      height: 900,
      channels: 3,
      background: { r: 32, g: 92, b: 160 },
    },
  })
    .png()
    .toBuffer()

  const optimized = await createOptimizedCover(original)
  const metadata = await sharp(optimized.webp).metadata()

  assert.equal(optimized.contentSha256, createHash('sha256').update(original).digest('hex'))
  assert.equal(metadata.format, 'webp')
  assert.equal(metadata.width, 1200)
  assert.equal(metadata.height, 675)
})

test('마지막 조회의 cover path가 같을 때만 Notion cover 교체를 허용한다', () => {
  const initialUrl =
    'https://prod-files-secure.s3.us-west-2.amazonaws.com/path/cover-a.png?signature=first'
  const initialSource = getNotionCoverSource(initialUrl)
  assert.ok(initialSource)

  assert.equal(
    stillHasNotionCoverSource(
      {
        id: 'page-id',
        isDevelopmentLog: true,
        cover: {
          type: 'notion-file',
          url: `${initialUrl.replace('first', 'renewed')}`,
        },
      },
      initialSource.identity,
    ),
    true,
  )

  assert.equal(
    stillHasNotionCoverSource(
      {
        id: 'page-id',
        isDevelopmentLog: true,
        cover: {
          type: 'notion-file',
          url: initialUrl.replace('cover-a.png', 'cover-b.png'),
        },
      },
      initialSource.identity,
    ),
    false,
  )

  assert.equal(
    stillHasNotionCoverSource(
      {
        id: 'page-id',
        isDevelopmentLog: true,
        cover: { type: 'external', url: 'https://cdn.ddongmy.com/covers/page/hash.webp' },
      },
      initialSource.identity,
    ),
    false,
  )
})
