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

type CareerRole = {
  period: string
  title: string
  highlights: readonly string[]
  tech: string
}

type ProjectLink = {
  label: string
  href: string
}

type ResumeProject = {
  period: string
  title: string
  context: string
  tech: string
  highlights: readonly {
    lead: string
    detail: string
  }[]
  links?: readonly ProjectLink[]
  note?: string
}

const careerRoles: readonly CareerRole[] = [
  {
    period: '2025.09 ~',
    title: '미디어 서비스 / U+tv모바일 프론트엔드 개발자',
    highlights: [
      '정보성 서비스로 시작한 기존 U+모아tv의 U+tv모바일 전환 구축·출시·운영',
      '기존 U+모바일tv의 단계적 종료에 맞춘 고객 이관과 SSR·WebView 운영 안정화',
    ],
    tech: 'Next.js 16 · React 19 · TypeScript · TanStack Query · Zustand · EKS',
  },
  {
    period: '2023.09 ~ 2026.04',
    title: '미디어 서비스 / 기존 U+모아tv 프론트엔드 개발자',
    highlights: [
      '기존 U+모바일tv와 별도로 공존한 정보성 서비스의 운영과 고도화',
      '홈 성능 개선, App Router·FSD 구조 전환, React Query v3 → TanStack Query v5 이관',
    ],
    tech: 'Next.js 12 → 16 · React 18 → 19 · TypeScript · TanStack Query · Zustand',
  },
  {
    period: '2022.05 ~ 2023.09',
    title: '미디어 서비스 / 기존 U+모바일tv 프론트엔드 개발자',
    highlights: [
      '모바일 Safari·Chrome·iOS WebView와 Native Bridge를 사용하는 레거시 서비스 운영',
      '브라우저별 동작 차이와 MobX 구독 생명주기로 발생한 운영 장애 개선',
    ],
    tech: 'Next.js 6 · React 16 · TypeScript · MobX · Express',
  },
]

