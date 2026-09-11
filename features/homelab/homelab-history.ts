export type DeploymentRecord = {
  releaseSha: string
  deployedAt: string
  title: string
  summary: string
}

export type HomelabIncident = {
  id: string
  occurredAt: string
  title: string
  symptom: string
  cause: string
  resolution: string
  developmentLogHref: string
}

export type HomelabChange = {
  period: string
  title: string
  summary: string
}

export const recentDeployments: readonly DeploymentRecord[] = [
  {
    releaseSha: 'a9f137a',
    deployedAt: '2026-09-11T20:28:12+09:00',
    title: '개발 로그 SEO 완성',
    summary: 'canonical, Open Graph, sitemap과 Article JSON-LD를 운영에 반영했습니다.',
  },
  {
    releaseSha: 'c37f76c',
    deployedAt: '2026-09-11T17:08:16+09:00',
    title: '개발 로그 Mermaid 지원',
    summary: 'Notion 본문의 Mermaid 코드 블록을 읽을 수 있는 다이어그램으로 렌더링합니다.',
  },
  {
    releaseSha: '456fd97',
    deployedAt: '2026-09-11T12:06:57+09:00',
    title: 'Next.js와 React 업그레이드',
    summary: 'Next.js 16.3.4와 React 19.3.0 안정 버전으로 운영 런타임을 갱신했습니다.',
  },
]

export const homelabIncidents: readonly HomelabIncident[] = [
  {
    id: 'kubernetes-oomkilled',
    occurredAt: '2026-09-08',
    title: 'Kubernetes OOMKilled 반복 재시작',
    symptom: 'web-app Pod가 메모리 한도를 초과하며 반복해서 재시작했습니다.',
    cause: '컨테이너 내부의 비정상 프로세스가 메모리를 점유해 cgroup 한도를 초과했습니다.',
    resolution: 'Next.js 보안 패치와 clean image rebuild 후 Pod를 교체하고 runtime memory 확인을 추가했습니다.',
    developmentLogHref: '/log/kubernetes-oomkilled',
  },
]

export const homelabChanges: readonly HomelabChange[] = [
  {
    period: '2026.09.06',
    title: 'Docker에서 K3s로 이전',
    summary: 'Kubernetes manifest와 Traefik Ingress를 도입해 애플리케이션 실행 경계를 선언적으로 관리하기 시작했습니다.',
  },
  {
    period: '2026.09.06',
    title: 'GHCR · GitHub Actions · Argo CD 연결',
    summary: 'main push부터 이미지 빌드, manifest 갱신과 K3s rollout까지 이어지는 배포 흐름을 만들었습니다.',
  },
  {
    period: '2026.09.07',
    title: 'Deployment 운영 안정화',
    summary: 'startup, readiness, liveness probe와 resource limit, rolling update, non-root 실행을 적용했습니다.',
  },
  {
    period: '2026.09.08',
    title: '장애 측정과 런타임 보강',
    summary: 'OOMKilled 원인을 프로세스와 cgroup 단위로 좁히고 보안 패치와 runtime memory 확인 기준을 세웠습니다.',
  },
  {
    period: '2026.09.11',
    title: 'Notion Dev Log와 Live Status 공개',
    summary: 'Notion 기반 개발 기록과 최소 권한 Kubernetes 상태 조회를 사이트에 연결했습니다.',
  },
]
