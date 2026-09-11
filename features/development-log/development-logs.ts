import type { DevelopmentLogSummary } from './development-log'

export const developmentLogs: readonly DevelopmentLogSummary[] = [
  {
    slug: 'kubernetes-oomkilled',
    title: 'Kubernetes OOMKilled를 추적한 기록',
    summary: 'Next.js 메모리 누수라는 첫 가설에서 출발해 컨테이너 프로세스와 cgroup 한도를 확인한 과정입니다.',
    tags: ['Kubernetes', 'Next.js', 'Incident'],
    status: 'draft',
    topics: ['반복 재시작 증상', '메모리 사용 프로세스 확인', '보안 패치와 이미지 교체'],
  },
  {
    slug: 'argocd-web-terminal',
    title: 'Argo CD Web Terminal과 RBAC 구성',
    summary: '운영 편의성과 최소 권한 원칙을 함께 지키기 위해 Web Terminal 접근 범위를 설계한 기록입니다.',
    tags: ['Argo CD', 'RBAC', 'K3s'],
    status: 'draft',
    topics: ['접근 요구사항', 'ServiceAccount와 RBAC 범위', '운영 검증'],
  },
  {
    slug: 'cloudflare-access-oidc',
    title: 'Cloudflare Access와 Google OIDC 연결',
    summary: '홈서버 관리 화면을 공개 인터넷에 직접 노출하지 않고 인증 경계를 추가한 과정입니다.',
    tags: ['Cloudflare', 'OIDC', 'Security'],
    status: 'draft',
    topics: ['보호할 경로', 'OIDC 로그인 흐름', '접근 정책 확인'],
  },
]

export function findDevelopmentLog(slug: string) {
  return developmentLogs.find((log) => log.slug === slug)
}
