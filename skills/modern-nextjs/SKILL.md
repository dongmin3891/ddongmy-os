---
name: modern-nextjs
description: >
  Next.js의 설치 버전·stable/LTS 확인, upgrade, cache·revalidation API와 build·runtime
  기능을 선택·구현·검토할 때 사용한다. async request API와 bundler 변경의 호환성을
  다룬다. 폴더·의존성·route 조립은 next-app-router, 폼 제출 흐름은 next-forms가
  담당한다. canary나 experimental 기능을 안정 기능처럼 도입하지 않는다.
---

# Modern Next.js

## 이 스킬의 기준

최신 Next.js 기능을 나열하는 것이 아니라 현재 프로젝트에서 지원되는 **안정 기능을
정확한 이유와 함께 선택**한다.

- 설치 버전, router와 배포 환경을 먼저 확인한다.
- stable, Active LTS, Maintenance LTS와 canary를 구분한다.
- 현재 동작하는 구조를 최신 문법으로 보이게 하려고 전면 변경하지 않는다.
- cache는 성능 옵션이 아니라 freshness와 일관성 계약으로 다룬다.
- framework 기능과 React 기능의 지원 범위를 별도로 확인한다.

## 먼저 확인한다

1. `package.json`의 선언 범위와 lockfile의 실제 `next`, `react`, `react-dom` 버전을
   구분해 확인한다.
2. Node.js, TypeScript, React type package와 ESLint 버전을 확인한다.
3. App Router, Pages Router 또는 혼용 구조인지 확인한다.
4. `next.config.*`, custom webpack/Turbopack 설정, `middleware`/`proxy`와 runtime을
   확인한다.
5. SSR, static export, standalone, serverless, edge와 hosting provider 제약을 확인한다.
6. CI, Docker, health check와 rollback 경로를 확인한다.

Next.js 버전에 포함된 문서가 있으면 그 버전과 일치하는 bundled docs를 우선한다.
없으면 공식 문서에서 설치 major/minor에 맞는 version을 선택한다. 검색 결과나 기억만으로
breaking change를 결정하지 않는다.

## 필요한 문서만 읽는다

- 최신 안정 버전 선택 또는 framework upgrade 작업이면
  [references/stable-version-and-upgrade.md](references/stable-version-and-upgrade.md)를 읽는다.
- Next.js 16 계열 기능을 적용하거나 마이그레이션하면
  [references/next-16-features.md](references/next-16-features.md)를 읽는다.
- `cacheComponents`, `'use cache'`, `cacheLife`, `cacheTag` 또는 revalidation 작업이면
  [references/cache-components.md](references/cache-components.md)를 읽는다.

## 안정 기능 선택

### 사용한다

- 현재 설치 버전 또는 승인된 upgrade target에서 stable인 API다.
- 사용자 요구사항을 기존 방식보다 명확하고 안전하게 해결한다.
- runtime과 hosting provider가 지원한다.
- migration과 rollback 범위를 설명할 수 있다.

### 보류한다

- canary, experimental, alpha 또는 beta API다.
- 최신 문서에는 있지만 설치 버전에는 없는 API다.
- 기능 도입을 위해 unrelated architecture까지 바꿔야 한다.
- cache, rendering 또는 navigation 의미를 설명할 수 없다.
- self-hosting 환경에서 필요한 runtime 지원을 확인하지 않았다.

실험 기능은 사용자가 명시적으로 요청하고 위험을 이해한 경우에만 제한된 범위로 적용한다.

## Rendering과 API 호환성

- 기존 router 구조를 유지하고 framework 변경이 rendering·navigation·metadata 계약에
  주는 영향만 확인한다. 폴더와 Server/Client 모듈 설계는
  [next-app-router](../next-app-router/SKILL.md)를 따른다.
- request data API와 params의 async 규칙은 설치 버전의 문서를 따른다.
- 동적 rendering은 실제 request-time 데이터 요구사항으로 결정한다.
- cache 설정을 바꾸면 static shell, streaming, 개인화 영역이 의도대로 유지되는지 확인한다.
- 외부 값은 cache 저장 전에 검증한다. parser·공개 모델 구현은
  [schema-at-boundary](../schema-at-boundary/SKILL.md)를 따른다.
- render 중 mutation, cookie 변경과 invalidation을 하지 않는다. 폼의 검증·인가·변경
  흐름은 [next-forms](../next-forms/SKILL.md)가 담당한다.

## Cache 결정 순서

1. 데이터가 사용자별인지 전체 공유인지 확인한다.
2. 어느 정도 오래된 값을 허용할 수 있는지 정한다.
3. read-your-own-writes가 필요한지 정한다.
4. 시간 기반 또는 event 기반 invalidation을 선택한다.
5. loading UI와 static shell에 포함할 영역을 정한다.
6. 현재 프로젝트가 Cache Components를 사용하는지 확인한다.

