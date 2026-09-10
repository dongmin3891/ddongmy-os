---
name: tanstack-query
description: >
  React 프로젝트에서 TanStack Query를 설계·구현·리팩터링·검토할 때 사용한다.
  query key, queryOptions, mutation, invalidation, optimistic update, pagination,
  polling, SSR과 Next.js App Router hydration을 다룬다. 로컬 UI 상태나 단순한
  Server Component 데이터 조회에는 사용하지 않는다.
---

# TanStack Query

## 이 스킬의 기준

TanStack Query는 **원격 서버 상태의 비동기 수명 주기와 캐시**를 관리한다.
최우선 기준은 가독성이다. 화면에서 데이터의 정체, 입력, 초기 상태와 갱신 상태가
바로 보여야 하고, 정의로 이동하면 key·요청·cache 정책을 한 번에 찾을 수 있어야 한다.

- 한 곳에서만 쓰는 짧은 query는 컴포넌트 가까이에 직접 적어도 된다.
- prefetch·invalidation·여러 화면에서 재사용할 때 `queryOptions`를 feature 가까이에 뺀다.
- custom hook과 key factory는 호출부의 의미를 더 선명하게 할 때만 만든다.
- star 수와 유명세는 조사 후보를 고르는 신호일 뿐, 프로젝트에 복사할 근거가 아니다.
- 공식 문서는 동작 보증에, 실제 레포지토리는 읽기 흐름과 규모별 trade-off 판단에 쓴다.

## 먼저 확인한다

1. 설치된 `@tanstack/react-query` major version을 확인한다.
2. React framework, SSR, RSC와 hydration 사용 여부를 확인한다.
3. 기존 API client, schema validator, query key와 error 처리 규칙을 확인한다.
4. 데이터의 최신성, 재시도, polling, pagination과 mutation 요구사항을 확인한다.
5. 패키지 업그레이드는 사용자가 요청한 범위에 포함될 때만 수행한다.

## 사용 판단

### 사용한다

- Client Component가 동일한 원격 데이터를 공유한다.
- 사용자 상호작용 후 refetch가 필요하다.
- polling, infinite query, pagination 또는 optimistic update가 필요하다.
- mutation 이후 관련 원격 cache를 갱신해야 한다.
- offline·focus·reconnect 동작을 관리해야 한다.

### 사용하지 않는다

- Server Component에서 한 번 읽고 HTML로 렌더링하면 충분하다.
- 값이 URL에 있어야 공유·새로고침·뒤로 가기가 자연스럽다.
- 한 컴포넌트의 열림/닫힘 같은 로컬 UI 상태다.
- 아직 API 호출조차 없는 정적 데이터다.
- Zustand나 Context로 이미 관리하는 순수 client state다.

## Query와 컴포넌트의 책임

- transport는 HTTP 실패·응답 검증·공개 모델 변환을 맡는다.
- query option은 key, query function과 cache 정책을 해당 feature 가까이에 묶는다.
- key에는 결과를 바꾸는 모든 입력을 포함하고 계층으로 invalidation 범위를 표현한다.
- 정규화한 입력을 key와 실제 요청 양쪽에 사용한다. list와 infinite cache는 구분한다.
- query function은 오류를 throw하고 가능한 transport에 `AbortSignal`을 전달한다.
- `select`는 가벼운 파생 값·구독 범위 축소에 사용한다.
- 컴포넌트는 화면 상태를 표현한다. query 결과를 Effect로 local state나 Zustand에 복사하지 않는다.
- 컴포넌트에서는 `projectsQuery`, `renameProjectMutation`처럼 역할이 보이는 결과 객체를
  유지한다. 여러 query의 `data`, `error`, `isPending`을 문맥 없는 이름으로 한꺼번에
  구조 분해하지 않는다.
- 호출부에서 transport까지 `화면 → query option → 도메인 요청 함수` 정도의 짧은
  이동으로 추적되어야 한다. 책임 없는 범용 wrapper가 이 경로를 늘리면 제거한다.

## 필요한 문서만 읽는다

- key·`queryOptions`·화면 예시는 [references/query-options.md](references/query-options.md)를 읽는다.
- SSR prefetch·Provider·hydration은 [references/hydration.md](references/hydration.md)를 읽는다.
- 팩의 규칙을 바꾸거나 큰 query layer를 리팩터링할 때는
  [references/repository-evidence.md](references/repository-evidence.md)를 읽는다.
- 요청·응답과 함수 계약은 [readable-contracts](../readable-contracts/SKILL.md)를 따른다.
- 요청 실행, HTTP 오류·취소·timeout과 transport retry는
  [http-client](../http-client/SKILL.md)를 따른다.
- 이름·추출·상태 분기·접근성과 행동 검증은 [readable-ui](../readable-ui/SKILL.md)를 따른다.
- 응답 검증·DTO 변환은 [schema-at-boundary](../schema-at-boundary/SKILL.md)를 따른다.

## Cache 정책

- `staleTime`은 “이 데이터가 얼마 동안 신선한가”라는 제품 요구사항에서 결정한다.
- `gcTime`은 사용하지 않는 cache의 메모리 보존 시간이다. `staleTime`과 같은 의미로
  사용하지 않는다.
