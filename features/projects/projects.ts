import type { ProjectCaseStudy } from './project'

export const projects: readonly ProjectCaseStudy[] = [
  {
    slug: 'ddongmy-os',
    name: 'ddongmy-os',
    description: '포트폴리오와 개발 기록을 홈서버에서 직접 운영하는 현재 사이트입니다.',
    technologies: ['Next.js', 'TypeScript', 'K3s', 'Argo CD', 'Cloudflare R2'],
    status: 'operational',
    category: 'platform',
    featuredOrder: 1,
    challenge:
      '콘텐츠를 빠르게 발행하면서도 이미지 처리 비용을 사용자 요청에서 분리하고, 홈서버의 배포 상태와 장애 원인을 안전하게 관찰할 수 있어야 했습니다.',
    approach:
      'Next.js 애플리케이션과 Notion CMS를 연결하고, 이미지 가공은 Webhook 시점으로 옮겼습니다. 배포는 commit SHA 기반 GitOps로 통일하고 Kubernetes 조회 권한은 내부 exporter로 격리했습니다.',
    scope: [
      '포트폴리오와 Development Log 화면',
      'Notion Webhook과 R2 이미지 파이프라인',
      'GitHub Actions · Argo CD 기반 배포',
      'K3s 상태 조회와 운영 대시보드',
    ],
    decisions: [
      {
        title: '이미지 가공을 쓰기 시점으로 이동',
        description:
          'Notion cover를 Webhook에서 WebP로 변환해 R2에 저장하고, 방문자는 Cloudflare CDN에서 완성된 이미지를 직접 받도록 구성했습니다.',
      },
      {
        title: '배포 상태를 commit SHA로 연결',
        description:
          'GitHub Actions가 이미지를 만들고 manifest의 SHA를 갱신하면 Argo CD가 원하는 상태를 K3s에 반영하도록 흐름을 통일했습니다.',
      },
      {
        title: 'Kubernetes 권한을 앱에서 분리',
        description:
          'web-app의 ServiceAccount token을 비활성화하고, 최소 조회 권한만 가진 내부 status-exporter가 공개 가능한 상태만 전달합니다.',
      },
    ],
    links: [
      { label: 'Home Lab', href: '/lab' },
      { label: 'Architecture', href: '/lab/architecture' },
      {
        label: 'GitHub',
        href: 'https://github.com/dongmin3891/ddongmy-os',
        isExternal: true,
      },
    ],
  },
  {
    slug: 'iwtc',
    name: 'IWTC',
    description:
      '이미지, 영상과 YouTube 후보로 이상형 월드컵을 만들고 플레이하는 웹 서비스입니다.',
    technologies: ['Next.js', 'TypeScript', 'NestJS', 'PostgreSQL', 'K3s'],
    status: 'development',
    category: 'product',
    featuredOrder: 2,
    challenge:
      '이미지, MP4와 YouTube처럼 성격이 다른 후보를 하나의 토너먼트 흐름에서 안정적으로 재생하고, 탐색부터 제작과 관리까지 이어지는 경험이 필요했습니다.',
    approach:
      '프론트엔드의 게임 규칙과 API 상태를 분리해 테스트 가능한 구조로 정리하고, 기존 API는 NestJS와 PostgreSQL 기반으로 다시 구축해 인증과 미디어 저장 경계를 명확히 만들고 있습니다.',
    scope: [
      '월드컵 탐색 · 라운드 선택 · 토너먼트 플레이',
      '이미지 · MP4 · YouTube 후보 처리',
      '회원 인증과 월드컵 제작 · 관리',
      'NestJS API · PostgreSQL · 오브젝트 스토리지',
    ],
    decisions: [
      {
        title: '게임 규칙을 화면 밖으로 분리',
        description:
          '후보 선택, 라운드 전환과 순위 계산을 순수 로직으로 분리해 UI 변경과 관계없이 핵심 규칙을 검증할 수 있게 했습니다.',
      },
      {
        title: '동시 인증 갱신을 한 번으로 수렴',
        description:
          '여러 요청이 동시에 만료돼도 refresh 요청은 한 번만 실행하고, 대기 중인 원래 요청이 같은 결과를 공유하도록 구성했습니다.',
      },
      {
        title: 'API와 데이터 기반을 새로 구축',
        description:
          'NestJS, Prisma와 PostgreSQL로 API 계약을 다시 구현하고 refresh token rotation과 미디어 오브젝트 저장 경계를 서버에서 관리합니다.',
      },
    ],
    links: [
      { label: '서비스', href: 'https://iwtc.ddongmy.com', isExternal: true },
      {
        label: 'Frontend',
        href: 'https://github.com/dongmin3891/iwtc-frontend-new',
        isExternal: true,
      },
      {
        label: 'Backend',
        href: 'https://github.com/dongmin3891/iwtc-backend-nest',
        isExternal: true,
      },
    ],
  },
]

export const featuredProjects = projects
  .filter((project) => project.featuredOrder !== undefined)
  .toSorted((first, second) =>
    (first.featuredOrder ?? Number.POSITIVE_INFINITY) -
    (second.featuredOrder ?? Number.POSITIVE_INFINITY),
  )

export function findProject(slug: string) {
  return projects.find((project) => project.slug === slug)
}
