import type { Metadata } from 'next'
import EngineeringProofSection from '@/components/sections/EngineeringProofSection'
import ExploreSection from '@/components/sections/ExploreSection'
import HeroSection from '@/components/sections/HeroSection'
import ProjectsSection from '@/components/sections/ProjectsSection'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    locale: 'ko_KR',
    siteName: siteConfig.name,
    title: `${siteConfig.name} | 프론트엔드 개발자`,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary',
    title: `${siteConfig.name} | 프론트엔드 개발자`,
    description: siteConfig.description,
  },
}

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-20">
      <HeroSection />
      <EngineeringProofSection />
      <ProjectsSection />
      <ExploreSection />
    </div>
  )
}
