import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '천재동민 | 프론트엔드 개발자 포트폴리오',
  description: '일상을 편하게 만드는 사이드 프로젝트를 좋아하는 프론트엔드 개발자',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-900 text-slate-100">
        {children}
      </body>
    </html>
  )
}

