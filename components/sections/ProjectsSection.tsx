import { Project } from '@/types'
import ProjectCard from '@/components/ProjectCard'

const projects: Project[] = [
  {
    id: 'daily',
    name: '일상함',
    description: '개인 일상 관리 및 생산성 향상을 위한 웹 애플리케이션',
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    status: 'operational',
    link: 'https://daily.ddongmy.com',
  },
  {
    id: 'server-monitor',
    name: '홈서버 관제센터',
    description: '현재 사이트. 홈서버 상태 모니터링 및 포트폴리오 사이트',
    technologies: ['Next.js', 'TypeScript', 'Docker', 'Linux'],
    status: 'operational',
    link: 'https://www.ddongmy.com',
  },
  {
    id: 'webview-login',
    name: 'WebView Login 실험 프로젝트',
    description: '웹뷰 환경에서의 로그인 플로우 실험 및 테스트',
    technologies: ['React', 'WebView', 'TypeScript'],
    status: 'experimental',
  },
  {
    id: 'grooming-test',
    name: 'Grooming Test',
    description: '준비 중인 프로젝트',
    technologies: ['Next.js', 'TypeScript'],
    status: 'development',
  },
]

const statusLabels = {
  operational: '운영중',
  development: '개발중',
  experimental: '실험용',
}

const statusColors = {
  operational: 'bg-green-500/20 text-green-400',
  development: 'bg-yellow-500/20 text-yellow-400',
  experimental: 'bg-purple-500/20 text-purple-400',
}

export default function ProjectsSection() {
  return (
    <section id="projects" className="space-y-6">
      <h2 className="text-3xl font-bold">Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            statusLabel={statusLabels[project.status]}
            statusColor={statusColors[project.status]}
          />
        ))}
      </div>
    </section>
  )
}

