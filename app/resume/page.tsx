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
    title: '홈 성능 개선과 App Router 전환',
    detail:
      '선별 SSR 범위와 이미지 우선순위를 설계하고 Lighthouse·RUM을 분리 검증한 과정',
    href: '/log/utv-mobile-home-performance-app-router',
  },
  {
    title: 'SSR V8 Heap OOM과 캐시 생명주기',
    detail:
      'Pod 재시작 계측부터 QueryClient·gcTime 가설과 로컬 Heap 검증까지',
    href: '/log/nextjs-ssr-queryclient-gctime-oom',
  },
  {
    title: 'TanStack Query v5와 iOS 14 WebView',
    detail:
      'Query Key·SSR Prefetch·Infinite Query 동작을 보존하며 77개 파일을 전환한 기준',
    href: '/log/moatv-tanstack-query-v5-ios14-webview',
  },
  {
    title: 'MobX autorun 메모리 누수 개선',
    detail:
      'autorun 제거·복원 실험과 1,000회 재현으로 disposer 누적을 검증한 과정',
    href: '/log/mobiletv-mobx-autorun-memory-leak',
  },
  {
    title: 'Notion 커버의 첫 로딩 병목 개선',
    detail:
      '첫 요청 경로를 추적해 변환 시점을 옮기고 SSRF·경쟁 조건을 막은 설계',
    href: '/log/notion-cover-r2-webhook-image-loading-retrospective',
  },
] as const