const projects: readonly ResumeProject[] = [
  {
    period: '2025.09 ~',
    title: 'U+tv모바일 전환 구축·출시와 고객 이관',
    context: 'U+ 미디어 서비스 · 프론트엔드 개발·운영',
    tech: 'Next.js 16 · React 19 · TypeScript · TanStack Query · Zustand · EKS',
    highlights: [
      {
        lead: '담당 영역 구축·전환',
        detail:
          '기존 U+모아tv를 U+tv모바일로 전환하며 탐색·검색·콘텐츠 상세 영역을 App Router·FSD 구조로 이관·구축',
      },
      {
        lead: '고객 이관·WebView 안정화',
        detail:
          '기존 U+모바일tv의 단계적 종료에 맞춰 고객 이동 흐름을 구현하고 iOS 뒤로가기·스크롤 복원·흑화 이슈 보완',
      },
      {
        lead: 'SSR 메모리 안정화',
        detail:
          'SSR Prefetch 캐시 생명주기와 타이머를 계측·정리해 동일 로컬 반복 요청의 heapUsed 안정 구간을 154.8MB → 93.2MB로 낮춤',
      },
    ],
    links: [
      {
        label: 'SSR V8 Heap 분석',
        href: '/log/nextjs-ssr-queryclient-gctime-oom',
      },
    ],
    note: '메모리 감소 수치는 동일 로컬 반복 요청의 Node.js heapUsed 안정 구간 비교입니다.',
  },
  {
    period: '2023.09 ~ 2026.04',
    title: '기존 U+모아tv 정보성 서비스 운영·고도화',
    context: 'U+ 미디어 서비스 · 프론트엔드 개발·운영',
    tech: 'Next.js 12 → 16 · React 18 → 19 · TypeScript · TanStack Query · Zustand',
    highlights: [
      {
        lead: '홈 LCP 12.2초 → 1.3초',
        detail:
          'SSR Prefetch·Hydration과 초기 요청 범위를 조정해 2.7초, 첫 배너 요청 우선순위를 높여 1.3초까지 단축',
      },
      {
        lead: 'App Router·FSD 전환',
        detail: '담당 영역을 App Router로 옮기고 데이터·UI 책임을 기능 단위로 재구성',
      },
      {
        lead: 'TanStack Query v5 이관',
        detail:
          '77개 파일의 Query Hook·SSR Prefetch·Infinite Query 동작을 이관하고 iOS 14 WebView 빌드 호환 경로 확보',
      },
    ],
    links: [
      {
        label: '홈 성능·App Router 전환',
        href: '/log/utv-mobile-home-performance-app-router',
      },
      {
        label: 'TanStack Query v5 전환',
        href: '/log/moatv-tanstack-query-v5-ios14-webview',
      },
    ],
    note: 'LCP는 개발·QA 환경의 Lighthouse 단계별 개선 기록입니다.',
  },
  {
    period: '2022.05 ~ 2023.09',
    title: '기존 U+모바일tv 운영·WebView 안정화',
    context: 'U+ 미디어 서비스 · 프론트엔드 개발·운영',
    tech: 'Next.js 6 · React 16 · TypeScript · MobX · Express',
    highlights: [
      {
        lead: 'WebView 운영 대응',
        detail:
          'iOS 버전별 성인인증 callback, YouTube·FAQ 이동, 하드웨어 백키·스크롤 복원 등 브라우저·Native Bridge 차이 대응',
      },
      {
        lead: 'MobX 메모리 누수 개선',
        detail:
          '공통 컴포넌트의 autorun disposer 누락을 찾아 unmount 시 reaction이 해제되도록 수정',
      },
      {
        lead: '독립 환경 1,000회 검증',
        detail: '잔존 reaction·callback 1,000개 → 0개와 GC 후 Heap 기준선 회복 확인',
      },
    ],
    links: [
      {
        label: 'MobX 메모리 누수 분석',
        href: '/log/mobiletv-mobx-autorun-memory-leak',
      },
    ],
    note: '1,000회 반복 수치는 서비스 종료 후 동일 패턴을 재현한 독립 검증 결과입니다.',
  },
  {
    period: '2024.04 ~ 2024.11',
    title: 'U+ITGO 라우팅·배차 관리 개발',
    context: '물류 서비스 · 프론트엔드 개발',
    tech: 'Next.js 14 · TypeScript · TanStack Query v5 · MUI',
    highlights: [
      {
        lead: '배차 작업 규칙',
        detail: '혼적 여부와 작업 완료 상태에 따른 배차내역 드래그·재배차 조건 구현',
      },
      {
        lead: '배차 상태 동기화',
        detail:
          '재배차 완료 후 팝업을 종료하고 화물 목록 Query를 무효화해 배차내역과 목록 상태 동기화',
      },
      {
        lead: '계정별 기능 제어',
        detail: '운송사·가맹점·U+·ALFA 계정 조건에 따라 차주 관리 기능과 작업 버튼 노출 제어',
      },
    ],
  },
  {
    period: '2024.11 ~ 2024.12',
    title: '미래엔 초코툰 뷰어·LCMS 개발',
    context: '교육 콘텐츠 서비스 · 프론트엔드 개발',
    tech: 'Next.js 14·15 · TypeScript · TanStack Query v5 · Zustand',
    highlights: [
      {
        lead: '뷰어 상태 복원',
        detail: '권 상세에서 뷰어로 이동한 뒤 돌아왔을 때 선택했던 권과 스와이프 상태 복원',
      },
      {
        lead: 'LCMS 전시 관리',
        detail:
          '인기검색어·패키지·추천웹툰·하우스배너의 조회·검색·등록·수정과 날짜·URL·이미지 검증 흐름 구현',
      },
    ],
  },
  {
    period: '2021.06 ~ 2022.04',
    title: 'LG U+ SOHO·500TF WebView 화면 개발',
    context: '소상공인 서비스 · 프론트엔드 개발·운영',
    tech: 'React 17 · JavaScript · MobX 6',
    highlights: [
      {
        lead: 'SOHO 운영 기능',
        detail:
          '인터넷전화·메시지·자동로그인·매장 전환 흐름을 개발하고 매장 변경 후 관련 API와 화면 상태 갱신',
      },
      {
        lead: '500TF 주문 화면',
        detail:
          '메뉴·메뉴 상세·장바구니·주문 화면을 구현하고 WebView 백키·스크롤·팝업 종료 시 상태 초기화 문제 대응',
      },
    ],
  },
]

