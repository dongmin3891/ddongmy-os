---
name: next-app-router
description: >
  Next.js App Router의 폴더 배치, 의존성 방향과 route 조립을 설계·리팩터링·검토할 때
  사용한다. Server/Client 모듈 경계와 page·layout·Route Handler의 책임을 정한다.
  버전·upgrade·cache API·runtime 선택은 modern-nextjs가 담당하며 Pages Router 전용
  작업에는 사용하지 않는다.
---

# Next.js App Router 아키텍처

## 이 스킬의 기준

가장 읽기 쉬운 구조를 우선한다. 기본 방향은 **Server-first + feature 중심 +
colocation + 단방향 의존성**이다.

- 작은 프로젝트에는 작은 구조를 유지한다.
- `app`은 URL과 화면 조립을 표현한다.
- 여러 route에서 공유하는 도메인 코드는 `features`로 승격한다.
- 재사용이 확인된 범용 코드만 `components/ui`와 `lib`에 둔다.
- 기존 프로젝트를 이유 없이 전면 재구성하지 않는다.

Next.js는 하나의 폴더 구조를 강제하지 않는다. 프로젝트 크기와 변경 범위를 먼저
확인하고, 아래 구조를 목표가 아니라 기본 선택지로 사용한다.

## 먼저 확인한다

1. 설치된 Next.js, React, TypeScript와 Node.js 버전을 확인한다.
2. App Router와 Pages Router의 혼용 여부를 확인한다.
3. `src` 사용 여부, path alias, 파일명 규칙과 기존 테스트 방식을 확인한다.
4. route별 데이터 소유자, 진입점과 상호작용 영역을 확인한다.
5. 현재 변경과 무관한 폴더 이동이나 공통화는 하지 않는다.

## 구조 선택

### 작은 프로젝트

route가 적고 기능이 한 화면에 머무르면 route 가까이에 배치한다.

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── projects/
│       ├── page.tsx
│       ├── _components/
│       └── _lib/
├── components/
│   └── ui/
└── lib/
```

### 중간 이상 프로젝트

동일한 도메인 기능을 여러 route에서 사용하면 feature 단위로 분리한다.

```text
src/
├── app/                         # routing과 화면 조립
│   ├── (marketing)/
│   ├── (dashboard)/
│   └── api/
├── features/                    # 사용자 관점의 기능
│   └── projects/
│       ├── api/
│       ├── components/
│       ├── queries/
│       ├── store/
│       ├── schemas/
│       └── types.ts
├── components/
│   └── ui/                      # 도메인을 모르는 범용 UI
├── lib/                         # 도메인을 모르는 기반 코드
└── config/                      # 검증된 환경 설정
```

빈 폴더를 미리 만들지 않는다. 한 파일이면 한 파일로 시작하고, 서로 다른 변경 이유가
생겼을 때만 분리한다.

## 의존성 방향

```text
app  →  features  →  shared
 │          │           ├── components/ui
 │          │           ├── lib
 │          │           └── config
 └──────────┴────────────────────────────→
