import type { ProjectSummary } from './project'

export const projects: readonly ProjectSummary[] = [
  {
    id: 'daily',
    name: '일상함',
    description: '개인 일상 관리와 생산성 향상을 위해 만든 웹 애플리케이션입니다.',
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    status: 'operational',
    isFeatured: true,
    siteUrl: 'https://daily.ddongmy.com',
  },
  {
    id: 'ddongmy-os',
    name: 'ddongmy-os',
    description: '포트폴리오와 개발 기록을 홈서버에서 직접 운영하는 현재 사이트입니다.',
    technologies: ['Next.js', 'React', 'Docker', 'K3s'],
    status: 'operational',
    isFeatured: true,
    siteUrl: 'https://ddongmy.com',
    githubUrl: 'https://github.com/dongmin3891/ddongmy-os',
  },
  {
    id: 'webview-login',
    name: 'WebView Login 실험 프로젝트',
    description: 'WebView 환경의 로그인 흐름과 브라우저 경계를 검증한 실험 프로젝트입니다.',
    technologies: ['React', 'WebView', 'TypeScript'],
    status: 'experimental',
    isFeatured: false,
  },
  {
    id: 'grooming-test',
    name: 'Grooming Test',
    description: '제품 아이디어와 사용자 흐름을 검증하고 있는 프로젝트입니다.',
    technologies: ['Next.js', 'TypeScript'],
    status: 'development',
    isFeatured: false,
  },
]

export const featuredProjects = projects.filter((project) => project.isFeatured)
