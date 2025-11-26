export default function AboutSection() {
  const keywords = [
    'Next.js',
    'React',
    'TypeScript',
    'Docker',
    'WebView',
    '홈서버',
    '사이드프로젝트',
  ]

  return (
    <section id="about" className="space-y-6">
      <h2 className="text-3xl font-bold">About Me</h2>
      <div className="space-y-4 text-slate-300 leading-relaxed">
        <p>
          프론트엔드 개발자로서 사용자 경험을 중시하며, 일상의 불편함을 해결하는
          사이드 프로젝트를 개발하고 있습니다. OTT 서비스, 웹뷰 앱, 개인 생산성
          앱 등 다양한 분야의 프로젝트를 경험했습니다.
        </p>
        <p>
          미니PC 홈서버를 운영하며 Docker 기반의 인프라를 직접 구축하고 관리하고
          있습니다. 개발뿐만 아니라 서버 운영과 인프라 관리에도 관심이 많습니다.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 pt-4">
        {keywords.map((keyword) => (
          <span
            key={keyword}
            className="px-3 py-1 bg-slate-800 text-accent-400 rounded-full text-sm font-medium"
          >
            {keyword}
          </span>
        ))}
      </div>
    </section>
  )
}

