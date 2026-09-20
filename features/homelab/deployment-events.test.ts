import assert from 'node:assert/strict'
import test from 'node:test'
import deploymentHistory from '../../data/homelab/deployment-history.json'
import { formatDeploymentDuration } from './deployment-duration'
import { parseDeploymentEvents } from './deployment-events.server'

test('저장된 배포 이력이 공개 계약을 만족한다', () => {
  const deployments = parseDeploymentEvents(deploymentHistory)

  assert.ok(deployments.length > 0)
  assert.match(deployments[0].commitSha, /^[a-f0-9]{40}$/)
  assert.deepEqual(Object.keys(deployments[0].stages), [
    'githubPush',
    'githubActions',
    'ghcr',
    'argoCd',
    'k3sPodReady',
  ])
})

test('잘못된 SHA나 단계 상태가 있는 배포 이력을 거부한다', () => {
  assert.throws(() =>
    parseDeploymentEvents([
      {
        deployedAt: '2026-09-20T00:00:00.000Z',
        serviceName: 'ddongmy-os',
        commitSha: 'short-sha',
        status: 'success',
        stages: {},
      },
    ]),
  )
})

test('단계와 전체 배포 소요시간을 읽기 쉽게 표시한다', () => {
  assert.equal(
    formatDeploymentDuration('2026-09-20T00:00:00.000Z', '2026-09-20T00:02:05.000Z'),
    '2분 5초',
  )
  assert.equal(formatDeploymentDuration(null, '2026-09-20T00:02:05.000Z'), null)
})