```

- `features`는 `app`을 import하지 않는다.
- `shared`는 `features`와 `app`을 import하지 않는다.
- 다른 feature의 내부 파일을 깊게 import하지 않는다.
- 순환 의존성을 만들면서까지 barrel export를 사용하지 않는다.

## Server와 Client 경계

### 기본값

- `page.tsx`, `layout.tsx`와 일반 컴포넌트는 Server Component로 시작한다.
- event handler, state, effect, browser API가 필요한 가장 작은 경계에만
  `'use client'`를 둔다.
- 큰 Server Component 전체를 Client Component로 바꾸지 말고 상호작용 부분을
  작은 client island로 추출한다.
- Server Component에서 필요한 데이터는 원본 서비스나 server-only 모듈을 직접
  호출한다. 같은 애플리케이션의 Route Handler를 HTTP로 다시 호출하지 않는다.

### 경계 규칙

- secret, database client, admin SDK는 `server-only` 모듈 안에 둔다.
- Client Component로 전달하는 props는 작고 직렬화 가능한 공개 모델로 제한한다.
- 외부 입력 parser와 공개 모델 변환은 경계 모듈에 두고 UI에서 import하지 않는다.
  구체적인 방법은 [schema-at-boundary](../schema-at-boundary/SKILL.md)를 따른다.
- 권한 검사는 UI 노출 여부와 별개로 서버 작업 직전에 수행한다.
- 서버 조회·변경의 데이터 접근, 인가와 공개 반환 모델을 설계할 때는
  [references/data-access.md](references/data-access.md)를 읽는다.

## 상태 성격별 소유자

route에서는 [readable-ui의 상태 성격별 소유자](../readable-ui/SKILL.md#상태-성격별-소유자)를
기준으로 각 값을 읽을 위치와 Server/Client 경계를 정한다.
form mutation의 제출 방식은 [next-forms](../next-forms/SKILL.md)에서 선택한다.

## Route 설계

- `page.tsx`는 route 진입점과 화면 조립이 한눈에 보이도록 얇게 유지한다.
- `layout.tsx`에는 실제로 하위 route가 공유하는 UI만 둔다.
- `loading.tsx`, `error.tsx`, `not-found.tsx`는 사용자가 복구 방법을 알 수 있게 만든다.
- route group은 URL과 무관한 layout 또는 제품 영역 구분에만 사용한다.
- private folder는 route 내부 구현임을 명확히 할 때 `_components`, `_lib`처럼 사용한다.
- 동적 route는 `params`와 `searchParams`의 현재 Next.js 타입 및 async 규칙을 확인한다.
- SEO가 필요한 route는 static `metadata` 또는 `generateMetadata`를 제공한다.
- 탐색에는 `Link`와 framework navigation을 사용한다. 공유·복원할 검색·정렬·pagination은
  URL에 두어 새로고침과 뒤로 가기에서도 의미가 유지되게 한다.

## Metadata 배치

- root metadata에 `metadataBase`, title template와 기본 description을 검토한다.
- route별 metadata는 route에 두고 동적 조회가 필요할 때만 `generateMetadata`를 사용한다.
- public web 요구에 따라 canonical, Open Graph 이미지, robots와 sitemap을 배치한다.
- JSON-LD가 필요하면 공개 모델을 안전하게 직렬화하고 HTML에 삽입하는 값을 escape한다.
  metadata와 page의 공통 조회는 server 모듈에서 공유한다.

## Route의 조립 책임

- `page.tsx`는 params parser → server 조회 → 화면 조립을 드러낸다. transport·DTO 변환을
  분리하되 짧은 조립 코드를 숨기려고 별도 계층을 추가하지 않는다.
- HTTP 소비자가 필요한 `route.ts`는 요청 파싱·인증·인가·use case 호출·응답 변환을
  연결한다. page와 Route Handler는 같은 server 모듈을 사용할 수 있다.
- metadata export는 route에 두고, page와 공통 조회가 필요하면 server 모듈을 공유한다.
- 독립 조회는 병렬로 시작하고 느린 UI 역할에 `Suspense`를 둔다. cache 수명과
  invalidation API를 선택할 때만 [modern-nextjs](../modern-nextjs/SKILL.md)를 읽는다.
- 이름·추출·주석·접근성과 행동 검증은 [readable-ui](../readable-ui/SKILL.md)를 따른다.

## 작업 흐름

1. 현재 route, 데이터 소유자와 Server/Client 경계를 짧게 요약한다.
2. 변경 후 폴더 구조와 import 방향을 제안한다.
3. public contract와 외부 데이터 schema를 먼저 정의한다.
4. 가장 작은 vertical slice를 구현한다.
5. loading, empty, error, success 상태를 확인한다.
6. typecheck, lint, test, production build 중 프로젝트에 있는 검증을 실행한다.

## 위험 신호

- 모든 컴포넌트가 `'use client'`로 시작함
- `page.tsx`에 API client, 변환, 상태, 대형 UI가 모두 들어 있음
- Server Component가 자기 Route Handler를 호출함
- 범용 `components`, `hooks`, `utils` 폴더에 도메인 코드가 섞임
- 하나의 `types/index.ts`가 모든 도메인을 export함
- 서로 다른 상태 도구에 같은 데이터를 복제함
- 사용 사례 없이 route group, parallel route 또는 intercepting route를 도입함

## 완료 기준

- [ ] route 구조만 보고 주요 URL과 layout 관계를 이해할 수 있다.
- [ ] Server/Client 경계가 상호작용이 필요한 최소 범위다.
- [ ] 데이터마다 단일 소유자가 있다.
- [ ] 외부 입력과 응답이 경계에서 검증된다.
- [ ] loading, empty, error, success 상태가 정의되었다.
- [ ] metadata와 접근성 요구사항을 확인했다.
- [ ] 기존 기능과 URL 호환성이 유지되었다.
- [ ] 프로젝트의 자동 검증을 통과했다.

## 공식 기준

- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Next.js Backend for Frontend](https://nextjs.org/docs/app/guides/backend-for-frontend)
