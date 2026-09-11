import type { Metadata } from 'next'
import AboutSection from '@/components/sections/AboutSection'
import ContactSection from '@/components/sections/ContactSection'
import HeroSection from '@/components/sections/HeroSection'
import ProjectsSection from '@/components/sections/ProjectsSection'
import SkillsSection from '@/components/sections/SkillsSection'
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
    <div className="space-y-24">
      <HeroSection />
      <ProjectsSection />
      <AboutSection />
      <SkillsSection />
      <ContactSection />
    </div>
  )
}