- 기본 refetch와 retry 동작을 알고 변경한다.
- 모든 query에 같은 전역 설정을 강제하지 말고 공통 의미가 있을 때만 default를 둔다.
- 서버에서 prefetch한 query는 client가 즉시 중복 조회하지 않도록 `staleTime`을
  의도적으로 정한다.

## Mutation과 cache 갱신

Next.js 프로젝트에서 내부 서버 변경의 제출·인가·결과 계약은
[next-forms](../next-forms/SKILL.md)가 담당한다. 이 스킬은 client cache를 어떤 key
범위로 맞출지 정한다.

mutation 성공 후 어떤 화면이 최신 상태여야 하는지 먼저 적는다.

1. 서버 응답이 완전하고 신뢰 가능하면 `setQueryData`로 정확히 반영한다.
2. 서버가 파생 필드를 다시 계산하거나 영향 범위가 넓으면 관련 key를 invalidate한다.
3. 낙관적 갱신은 사용자 경험상 가치가 있고 rollback을 정확히 구현할 수 있을 때만
   사용한다.
4. mutation 오류, 재시도와 중복 요청의 안전성을 API 계약에 맞춘다.

- 모든 query를 무조건 invalidate하지 않는다.
- key의 계층을 이용해 필요한 범위를 읽을 수 있게 지정한다.
- optimistic update는 진행 중 query 취소, 이전 값 snapshot, rollback, 최종 동기화를
  함께 설계한다.

## SSR 판단

- Server Component로 충분하면 Query를 도입하지 않는다.
- client refetch가 필요한 첫 화면에 prefetch가 유용할 때 hydration을 사용한다.
- server QueryClient는 요청 간 공유하지 않고 browser에서는 수명을 안정적으로 유지한다.
- 같은 원본을 서버 HTML과 Query가 별도로 갱신하면 값이 어긋날 수 있다. 각각 보여주는
  영역과 갱신 주체를 명시하고 실제 mutation 후 일관성을 검증한다.

## 행동 검증

key에 포함한 filter·사용자 변경이 독립된 데이터를 반환하는지 확인한다. mutation 후
영향받는 목록·상세의 갱신, 실패 rollback과 최종 동기화를 확인한다. SSR이면 첫 화면의
hydration 경고, 중복 요청과 사용자 간 cache 격리를 검증한다. 기존 성공 데이터가 있는
refetch 오류와 데이터가 없는 초기 오류를 각각 확인한다.

## 작업 흐름

1. 원격 데이터의 소유자, key와 최신성 요구사항을 적는다.
2. 가장 단순한 호출부를 먼저 적고 inline·option·custom hook 중 필요한 깊이를 고른다.
3. transport와 응답 schema를 정의한다.
4. 재사용 범위가 있으면 query option과 key 계층을 정의한다.
5. 화면의 pending, error, empty, success 상태를 구현한다.
6. mutation과 cache 갱신 범위를 구현한다.
7. 중복 요청, 취소, focus refetch, network 재연결과 hydration을 검증한다.
8. 화면에서 요청 함수와 오류 원인까지 불필요한 wrapper 없이 추적되는지 다시 읽는다.

## 위험 신호

- query 데이터를 Zustand나 component state에 복사함
- query function 입력이 key에 포함되지 않음
- 컴포넌트마다 문자열 query key를 직접 조합함
- 렌더링할 때마다 새 QueryClient를 만듦
- server singleton QueryClient를 여러 요청이 공유함
- 모든 mutation이 전체 cache를 invalidate함
- 이유 없이 `staleTime: Infinity` 또는 refetch 옵션을 끔
- API 응답 검증 전에 cache에 저장함
- prefetch가 순차 실행되어 server waterfall을 만듦
- 모든 query를 이름만 바꾼 custom hook으로 감쌈
- 한 query뿐인데 전역 key factory와 여러 단계 generic을 먼저 만듦
- 여러 query 결과를 `data`, `data2`, `loading`처럼 문맥 없는 이름으로 구조 분해함

## 완료 기준

- [ ] TanStack Query를 사용해야 하는 원격 상태가 맞다.
- [ ] query key가 결과를 결정하는 모든 입력을 포함한다.
- [ ] stale, retry, refetch 정책에 제품 의미가 있다.
- [ ] pending, error, empty, success 상태가 읽기 쉽게 분리되었다.
- [ ] mutation의 cache 갱신 범위가 정확하다.
- [ ] query cancellation과 race condition을 확인했다.
- [ ] SSR 사용 시 요청별 QueryClient와 hydration이 안전하다.
- [ ] 같은 원격 데이터가 다른 상태 도구에 복제되지 않았다.
- [ ] 화면에서 데이터 소유자와 상태 분기, 정의에서 key와 요청을 빠르게 찾을 수 있다.
- [ ] 추상화 단계마다 재사용·정책·도메인 의미 중 하나가 실제로 추가된다.
- [ ] 변경 범위에 맞는 행동 검증과 프로젝트의 관련 자동 검증을 통과했다.

## 참고 기준

- [TanStack Query Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [TanStack Query TypeScript와 queryOptions](https://tanstack.com/query/latest/docs/framework/react/typescript)
- [TanStack Query Advanced Server Rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- [TanStack Query Query Cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation)
- [오픈소스 레포지토리 비교와 채택 근거](references/repository-evidence.md)