const experienceRoles = [
  {
    name: 'AI 학습 챗봇·RAG',
    period: '2026.05',
    role: '프론트엔드 개발·성능 검증 참여',
    tech: 'Next.js · Python · Qdrant · KaTeX',
    detail:
      '수학 문항의 Markdown·LaTeX 렌더링과 Hybrid Retrieval 검색 품질·지연시간 비교',
  },
  {
    name: 'U+tv모바일 전환 구축·운영',
    period: '2025.09–현재',
    role: '홈 성능·데이터 계층·WebView 호환성·SSR 메모리 분석과 고객 이관',
    tech: 'Next.js 16 · React 19 · TypeScript · TanStack Query · Zustand · EKS',
    detail: '기존 U+모아tv의 차세대 전환 구축과 U+tv모바일 출시·운영',
  },
  {
    name: '미래엔 Commerce V2',
    period: '2025.01–2025.02',
    role: '구매·정기결제 담당',
    tech: 'Vue 3 · TypeScript · Pinia',
    detail: '구매·구독 변경·철회 흐름과 결제 서버·사용자 입력 오류 안내 분리',
  },
  {
    name: '미래엔 초코툰·LCMS',
    period: '2024.11–2024.12',
    role: '뷰어·전시 관리 담당',
    tech: 'Next.js 14·15 · TanStack Query v5 · Zustand',
    detail: '뷰어 위치 복원과 4개 LCMS 전시 영역의 검색·등록 흐름 공통화',
  },
  {
    name: 'U+ ITGO',
    period: '2024.04–2024.11',
    role: '라우팅·배차 UI·캐시 담당',
    tech: 'Next.js 14 · TanStack Query v5 · MUI',
    detail: '권한별 라우팅·배차 관리와 취소·재배차 후 캐시 정합성 개선',
  },
  {
    name: '기존 U+모아tv 운영·고도화',
    period: '2023.09–2026.04',
    role: '홈 성능·렌더링 전략·데이터 계층 전환 담당',
    tech: 'Next.js 12 → 16 · React 18 → 19 · TanStack Query · Zustand',
    detail:
      '운영·고도화와 App Router·TanStack Query 전환, 2025.09부터 차세대 구축 병행',
  },
  {
    name: '기존 U+모바일tv 운영·WebView 안정화',
    period: '2022.05–2023.09',
    role: 'Native Bridge·WebView 운영 장애 대응',
    tech: 'Next.js 6 · React 16 · TypeScript · MobX · Express',
    detail: '별도 레거시 앱 운영과 단계적 종료, U+tv모바일로 고객 이관',
  },
  {
    name: 'LG U+ SOHO',
    period: '2021.06–2022.04',
    role: '인증·매장 전환 담당',
    tech: 'React 17 · JavaScript · MobX 6',
    detail: '계정 상태별 인증과 고객·매장 관리, 이전 매장 데이터 잔존 해결',
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
        <section className={styles.section} aria-labelledby="skills">
          <p className={styles.eyebrow}>CORE SKILLS</p>
          <h2 id="skills">실무에서 검증한 기술을 중심으로.</h2>
          <dl className={styles.skills}>
            <div>
              <dt>Frontend</dt>
              <dd>React · Next.js · TypeScript</dd>
            </div>
            <div>
              <dt>Data &amp; State</dt>
              <dd>TanStack Query · Zustand · MobX</dd>
            </div>
            <div>
              <dt>Runtime &amp; Platform</dt>
              <dd>SSR · WebView · Node.js · EKS</dd>
            </div>
          </dl>
        </section>
        <section className={styles.section} aria-labelledby="experience">
          <p className={styles.eyebrow}>EXPERIENCE</p>
          <h2 id="experience">
            대표 경력 <span className={styles.headingMeta}>총 5년 5개월</span>
          </h2>
          <p className={styles.company}>
            KIINS · Frontend Engineer{' '}
            <span>2021.06–현재 · 상용 웹·WebView 개발·운영</span>
          </p>
          <div className={styles.experienceList}>
            {experienceRoles.map((item) => (
              <article key={`${item.period}-${item.name}`}>
                <p className={styles.period}>{item.period}</p>
                <div>
                  <h3>{item.name}</h3>
                  <p className={styles.role}>{item.role}</p>
                  <p className={styles.experienceDetail}>{item.detail}</p>
                  <p className={styles.tech}>{item.tech}</p>
                </div>
              </article>
            ))}
          </div>
          <p className={styles.note}>
            기간은 개인 참여 기준이며 프로젝트를 병행한 구간이 있습니다. 기존
            U+모바일tv는 별도 레거시 앱이고, 기존 U+모아tv는 전환 구축 후
            U+tv모바일로 명칭이 변경된 서비스입니다.
          </p>
        </section>
        <section className={styles.section} aria-labelledby="projects">
          <p className={styles.eyebrow}>SELECTED PROJECTS</p>
          <h2 id="projects">성과와 판단 근거가 분명한 프로젝트.</h2>
          <article className={styles.project}>
            <p className={styles.period}>
              2024.10–2026.05 · 기존 U+모아tv → U+tv모바일
            </p>
            <h3>홈 성능 개선과 App Router 전환</h3>
            <p className={styles.role}>
              홈 SSR·데이터 로딩 전략·담당 영역 구조 전환
            </p>
            <p className={styles.tech}>
              Next.js 12 → 16 · React 18 → 19 · TypeScript · TanStack Query
            </p>
            <ul>
              <li>
                <strong>LCP 12.2초 → 1.3초:</strong> CSR → SSR
                Prefetch·Hydration 구조로 전환하고 LCP 배너를 우선 요청.
              </li>
              <li>
                <strong>초기 요청 범위 축소:</strong> 상단 4개 패널만 SSR하고
                나머지는 뷰포트 진입 400px 전에 조회.
              </li>
              <li>
                <strong>부분 실패 격리·구조 전환:</strong> Promise.allSettled로
                일부 API 실패를 격리하고 담당 영역을 App Router·FSD 구조로 전환.
              </li>
            </ul>
            <p className={styles.note}>
              LCP는 개발·QA Lighthouse의 단계별 개선 기록입니다.
            </p>
            <div className={styles.projectLinks}>
              <Link href={cases[0].href}>상세 기술 사례 ↗</Link>
            </div>
          </article>
          <article className={styles.project}>
            <p className={styles.period}>2025.04–2025.07 · 기존 U+모아tv</p>
            <h3>React Query v3 → TanStack Query v5</h3>
            <p className={styles.role}>
              77개 파일의 Query Hook·SSR Prefetch·Infinite Query·캐시 동작 이관
            </p>
            <p className={styles.tech}>
              TypeScript · TanStack Query v5 · SSR Hydration · Babel
            </p>
            <ul>
              <li>
                Query Key·enabled 조건·SSR Prefetch 재사용·Infinite Query 종료
                조건·Mutation 무효화 동작을 유지하며 v5 API로 전환.
              </li>
              <li>
                <strong>기존 react-query import 0건:</strong> TanStack Query를
                사용하는 61개 소스 파일의 이관 완료를 확인.
              </li>
              <li>
                패키지 Transpile·Babel 설정을 보완해 iOS 14 WebView 빌드 호환
                경로 확보.
              </li>
            </ul>
            <div className={styles.projectLinks}>
              <Link href={cases[2].href}>상세 기술 사례 ↗</Link>
            </div>
          </article>
          <article className={styles.project}>
            <p className={styles.period}>U+tv모바일 · SSR 안정화</p>
            <h3>SSR V8 Heap OOM 분석과 캐시 생명주기 개선</h3>
            <p className={styles.role}>
              재시작 계측·QueryClient 격리·서버 캐시 timer 분석
            </p>
            <p className={styles.tech}>
              Next.js · Node.js · V8 · TanStack Query
            </p>
            <ul>
              <li>
                <strong>운영 장애 계측:</strong> 동일 Pod의 재시작이 0회 → 7회로
                증가하고 Ready 상태가 1 → 0 → 1로 반복 전환되는 현상을 V8 Heap과
                함께 확인.
              </li>
              <li>
                <strong>캐시 생명주기 정리:</strong> QueryClient를 요청 단위로
                격리하고 서버 캐시·Prefetch의 gcTime을 Infinity로 조정해 요청 간
                참조와 timer 생명주기를 정리.
              </li>
              <li>
                <strong>로컬 반복 요청 검증:</strong> heapUsed 안정 구간 154.8MB
                → 93.2MB, 약 39.8% 감소 확인.
              </li>
            </ul>
            <p className={styles.note}>
              QueryClient 공유 가능성과 캐시 timer는 주요 원인 후보이며 단일
              원인으로 단정하지 않습니다.
            </p>
            <div className={styles.projectLinks}>
              <Link href={cases[1].href}>상세 기술 사례 ↗</Link>
            </div>
          </article>
          <article className={styles.project}>
            <p className={styles.period}>2022.10 · 기존 U+모바일tv</p>
            <h3>반복 화면 전환 종료 원인 추적·MobX reaction 정리</h3>
            <p className={styles.role}>
              공통 컴포넌트의 구독 생명주기 분석·운영 장애 개선
            </p>
            <p className={styles.tech}>
              Next.js 6 · React 16 · TypeScript · MobX
            </p>
            <ul>
              <li>
                <strong>반복 화면 전환 종료 원인 추적:</strong> 홈·상세에서 반복
                생성되는 공통 컴포넌트의 autorun disposer 누락과 reaction 누적을
                확인.
              </li>
              <li>
                <strong>구독 생명주기 정리:</strong> autorun disposer를 보관하고
                unmount 시 호출해 화면과 함께 reaction이 해제되도록 개선.
              </li>
              <li>
                <strong>독립 환경 1,000회 검증:</strong> 서비스 종료 후 MobX
                4.9.2 동일 패턴에서 잔존 reaction·callback 1,000개 → 0개, GC 후
                Heap 기준선 회복 확인.
              </li>
            </ul>
            <p className={styles.note}>
              1,000회 반복·1,000개 → 0개는 서비스 종료 후 독립 재현 결과이며
              운영 환경의 측정값이 아닙니다.
            </p>
            <div className={styles.projectLinks}>
              <Link href={cases[3].href}>상세 기술 사례 ↗</Link>
            </div>
          </article>
        </section>
        <section className={styles.section} aria-labelledby="personal">
          <p className={styles.eyebrow}>OPEN SOURCE &amp; PERSONAL</p>
          <h2 id="personal">실무의 문제를 도구와 제품으로 확장합니다.</h2>
          <article className={styles.project}>
            <p className={styles.period}>
              2023.10–2024.04 개발 · 2026.09 운영·고도화
            </p>
            <h3>IWTC 백엔드 전환과 서비스 성능·운영 자동화</h3>
            <p className={styles.role}>
              2인 프로젝트 · 프론트엔드 전담 → AI 도구를 활용해 Java Spring
              백엔드를 NestJS로 전환·운영
            </p>
            <p className={styles.tech}>
              Next.js 13 · React 18 · NestJS · TanStack Query · React Spring · K3s
              · Argo CD · Codex · MCP
            </p>
            <ul>
              <li>
                <strong>Java Spring → NestJS:</strong> AI 도구를 활용해 기존
                API·도메인 로직을 분석하고 백엔드를 NestJS로 재구축.
              </li>
              <li>
                <strong>추가 미디어 요청 최대 40회 → 0회:</strong> 목록 응답에
                미디어를 포함하도록 API 계약과 화면 매핑 개선.
              </li>
              <li>
                <strong>고정 대기 1,000ms → 약 336–342ms:</strong> 실제 Spring
                완료 시점에 다음 대결로 전환하고 WebKit 렌더 회귀 수정.
              </li>
              <li>
                <strong>콘텐츠 운영 자동화:</strong> 하루 1개 월드컵·후보 16개를
                생성하고 PRIVATE → VERIFY → PUBLIC 검증 후 Telegram으로 결과
                알림.
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
            <h3>
              next-manual-
              <wbr />
              scroll-restoration
            </h3>
            <p className={styles.ownership}>
              Owner &amp; Maintainer · 설계·개발·문서화
            </p>
            <p className={styles.role}>
              U+tv모바일의 다양한 브라우저·WebView 환경에서 일관된 스크롤 복원을
              구현하고, App Router용 Hook으로 분리·공개
            </p>
            <p className={styles.tech}>
              TypeScript · React · Next.js App Router · MIT
            </p>
            <ul>
              <li>
                <strong>Pages Router → App Router 전환 대응:</strong> 기존
                router.events 기반 처리를 대체해 History API에서 이동 직전 위치를
                저장하고, 진입·뒤로가기·쿼리 변경별 복원 정책을 분리.
              </li>
              <li>
                <strong>iOS의 렌더링·복원 시점 불일치 보완:</strong> 콘텐츠가
                준비되기 전 복원을 시도하는 문제를 ResizeObserver 기반 문서 높이
                감지와 제한 시간 내 재시도로 대응.
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
          <article className={styles.project}>
            <h3>ddongmy-os — Notion CMS·GitOps 홈서버 운영</h3>
            <p className={styles.role}>
              1인 설계·개발·운영 · 콘텐츠·배포·클러스터 관측 파이프라인 구축
            </p>
            <p className={styles.tech}>
              Next.js · TypeScript · Notion CMS · GitHub Actions · GHCR · Argo CD ·
              K3s · Cloudflare R2
            </p>
            <ul>
              <li>
                <strong>빌드·배포 자동화:</strong> main 반영 시 GitHub Actions가
                웹·status-exporter 이미지를 빌드해 commit SHA로 GHCR에 올리고
                Kubernetes manifest를 갱신.
              </li>
              <li>
                <strong>GitOps 런타임 검증:</strong> Argo CD가 K3s의 2개 Pod를
                maxUnavailable 0 RollingUpdate로 배포하고 상태 API가 반영 완료를
                확인해야 workflow를 성공 처리.
              </li>
              <li>
                <strong>요청 시 이미지 변환 → 변경 시 변환:</strong> 약 1.52MB
                Notion 커버를 Webhook에서 약 50KB WebP로 변환해 R2에 저장하고 방문
                요청에서 Notion 원본 다운로드와 Sharp 변환을 제거.
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
        <section className={styles.section} aria-labelledby="cases">
          <p className={styles.eyebrow}>ENGINEERING NOTES</p>
          <h2 id="cases">문제 분석과 검증 기록</h2>
          <p className={styles.note}>
            성과 수치의 측정 조건과 문제를 좁혀간 과정을 자세히 기록했습니다.
          </p>
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
