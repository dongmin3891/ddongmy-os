# /resume 내용 근거 및 검토

확인일: 2026-11-05. 연결된 Notion 원문을 읽어 정적 공개 페이지에 필요한 내용만 편집했다. Notion 조회나 비공개 원문 링크를 페이지 실행에 추가하지 않았다.

## 원문

- [경력기술서 최종본](https://www.notion.so/3c8151dc9c7281d294abcb58dd9cc368): 전체 프로젝트 기간·역할·팀 규모·기술.
- [김동민 | Frontend Engineer 경력기술서](https://www.notion.so/3ce151dc9c72817abc87c1611c582929): 담당 범위·측정 조건 대조.
- [모바일tv 운영·모아tv 고도화·차세대 전환](https://www.notion.so/3e7151dc9c7281a79921dd9d2a73ceb3): 서비스 관계·병행 기간·사이드 프로젝트.
- [홈 성능 개선·App Router](https://www.notion.so/3c6151dc9c7281ea932fdad21ea4dea2), [단계별 원본](https://www.notion.so/175151dc9c728021905be00041aca232): 최초 LCP 12.2초, SSR·이미지 최적화 후 2.7초, 첫 배너 우선 요청 후 1.3초. 개발·QA Lighthouse의 단계별 기록이며 단일 5회 평균 실험이나 운영 개선율이 아니다.
- [SSR Heap OOM](https://www.notion.so/3c8151dc9c72817882a3effc7e57b9e1): 154.8→93.2MB는 동일 로컬 반복 요청 heapUsed 안정 구간. 요청 단위 QueryClient 분리는 팀 작업, 서버 캐시·담당 Prefetch gcTime 정책과 메모리 계측은 개인 담당. QueryClient 공유 가능성과 timer는 주요 원인 후보. Kubernetes OOMKilled나 운영 전체 메모리 40% 감소로 표현하지 않는다.
- [Query v5·iOS 14](https://www.notion.so/3da151dc9c7281259717d95abe0604c2): 77개 파일의 Query Hook·SSR Hydration·Infinite Query·캐시 무효화 전환. 패키지 Transpile·Babel 호환성 보완. 당시 기기 오류 로그가 남아 있지 않아 영향 사용자 수·특정 오류 메시지는 기재하지 않는다.
- [MobX 생명주기](https://www.notion.so/3da151dc9c728148bf28d77287b5cce2): 1,000회·reaction/callback 0은 운영 종료 후 MobX 4.9.2 독립 재현 결과.
- [IWTC 상세](https://www.notion.so/3e4151dc9c72819d9c92c09962bf9caa): 2026.09 검증 기록의 최대 추가 요청 40→0, 고정 1,000ms→336–342ms, 단위 테스트 76개.
- [Notion 커버 R2 회고](https://www.notion.so/3db151dc9c72813ca202fd710cfb762f): 요청 시 변환을 Webhook으로 분리. 개선 후 속도 측정값이 없어 임의 개선율 미기재.
- [Google Play](https://play.google.com/store/apps/details?id=com.lguplus.remocon&hl=ko): U+tv모바일 50만+ 다운로드. 서비스 규모이며 개인 성과·MAU가 아니다.

## 편집 판단

- 회사 경력 시작은 세 경력기술서의 2021.06 표기를 따름. 입사일 자체와 프로젝트 시작일의 구분은 향후 인사 기록으로 재확인할 수 있다.
- 6명 규모 합류·5년 재직·40명 이상 조직 경험은 이번 사용자 요청의 명시적 사실을 반영. 조직 성장을 개인 성과로 귀속하지 않음.
- 기존 U+모아tv와 U+tv모바일을 한 프로젝트로 묶음. 기존 U+모바일tv는 별도 레거시 앱이며 운영 당시 1,000만+ 다운로드, 이후 단계적 종료.
- 일평균 2.68만, 458만 View·366만 Session, RUM 평균 LCP는 관측 범위를 혼동하지 않도록 제외.
- [Wonny 편집 원칙](https://wonny.space/writing/work/engineer-resume): 사실·짧은 불릿·개인 역할·측정 기준. [유용우 시각 참고](https://resume.yowu.dev): 큰 수치·명확한 계층·여백. 김종빈 이력서는 사용하지 않음.

## 검증

- TypeScript, ESLint, production build 통과. /resume 정적 생성 확인.
- 내부 프로젝트 경로는 기존 정적 slug와 대조. 기술 글은 Notion Published=YES 및 Slug를 직접 대조.
- 320/390/768/1440px 화면 및 A4 인쇄 검증을 시도했으나 실행 환경에서 Chromium의 socket 생성이 제한되고 별도 브라우저는 로컬 서버에 연결하지 못해 실제 렌더 검증은 미완료.
- 병합 전 실제 브라우저에서 가로 넘침·키보드 focus·인쇄 버튼·PDF 페이지 경계·다섯 기술 글 응답을 확인해야 한다. CSS에는 모바일 단일 열, A4 여백, 제목 뒤 분리 방지·카드/불릿 분할 방지와 인쇄용 기술 글 URL을 적용했다.

## 사용자 확인에 따른 추가 반영 (2026-11-05)

- 기존 U+모바일tv 종료 과정에서 U+tv모바일로 고객을 이관한 업무를 직접 담당했다는 사용자 확인을 반영. 계정·데이터 이관 방식이나 전환 인원·전환율은 제공되지 않아 기재하지 않음. 개인 참여 기간은 기존 기록 유지.
- 핵심 역량의 세 번째 항목은 다양한 실행 환경 대응으로 변경. 사용자가 명시한 모바일 Safari·Chrome·iOS WebView 개발 경험을 반영하며 브라우저별 호환성과 동작 차이 대응을 강조. 조직 규모 경험은 첫 소개에 유지.

## 인원 표기 정리·오픈소스 추가 (2026-11-05)

- 상용·사이드 프로젝트의 팀 인원수 삭제. 소개의 6명→40명 이상 조직 경험, 프론트엔드 전담·1인 개발 등 책임 범위는 유지. 성과·기존 상세 사례 링크 유지.
- [next-manual-scroll-restoration](https://github.com/dongmin3891/next-manual-scroll-restoration)의 README·package.json·src/index.ts·controller·position-store·restore 구현을 대조하여 오픈소스 섹션 추가. 탐색 유형별 정책, ResizeObserver 기반 비동기 복원, 확장 가능한 저장소·LRU·명령형 API를 소개.
- 공개 저장소의 기능과 MIT 라이선스만 기술. npm 배포 여부·다운로드·Star·도입 서비스 수·성능 개선율은 확인 없이 추가하지 않음.