const skills = [
  {
    name: 'Languages',
    items: 'TypeScript · JavaScript · HTML/CSS',
  },
  {
    name: 'Frameworks & Libraries',
    items: 'React · Next.js · Vue 3 · NestJS',
  },
  {
    name: 'Data & State',
    items: 'TanStack Query · Zustand · MobX · Pinia',
  },
  {
    name: 'Runtime & Delivery',
    items: 'WebView · Node.js · Docker · Kubernetes · GitHub Actions · Argo CD',
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
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>KIM DONGMIN / FRONTEND ENGINEER</p>
            <h1>
              김동민<span>Frontend Engineer · Web &amp; WebView</span>
            </h1>
            <address className={styles.contacts}>
              <a href="mailto:rlaehdals224@gmail.com">rlaehdals224@gmail.com</a>
              <a href="https://github.com/dongmin3891">GitHub ↗</a>
              <Link href="/log">기술 기록 ↗</Link>
            </address>
          </div>
          <div
            aria-label="김동민 프로필 사진 자리"
            className={styles.profilePhoto}
            role="img"
          >
            <span>KDM</span>
            <small>PROFILE PHOTO</small>
          </div>
        </header>

        <section className={styles.section} aria-labelledby="introduce">
          <h2 className={styles.eyebrow} id="introduce">
            INTRODUCE
          </h2>
          <div className={styles.introduction}>
            <p>
              6명 규모 스타트업에 합류해 5년간 재직하며 40명 이상의 조직으로
              성장하는 과정을 경험했습니다. 현재는 U+tv모바일의 프론트엔드 개발과
              운영을 맡고 있습니다. 미디어·물류·커머스·교육의 사용자·운영자
              서비스를 개발하며 상용 서비스의 성능·전환·운영 문제를 해결해왔습니다.
            </p>
            <p>
              운영 중 발생한 버그를 직접 확인할 수 없는 게 답답했습니다. 그래서
              홈서버에 비슷한 환경을 만들고, 문제가 생긴 조건을 다시 만들어 수정
              결과까지 확인했습니다.
            </p>
            <p>
              업무에서 반복해 겪은 스크롤 복원 문제는 Next.js App Router용
              오픈소스로 정리해 공개했습니다. 회사 밖에서도 기획자·디자이너·백엔드
              개발자와 함께 제품을 만들어보고 싶어 사이드 프로젝트에 참여했습니다.
            </p>
          </div>
          <p className={styles.updatedAt}>Latest Updated 2026. 11. 10</p>
          <div className={styles.strengths}>
            <div>
              <h3>운영하며 전환했습니다</h3>
              <p>
                U+모바일tv 고객을 이관하고 U+모아tv를 U+tv모바일로 전환하며 운영 중인
                서비스의 구조와 기술을 바꿨습니다.
              </p>
            </div>
            <div>
              <h3>문제는 재현부터</h3>
              <p>
                브라우저·WebView·SSR 문제를 직접 재현하고 Lighthouse와 메모리를
                계측해 개선 전후를 확인했습니다.
              </p>
            </div>
            <div>
              <h3>필요하면 직접 만듭니다</h3>
              <p>
                업무에서 겪은 문제는 오픈소스로 정리했고, 사이드 프로젝트에서는
                NestJS 백엔드와 GitOps 배포 환경까지 만들었습니다.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="experience">
          <h2 className={styles.eyebrow} id="experience">
            EXPERIENCE
          </h2>
          <p className={styles.sectionLead}>총 5년 5개월</p>
          <p className={styles.company}>
            KIINS (키인스) · Frontend Engineer
            <span>2021.06 ~ 현재 · 재직 중 5년 5개월</span>
          </p>
          <div className={styles.experienceList}>
            {careerRoles.map((role) => (
              <article key={`${role.period}-${role.title}`}>
                <p className={styles.period}>{role.period}</p>
                <div>
                  <h3>{role.title}</h3>
                  <ul className={styles.experienceBullets}>
                    {role.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                  <p className={styles.tech}>{role.tech}</p>
                </div>
              </article>
            ))}
          </div>
          <p className={styles.note}>
            기간은 개인 참여 기준이며 프로젝트를 병행한 구간이 있습니다.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="projects">
          <h2 className={styles.eyebrow} id="projects">
            PROJECT
          </h2>
          <div className={styles.projectList}>
            {projects.map((project) => (
              <article className={styles.project} key={`${project.period}-${project.title}`}>
                <p className={styles.period}>{project.period}</p>
                <h3>{project.title}</h3>
                <p className={styles.role}>{project.context}</p>
                <ul>
                  {project.highlights.map((highlight) => (
                    <li key={highlight.lead}>
                      <strong>{highlight.lead}:</strong> {highlight.detail}
                    </li>
                  ))}
                </ul>
                <p className={styles.tech}>{project.tech}</p>
                {project.note ? <p className={styles.note}>{project.note}</p> : null}
                {project.links?.length ? (
                  <div className={styles.projectLinks}>
                    {project.links.map((link) => (
                      <Link href={link.href} key={link.href}>
                        {link.label} ↗
                      </Link>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="side-project">
          <h2 className={styles.eyebrow} id="side-project">
            SIDE PROJECT
          </h2>
          <article className={styles.project}>
            <p className={styles.period}>2025.11 ~</p>
            <h3>ddongmy-os — Notion CMS·GitOps 홈서버 운영</h3>
            <p className={styles.role}>
              1인 설계·개발·운영 · 콘텐츠·배포·클러스터 관측 파이프라인 구축
            </p>
            <ul>
              <li>
                <strong>배포 완료 기준 확장:</strong> GitHub Actions에서 GHCR 이미지와
                manifest를 갱신한 뒤 동일 commit SHA의 Argo CD 반영과 K3s Pod Ready까지
                확인해야 workflow를 성공 처리.
              </li>
              <li>
                <strong>Notion 이미지 사전 처리:</strong> 요청 시 변환하던 약 1.52MB
                커버를 Webhook에서 약 50KB WebP로 변환해 R2에 저장.
              </li>
              <li>
                <strong>클러스터 조회 권한 분리:</strong> 특정 Deployment만 조회하는 내부
                status-exporter가 공개 DTO를 전달하도록 책임 분리.
              </li>
              <li>
                <strong>Playwright 회귀 검증:</strong> 조회수 집계의 정상·API 실패 후
                재시도·중복 실행을 브라우저 테스트 3개로 검증하고, 실패 기록이 30분간
                재시도를 막던 문제를 발견·수정.
              </li>
            </ul>
            <p className={styles.tech}>
              Next.js · TypeScript · Notion CMS · GitHub Actions · GHCR · Argo CD ·
              K3s · Cloudflare R2 · Playwright
            </p>
            <div className={styles.projectLinks}>
              <Link href="/projects/ddongmy-os">상세 사례 ↗</Link>
              <Link href="/log/notion-cover-r2-webhook-image-loading-retrospective">
                이미지 처리 회고 ↗
              </Link>
              <a href="https://github.com/dongmin3891/ddongmy-os/blob/main/docs/verification/playwright-log-view-regression.md">
                Playwright 회귀 검증 ↗
              </a>
              <a href="https://github.com/dongmin3891/ddongmy-os">GitHub ↗</a>
            </div>
          </article>

          <article className={styles.project}>
            <p className={styles.period}>
              2023.10 ~ 2024.04 개발 · 2026.09 운영·고도화
            </p>
            <h3>IWTC 백엔드 전환과 서비스 성능·운영 자동화</h3>
            <p className={styles.role}>
              2인 프로젝트 · 프론트엔드 전담 → AI 도구를 활용해 Java Spring
              백엔드를 NestJS로 전환·운영
            </p>
            <ul>
              <li>
                <strong>Java Spring → NestJS:</strong> AI 도구와 함께 기존
                API·도메인 로직을 분석하고 백엔드를 재구축.
              </li>
              <li>
                <strong>추가 미디어 요청 최대 40회 → 0회:</strong> 목록 응답에
                미디어를 포함하도록 API 계약과 화면 매핑 개선.
              </li>
              <li>
                <strong>고정 대기 1,000ms → 약 336–342ms:</strong> 실제 애니메이션
                완료 시점에 다음 대결로 전환하고 WebKit 렌더 회귀 수정.
              </li>
              <li>
                <strong>콘텐츠 운영 자동화:</strong> 하루 1개 월드컵·후보 16개를
                생성하고 검증 후 Telegram으로 결과 알림.
              </li>
            </ul>
            <p className={styles.tech}>
              Next.js 13 · React 18 · NestJS · TanStack Query · K3s · Argo CD ·
              Codex · MCP
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
            <p className={styles.period}>2025.04 ~ 2026.06</p>
            <h3>FTM — 남성 그루밍 콘텐츠·커뮤니티 서비스</h3>
            <p className={styles.role}>
              PM·기획/디자인·백엔드와 협업 · 프론트엔드 공동 개발
            </p>
            <ul>
              <li>
                <strong>콘텐츠 작성·수정:</strong> Tiptap 기반 게시글 작성·수정·삭제와
                본문 이미지·추천 상품 등록 흐름 구현.
              </li>
              <li>
                <strong>이미지 변경 정합성:</strong> 기존·신규·기본 상품 이미지를 구분해
                잘못된 이미지 삭제와 초기 콘텐츠 주입 전 빈 본문 저장 방지.
              </li>
              <li>
                <strong>탐색·반응형 UX:</strong> 태그 필터·무한스크롤과 좋아요·북마크
                상태 갱신을 구현하고 모바일 바텀시트·반응형 화면 대응.
              </li>
            </ul>
            <p className={styles.tech}>
              Next.js 14 · React 18 · TypeScript · TanStack Query v5 · Zustand ·
              Tiptap · Tailwind CSS
            </p>
            <div className={styles.projectLinks}>
              <a href="https://github.com/FitTheMan/ftm-client-web">GitHub ↗</a>
            </div>
          </article>
        </section>

        <section className={styles.section} aria-labelledby="open-source">
          <h2 className={styles.eyebrow} id="open-source">
            OPEN SOURCE
          </h2>
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
              U+tv모바일 운영 중 다룬 스크롤 복원 문제를 Next.js App Router용 Hook으로
              일반화해 공개
            </p>
            <ul>
              <li>
                <strong>Pages Router → App Router 대응:</strong> History API에서 이동
                직전 위치를 저장하고 진입·뒤로가기·쿼리 변경별 복원 정책 분리.
              </li>
              <li>
                <strong>iOS 렌더링·복원 시점 보완:</strong> ResizeObserver 기반 문서
                높이 감지와 제한 시간 내 재시도로 대응.
              </li>
              <li>
                경로별 정책, 저장소 교체 인터페이스, LRU 보관 한도와 다음 탐색의
                스크롤 유지 API 제공.
              </li>
              <li>단위 테스트 30개와 E2E 시나리오 3개로 핵심 이동 정책 검증.</li>
            </ul>
            <p className={styles.tech}>
              TypeScript · React · Next.js App Router · MIT
            </p>
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

        <section className={styles.section} aria-labelledby="skills">
          <h2 className={styles.eyebrow} id="skills">
            SKILL
          </h2>
          <dl className={styles.skills}>
            {skills.map((skill) => (
              <div key={skill.name}>
                <dt>{skill.name}</dt>
                <dd>{skill.items}</dd>
              </div>
            ))}
          </dl>
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