cache 옵션을 복사하기 전에 fresh, stale, revalidate, expire의 제품 의미를 적는다.
개인화 데이터와 권한 결과를 공유 cache에 넣지 않는다.

## Cache 갱신과 navigation

- mutation 후 일관성 요구에 따라 `updateTag`, `revalidateTag`, `revalidatePath`,
  `refresh` 중 설치 버전에서 지원하는 가장 좁은 방법을 선택한다.
- tag/path invalidation과 router refresh를 구분한다. client refresh만으로 server data
  cache가 무효화된다고 가정하지 않는다.
- cache helper의 대상·일관성 의도를 이름으로 드러내고, 자명하지 않은 freshness 선택
  이유를 가까이에 기록한다. 공통 이름·주석 규칙은 [readable-ui](../readable-ui/SKILL.md)를 따른다.
- 최신 navigation 기능은 minor version·config·hosting 지원을 확인한 뒤 적용한다.
- 변경한 rendering과 cache가 metadata, 뒤로 가기, loading shell에 주는 영향을 검증한다.

## Build와 runtime

- 설치 버전의 기본 bundler를 확인한다.
- custom webpack 설정이 있으면 Turbopack 호환성을 먼저 검토한다.
- React Compiler는 stable 지원 여부, build 비용과 기존 memoization을 검토한 뒤 활성화한다.
- self-hosting에서는 image optimization, cache 공유, streaming, proxy와 graceful shutdown을
  확인한다.
- `output: 'standalone'`을 사용하면 runtime image가 실제 standalone 산출물을 실행하는지
  확인한다.
- Node.js image는 지원 중인 LTS line과 필요한 native dependency를 확인한다.

## 검증 범위

upgrade는 version matrix·breaking change·production build·대상 runtime을 확인한다.
단일 cache 수정은 최초 조회, stale 허용 구간, mutation 직후 값과 사용자 간 격리를
우선 검증한다. UI를 변경했다면 [readable-ui](../readable-ui/SKILL.md)의 접근성 기준을 적용한다.
배포 smoke test와 rollback 확인은 실제 배포 작업이 범위에 있을 때 수행하며, 배포하지
않았다면 그 제한을 기록한다.

## Upgrade 작업 흐름

1. 현재와 목표 version matrix를 작성한다.
2. rendering, runtime, cache와 public contract의 변경을 구분한다.
3. 공식 upgrade guide와 release note에서 breaking change를 확인한다.
4. codemod가 있으면 별도 diff로 적용하고 수동 검토한다.
5. 한 번에 하나의 runtime 또는 framework 축을 변경한다.
6. lint, typecheck, test, production build와 실제 runtime smoke test를 수행한다.
7. 배포 후 logs, health, 주요 route와 rollback 가능성을 확인한다.

## 위험 신호

- npm `latest` 숫자만 보고 production target을 결정함
- canary 문서의 API를 stable project에 적용함
- Next.js와 React를 각각 독립적으로 최신화하고 호환성을 확인하지 않음
- Pages Router를 이유 없이 App Router로 전면 이전함
- 모든 route에 `force-dynamic` 또는 `'use cache'`를 일괄 적용함
- `revalidatePath('/')`처럼 지나치게 넓은 invalidation을 기본으로 사용함
- Cache Components 활성화 여부를 확인하지 않고 관련 API를 사용함
- custom webpack 설정을 둔 채 기본 bundler 변경을 검증하지 않음
- local build만 확인하고 Docker 또는 production runtime을 검증하지 않음

## 완료 기준

- [ ] 설치 버전과 API 지원 근거를 확인했고, upgrade라면 stable/LTS와 목표를 기록했다.
- [ ] 변경한 기능에 필요한 Node.js·React·tooling·hosting 호환성을 확인했다.
- [ ] 선택한 API가 해당 Next.js version에서 stable이다.
- [ ] 변경한 rendering과 public/private cache 경계가 명확하다.
- [ ] cache와 revalidation 정책에 제품 의미가 있다.
- [ ] metadata, 접근성과 주요 navigation 상태를 확인했다.
- [ ] 변경 범위에 맞는 lint·typecheck·test·production build를 수행했다.
- [ ] 배포 작업이면 대상 runtime smoke test와 rollback 경로를 확인했다.

## 공식 기준

- [Next.js Support Policy](https://nextjs.org/support-policy)
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Upgrade Guides](https://nextjs.org/docs/app/guides/upgrading)
- [Next.js Releases](https://nextjs.org/blog)
