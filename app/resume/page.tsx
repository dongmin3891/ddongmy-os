import type { Metadata } from 'next'
import Link from 'next/link'
import PrintButton from './PrintButton'
import styles from './resume.module.css'

export const metadata: Metadata = {
  title: '김동민 | Frontend Engineer 이력서',
  description:
    '상용 웹·WebView의 성능 개선, 서비스 전환과 운영 안정화 경험을 정리한 김동민의 이력서입니다.',
  alternates: { canonical: '/resume' },
  openGraph: {
    title: '김동민 | Frontend Engineer',
    description: '대규모 상용 서비스의 성능·전환·운영 문제를 해결합니다.',
    url: '/resume',
    type: 'profile',
  },
}

const cases = [
  {
    title: '홈 성능 개선과 App Router 이관',
    detail: 'CSR → SSR Prefetch·Hydration · LCP 단계별 측정',
    href: '/log/utv-mobile-home-performance-app-router',
  },
  {
    title: 'SSR V8 Heap OOM 분석',
    detail: 'QueryClient 요청 단위 격리와 서버 gcTime 정책',
    href: '/log/nextjs-ssr-queryclient-gctime-oom',
  },
  {
    title: 'TanStack Query v5와 iOS 14 WebView',
    detail: '77개 파일의 데이터 계층 전환과 빌드 호환성',
    href: '/log/moatv-tanstack-query-v5-ios14-webview',
  },
  {
    title: 'MobX autorun 메모리 누수 개선',
    detail: '생명주기 정리와 서비스 종료 후 독립 재현 검증',
    href: '/log/mobiletv-mobx-autorun-memory-leak',
  },
  {
    title: 'Notion 커버의 첫 로딩 병목 개선',
    detail: '요청 시 변환 → Webhook·R2 CDN',
    href: '/log/notion-cover-r2-webhook-image-loading-retrospective',
  },
] as const

const otherProjects = [
  {
    name: 'AI 학습 챗봇·RAG',
    period: '2026.05',
    role: '프론트엔드 개발·성능 검증 참여',
    tech: 'Next.js · Python · Qdrant · KaTeX',
    bullets: [
      '수학 문항의 Markdown·LaTeX를 정규화하고 KaTeX로 렌더링.',
      '임베딩·Hybrid Retrieval의 검색 품질과 LLM 평균·p95 지연시간 비교.',
    ],
  },
  {
    name: '미래엔 Commerce V2',
    period: '2025.01–2025.02',
    role: '구매·정기결제 담당',
    tech: 'Vue 3 · TypeScript · Pinia',
    bullets: [
      '구매·구독 변경·철회 흐름을 결제 상태 기준으로 정리.',
      '결제 서버 장애와 사용자 입력 오류의 안내를 분리.',
    ],
  },
  {
    name: '미래엔 초코툰·LCMS',
    period: '2024.11–2024.12',
    role: '뷰어·전시 관리 담당',
    tech: 'Next.js 14·15 · TanStack Query v5 · Zustand',
    bullets: [
      '뷰어 복귀 시 선택한 권과 슬라이드 위치를 복원.',
      '4개 LCMS 전시 영역의 검색·등록 팝업과 입력 검증을 공통화.',
    ],
  },
  {
    name: 'U+ ITGO',
    period: '2024.04–2024.11',
    role: '라우팅·배차 UI·캐시 담당',
    tech: 'Next.js 14 · TanStack Query v5 · MUI',
    bullets: [
      '권한별 라우팅과 드래그앤드롭 배차 관리 흐름 구현.',
      '취소·재배차 후 목록·상세 불일치를 캐시 무효화 정책으로 개선.',
    ],
  },
  {
    name: 'LG U+ SOHO',
    period: '2021.06–2022.04',
    role: '인증·매장 전환 담당',
    tech: 'React 17 · JavaScript · MobX 6',
    bullets: [
      '계정 상태별 인증 흐름과 고객·매장 관리 기능 구현.',
      '매장 식별 기준과 초기화 순서를 정리해 이전 매장 데이터 잔존 해결.',
    ],
  },
] as const

