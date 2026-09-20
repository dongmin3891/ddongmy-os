import assert from 'node:assert/strict'
import test from 'node:test'
import { z } from 'zod'
import { parseNetdataChart } from './netdata-server-metrics.server'

test('Netdata chart rows are validated and ordered from oldest to newest', () => {
  const samples = parseNetdataChart({
    labels: ['time', 'used', 'free'],
    data: [
      [1_700_000_060, 40, 60],
      [1_700_000_000, 30, 70],
    ],
  })

  assert.deepEqual(
    samples.map((sample) => ({
      observedAt: sample.observedAt,
      used: sample.values.get('used'),
    })),
    [
      { observedAt: '2023-11-14T22:13:20.000Z', used: 30 },
      { observedAt: '2023-11-14T22:14:20.000Z', used: 40 },
    ],
  )
})

test('Netdata chart rejects rows that do not match the labels', () => {
  assert.throws(
    () =>
      parseNetdataChart({
        labels: ['time', 'used'],
        data: [[1_700_000_000]],
      }),
    /labels and values do not match/,
  )
})

test('Netdata chart rejects a non-numeric timestamp', () => {
  assert.throws(
    () =>
      parseNetdataChart({
        labels: ['time', 'used'],
        data: [[null, 30]],
      }),
    /observation time/,
  )
})

test('Netdata chart rejects an invalid response contract', () => {
  assert.throws(
    () => parseNetdataChart({ labels: ['time'], data: [] }),
    z.ZodError,
  )
})
