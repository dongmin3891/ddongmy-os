'use client'

export default function HeroSection() {
  const scrollToProjects = () => {
    const projectsSection = document.getElementById('projects')
    projectsSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="pt-16 pb-8">
      <div className="space-y-6">
        <h1 className="text-5xl lg:text-6xl font-bold text-balance">
          프론트엔드 개발자{' '}
          <span className="text-primary-400">천재동민</span>
        </h1>
        <p className="text-xl lg:text-2xl text-slate-300 text-balance">
          일상을 편하게 만드는 사이드 프로젝트를 좋아하는 프론트엔드 개발자
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
          <button
            onClick={scrollToProjects}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
          >
            프로젝트 보러가기
          </button>
          <a
            href="https://daily.ddongmy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            일상함 바로가기
          </a>
        </div>
      </div>
    </section>
  )
}