export default function ResumePage() {
  return (
    <div className={styles.resume}>
      <a className={styles.skip} href="#resume-content">
        본문으로 건너뛰기
      </a>
      <div className={styles.toolbar}>
        <Link href="/">ddongmy.com</Link>
        <PrintButton />
      </div>
      <main id="resume-content" className={styles.sheet}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>KIM DONGMIN / FRONTEND ENGINEER</p>
          <h1>
            김동민<span>Frontend Engineer</span>
          </h1>
          <p className={styles.headline}>
            대규모 상용 서비스의
            <br className={styles.desktopBreak} /> 성능·전환·운영 문제를
            해결합니다.
          </p>
          <p className={styles.intro}>
            6명 규모 스타트업에 합류해 5년간 재직하며 40명 이상의 조직으로
            성장하는 과정을 경험했습니다. 미디어·물류·커머스·교육의
            사용자·운영자 서비스를 개발하고, 작은 팀의 제품 구축부터 대규모 상용
            서비스의 성능 개선과 전환까지 함께했습니다.
          </p>
          <address className={styles.contacts}>
            <a href="mailto:rlaehdals224@gmail.com">rlaehdals224@gmail.com</a>
            <a href="https://github.com/dongmin3891">GitHub ↗</a>
            <Link href="/log">기술 기록 ↗</Link>
          </address>
        </header>
        <section aria-label="핵심 수치" className={styles.metrics}>
          <div>
            <p className={styles.metricValue}>
              50만<span>+</span>
            </p>
            <h2>U+tv모바일 다운로드</h2>
            <p>현재 Google Play 누적 다운로드</p>
            <a href="https://play.google.com/store/apps/details?id=com.lguplus.remocon&hl=ko">
              서비스 규모 · 2026.11 확인 ↗
            </a>
          </div>
          <div>
            <p className={styles.metricValue}>
              89<span>%</span>
            </p>
            <h2>LCP 단축</h2>
            <p>12.2초 → 1.3초</p>
            <small>
              기존 U+모아tv · 개발·QA 환경
              <br />
              Lighthouse 단계별 개선 기록
            </small>
          </div>
          <div>
            <p className={styles.metricValue}>
              약 40<span>%</span>
            </p>
            <h2>JS Heap 감소</h2>
            <p>154.8MB → 93.2MB</p>
            <small>
              U+tv모바일 · 동일 로컬 반복 요청
              <br />
              Node.js heapUsed 안정 구간 비교
            </small>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="strengths">
          <p className={styles.eyebrow}>STRENGTHS</p>
          <h2 id="strengths">문제를 재현하고, 결과로 설명합니다.</h2>
          <div className={styles.strengths}>
            <div>
              <h3>성능을 수치로 개선</h3>
              <p>
                Lighthouse·메모리 계측으로 병목을 좁히고, 환경과 측정 조건을
                구분해 결과를 검증합니다.
              </p>
            </div>
            <div>
              <h3>운영 중인 서비스를 전환</h3>
              <p>
                Pages Router → App Router·FSD, React Query v3 → TanStack Query
                v5 전환에 참여했습니다.
              </p>
            </div>
            <div>
              <h3>다양한 브라우저·WebView 환경 대응</h3>
              <p>
                모바일 Safari·Chrome·iOS WebView 등 다양한 실행 환경에서
                서비스를 개발하고, 브라우저별 호환성과 동작 차이에 대응했습니다.
              </p>
            </div>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="service-flow">
          <p className={styles.eyebrow}>SERVICE CONTEXT</p>
          <h2 id="service-flow">이름이 비슷하지만, 다른 서비스입니다.</h2>
          <div className={styles.timeline}>
            <div>
              <h3>기존 U+모바일tv</h3>
              <p>별도 레거시 앱 · 운영 당시 Google Play 1,000만+ 다운로드</p>
              <span>
                운영·WebView 안정화 → 단계적 종료·U+tv모바일로 고객 이관
              </span>
            </div>
            <div>
              <h3>기존 U+모아tv → U+tv모바일</h3>
              <p>
                콘텐츠 탐색·셋톱박스 연동 → 웹·앱 서비스 재구축·명칭 변경 출시
              </p>
              <span>2023.09 운영·고도화 → 2025.09부터 전환 구축 병행</span>
            </div>
          </div>
          <p className={styles.note}>
            기간은 개인 참여 기준입니다. 2025.09–2026.04에는 기존 모아tv 운영과
            차세대 구축을 병행했습니다. 다운로드는 서비스 규모이며 개인 성과나
            활성 사용자 수가 아닙니다.
          </p>
        </section>
        <section className={styles.section} aria-labelledby="experience">
          <p className={styles.eyebrow}>EXPERIENCE</p>
          <h2 id="experience">대표 경력</h2>
          <p className={styles.company}>
            KIINS · Frontend Engineer{' '}
            <span>2021.06–현재 · 상용 웹·WebView 개발·운영</span>
          </p>
          <article className={styles.project}>
            <p className={styles.period}>2023.09–현재</p>
            <h3>
              기존 U+모아tv 운영·고도화 및<br />
              U+tv모바일 전환 구축·운영
            </h3>
            <p className={styles.role}>
              담당: 홈 성능·데이터 계층·WebView 호환성·SSR 메모리 분석
            </p>
            <p className={styles.tech}>
              Next.js 12 → 16 · React 18 → 19 · TypeScript · TanStack Query ·
              Zustand · EKS
            </p>
            <p className={styles.role}>
              기존 U+모바일tv의 단계적 종료에 맞춰 U+tv모바일로 고객 이관을
              담당했습니다.
            </p>
            <ul>
              <li>
                <strong>LCP 12.2초 → 1.3초:</strong> CSR → SSR
                Prefetch·Hydration, 화면 밖 지연 로딩과 첫 배너 우선 요청으로
                개선.
              </li>
              <li>
                <strong>React Query v3 → TanStack Query v5:</strong> 77개 파일의
                Query Hook·SSR Hydration·Infinite Query·캐시 무효화 규격 이관.
                패키지 Transpile·Babel로 iOS 14 WebView 호환성 보완.
              </li>
              <li>
                <strong>Pages Router → App Router·FSD:</strong> 팀 전환에 참여해
                담당 영역의 책임을 분리. 상단 4개 패널 SSR과 뷰포트 400px 전
                지연 조회, 개인화 Query Key·Hydration 정합성 개선.
              </li>
              <li>
                <strong>SSR heapUsed 약 40% 감소:</strong> V8 OOM·재시작을
                계측하고 팀과 QueryClient 요청 단위 격리. 직접 담당한 서버
                캐시·Prefetch 경로의 gcTime을 Infinity로 조정.
              </li>
            </ul>
            <p className={styles.note}>
              LCP는 개발·QA Lighthouse 단계별 결과, Heap은 동일 로컬 반복 요청의
              안정 구간 비교입니다. QueryClient 공유 가능성과 캐시 timer는 주요
              원인 후보이며 단일 원인으로 단정하지 않습니다.
            </p>
            <div className={styles.projectLinks}>
              {cases.slice(0, 3).map((item) => (
                <Link href={item.href} key={item.href}>
                  {item.title} ↗
                </Link>
              ))}
            </div>
          </article>
          <article className={styles.project}>
            <p className={styles.period}>2022.05–2023.09</p>
            <h3>기존 U+모바일tv 운영 및 WebView 안정화</h3>
            <p className={styles.role}>
              담당: Native Bridge·인증·결제·운영 장애 대응
            </p>
            <p className={styles.tech}>
              Next.js 6 · React 16 · TypeScript · MobX · Express · Native Bridge
            </p>
            <ul>
              <li>
                <strong>WebView↔Native 상태 일관성:</strong> 인증·재생·외부 이동
                이벤트 규격과 플랫폼별 도착 순서·화면 복원 차이 대응.
              </li>
              <li>
                <strong>구매·본인인증 흐름 구현:</strong> Google
                IAP·네이버페이·카카오페이의 상태·오류 분기와 KMC 완료·취소·실패
                처리.
              </li>
              <li>
                <strong>반복 화면 전환 종료 원인 추적:</strong> MobX autorun
                disposer 누락에 따른 reaction 누적을 확인하고 생명주기 정리 로직
                개선.
              </li>
              <li>
                <strong>독립 환경 1,000회 재현:</strong> 서비스 종료 후 MobX
                4.9.2 동일 패턴에서 잔존 reaction·추가 callback 0건, GC 후 Heap
                기준선 회복 확인.
              </li>
            </ul>
            <p className={styles.note}>
              1,000회·0건은 서비스 종료 후 독립 재현 결과이며 운영 환경의
              측정값이 아닙니다.
            </p>
            <div className={styles.projectLinks}>
              <Link href={cases[3].href}>MobX 메모리 누수 개선 사례 ↗</Link>
            </div>
          </article>
        </section>
        <section className={styles.section} aria-labelledby="commercial">
          <p className={styles.eyebrow}>MORE COMMERCIAL WORK</p>
          <h2 id="commercial">다른 도메인에서도, 같은 문제 해결 방식으로.</h2>
          <div className={styles.cards}>
            {otherProjects.map((item) => (
              <article key={item.name}>
                <p className={styles.period}>{item.period}</p>
                <h3>{item.name}</h3>
                <p className={styles.role}>{item.role}</p>
                <ul>
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <p className={styles.tech}>{item.tech}</p>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.section} aria-labelledby="side">
          <p className={styles.eyebrow}>SELECTED SIDE PROJECTS</p>
          <h2 id="side">직접 만들고, 계속 운영합니다.</h2>
          <article className={styles.project}>
            <p className={styles.period}>
              2023.10–2024.04 개발 · 2026.09 운영·고도화
            </p>
            <h3>IWTC 이상형 월드컵</h3>
            <p className={styles.role}>
              프론트엔드 전담 → 홈서버 운영·배포·자동화 확장
            </p>
            <p className={styles.tech}>
              Next.js 13 · React 18 · TanStack Query · React Spring · K3s · Argo
              CD
            </p>
            <ul>
              <li>
                <strong>추가 미디어 요청 최대 40회 → 0회:</strong> 목록 응답에
                미디어를 포함하도록 API 계약과 화면 매핑 개선.
              </li>
              <li>
                <strong>고정 대기 1,000ms → 약 336–342ms:</strong> 실제 Spring
                완료 시점에 다음 대결로 전환하고 WebKit 렌더 회귀 수정.
              </li>
              <li>
                게임·관리 로직을 순수 함수로 분리하고 76개 단위 테스트 및
                CI·GitOps 배포 검증 적용.
              </li>
            </ul>
            <p className={styles.note}>
              수치는 2026.09 프로젝트 문서의 검증 기록 기준입니다.
            </p>
            <div className={styles.projectLinks}>
              <a href="https://iwtc.ddongmy.com">서비스 ↗</a>
              <Link href="/projects/iwtc">상세 사례 ↗</Link>
              <a href="https://github.com/dongmin3891/iwtc-frontend-new">
                GitHub ↗
              </a>
            </div>
          </article>
          <article className={styles.project}>
            <h3>ddongmy-os</h3>
            <p className={styles.role}>
              1인 설계·개발·운영 · 포트폴리오·기술 블로그·홈서버 상태 페이지
            </p>
            <p className={styles.tech}>
              Next.js · TypeScript · Notion CMS · Cloudflare R2·Workers · K3s
            </p>
            <ul>
              <li>
                <strong>요청 시 이미지 변환 → Webhook·R2 CDN:</strong> Notion
                원본 다운로드와 Sharp 변환을 방문 요청 경로에서 분리.
              </li>
              <li>
                <strong>공개 앱의 클러스터 조회 권한 제거:</strong> 내부
                status-exporter가 공개 DTO만 전달하도록 수집 책임 분리.
              </li>
            </ul>
            <div className={styles.projectLinks}>
              <Link href="/projects/ddongmy-os">상세 사례 ↗</Link>
              <Link href={cases[4].href}>이미지 처리 회고 ↗</Link>
              <a href="https://github.com/dongmin3891/ddongmy-os">GitHub ↗</a>
            </div>
          </article>
        </section>
        <section className={styles.section} aria-labelledby="open-source">
          <p className={styles.eyebrow}>OPEN SOURCE</p>
          <h2 id="open-source">실무의 문제를 재사용 가능한 도구로.</h2>
          <article className={styles.project}>
            <h3>
              next-manual-
              <wbr />
              scroll-restoration
            </h3>
            <p className={styles.role}>
              Next.js App Router용 수동 스크롤 복원 Hook 개발·공개
            </p>
            <p className={styles.tech}>
              TypeScript · React · Next.js App Router · MIT
            </p>
            <ul>
              <li>
                History API에서 이동 직전 위치와 탐색 유형을 기록하고, 신규 경로
                진입·뒤로가기·쿼리 변경별 스크롤 정책을 분리.
              </li>
              <li>
                ResizeObserver로 문서 높이 변화를 감지해 데이터·이미지가 늦게
                렌더링되는 화면에서도 제한 시간 내 스크롤 복원 재시도.
              </li>
              <li>
                경로별 복원 정책과 저장소 교체 인터페이스, LRU 보관 한도, 다음
                탐색의 스크롤 유지 API를 제공해 서비스별 요구 대응.
              </li>
            </ul>
            <div className={styles.projectLinks}>
              <a href="https://github.com/dongmin3891/next-manual-scroll-restoration">
                GitHub · 소스 코드 ↗
              </a>
              <a href="https://github.com/dongmin3891/next-manual-scroll-restoration/blob/main/README.ko.md">
                사용법·지원 범위 ↗
              </a>
            </div>
          </article>
        </section>
        <section className={styles.section} aria-labelledby="cases">
          <p className={styles.eyebrow}>ENGINEERING NOTES</p>
          <h2 id="cases">상세 기술 사례</h2>
          <div className={styles.caseList}>
            {cases.map((item) => (
              <Link href={item.href} key={item.href}>
                <strong>{item.title} ↗</strong>
                <span>{item.detail}</span>
                <small>ddongmy.com{item.href}</small>
              </Link>
            ))}
          </div>
        </section>
        <footer className={styles.footer}>
          <span>김동민 · Frontend Engineer</span>
          <a href="mailto:rlaehdals224@gmail.com">rlaehdals224@gmail.com</a>
          <span>내용 확인 · 2026.11</span>
        </footer>
      </main>
    </div>
  )
}
