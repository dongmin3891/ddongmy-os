---
name: zustand
description: >
  React 프로젝트에서 Zustand client state를 설계·구현·리팩터링·검토할 때 사용한다.
  store 경계, action, selector, slice, persist, hydration과 Next.js App Router SSR
  통합을 다룬다. 원격 서버 상태 cache나 단일 컴포넌트의 단순 상태에는 사용하지 않는다.
---

# Zustand

## 이 스킬의 기준

Zustand는 **여러 Client Component가 공유하는 client state**를 관리한다. store를 작고
도메인 중심으로 유지하며, 상태의 의미와 변경 action을 한 화면에서 읽을 수 있게 만든다.

- 한 컴포넌트에서 끝나는 상태는 `useState`를 우선한다.
- 공유 가능한 navigation 상태는 URL을 우선한다.
- 원격 서버 상태는 TanStack Query 또는 framework data layer가 소유한다.
- Zustand에는 UI, editor draft, multi-step workflow처럼 client가 소유하는 상태만 둔다.

## 먼저 확인한다

1. 설치된 Zustand major version과 middleware 사용 여부를 확인한다.
2. Next.js SSR/RSC, 순수 SPA 또는 다른 React framework인지 확인한다.
3. 상태의 실제 소유자와 새로고침 후 유지 여부를 확인한다.
4. 기존 store, Context, TanStack Query와 URL state의 중복을 확인한다.
5. package upgrade나 store 전면 통합은 요청 범위에 포함될 때만 수행한다.

## 사용 판단

공통 기준은 [readable-ui의 상태 성격별 소유자](../readable-ui/SKILL.md#상태-성격별-소유자)를 따른다.
아래 표는 Zustand에 넣을 상태를 판단할 때 사용한다.

| 상태 | 기본 선택 |
| --- | --- |
| 한 컴포넌트의 입력·열림 상태 | `useState` / `useReducer` |
| 가까운 subtree의 의존성 주입 | React Context |
| 검색, 정렬, pagination, 선택된 탭 | URL state |
| API에서 가져온 원격 데이터 | TanStack Query / Server Component |
| 여러 화면이 공유하는 client workflow | Zustand |
| 새로고침 후 유지할 사용자 UI 설정 | Zustand `persist` 또는 전용 storage |

Zustand가 편하다는 이유만으로 모든 상태를 global store로 올리지 않는다.

## Store 경계

- 변경 이유가 같은 domain state와 action을 해당 feature 가까이에 둔다.
- 계산 가능한 값은 selector로 파생하고 비동기 loading/error는 그 작업 소유자에게 둔다.
- 여러 필드를 함께 바꿔야 하는 전이는 하나의 action으로 표현한다.
- 작은 store는 한 파일로 시작한다. 공통 이름·추출·주석과 행동 검증은
  [readable-ui](../readable-ui/SKILL.md)를 따른다.

## 필요한 문서만 읽는다

- state·action·selector 구현은 [references/store-and-selectors.md](references/store-and-selectors.md)를 읽는다.
- Provider 수명·SSR·저장 값 복원은 [references/ssr-and-persist.md](references/ssr-and-persist.md)를 읽는다.
- 저장 값의 parser·오류 처리는 [schema-at-boundary](../schema-at-boundary/SKILL.md)를 따른다.

## Action 규칙

- 상태 변경은 이름 있는 action을 통해 수행한다.
- 이전 상태에 의존하면 함수형 `set((state) => ...)`을 사용한다.
- action 안에서 예측하기 어려운 navigation, toast와 API 호출을 뒤섞지 않는다.
- 비동기 action이 필요하면 원격 상태 cache와 중복되지 않는지 먼저 확인한다.
- 외부 side effect는 가능한 한 호출하는 use case 또는 service에 둔다.
- 여러 필드를 항상 함께 바꿔야 하면 하나의 도메인 action으로 원자적으로 갱신한다.

## Selector·SSR·persist 판단

- UI는 필요한 값만 구독한다. 새 객체·배열 selector는 개별 구독이나 `useShallow`로
  안정성을 확보하고 불필요한 selector 추상화는 만들지 않는다.
- RSC에서 store를 읽거나 수정하지 않는다. SSR이면 요청 간 state를 공유하지 않도록
  store factory와 Client Provider 수명을 설계하고 첫 server/client 값을 맞춘다.
- Provider는 필요한 가장 가까운 안정적인 경계에 둔다. route 이동·logout·편집 대상
  변경 중 어느 시점에 reset되는지 명시한다.
- persist는 새로고침 후 남겨야 할 client 값에만 적용한다. 저장 범위, schema version,
  migration, 현재 값 검증과 복원 실패 시 기본값을 정의한다.
- token·권한 판정·민감 정보·서버 데이터 전체를 persist하지 않는다.
- browser 복원과 SSR 첫 렌더가 다르면 hydration을 명시적으로 조정한다.

## Slice 사용 기준

slice는 store가 실제로 커져 서로 다른 영역의 변경이 충돌할 때 도입한다.

- slice별 state와 action의 책임을 명확히 한다.
- 여러 slice를 넘나드는 action은 별도의 조정 책임으로 드러낸다.
- middleware는 개별 slice가 아니라 조합된 store에 적용한다.
- slice가 서로 강하게 참조하면 하나의 도메인으로 합치거나 store 경계를 다시 나눈다.
- 작은 store를 형식적으로 여러 slice로 쪼개지 않는다.

## TanStack Query와 함께 사용할 때

원격 원본과 mutation 후 cache 갱신은 [tanstack-query](../tanstack-query/SKILL.md)가 소유한다.

```text
TanStack Query: 서버가 소유하는 데이터와 비동기 상태
Zustand:        클라이언트가 소유하는 UI와 workflow 상태
URL:            공유·복원·탐색 가능한 상태
```

- query의 `data`, `isPending`, `error`를 Zustand에 복사하지 않는다.
- Zustand에는 `selectedProjectId`처럼 원격 데이터의 식별자만 필요에 따라 둔다.
- 실제 project 데이터는 그 ID를 포함한 query key로 읽는다.
- mutation 결과는 TanStack Query cache에서 갱신한다.

## 작업 흐름

1. 상태 목록과 각 상태의 소유자를 표로 정리한다.
2. local, URL, server, shared client state로 분류한다.
3. Zustand가 필요한 최소 상태와 action을 정의한다.
4. Next.js라면 store lifetime과 hydration 전략을 먼저 결정한다.
5. 필요한 selector와 persist 범위를 구현한다.
6. render 범위, 새로고침, route 이동, hydration과 초기화를 검증한다.

## 위험 신호

- API 응답 전체를 store에 복사함
- 인증 여부를 localStorage 값만으로 판정함
- Next.js server에서 요청별 store를 singleton으로 공유함
- RSC가 store를 읽거나 action을 호출함
- 모든 state와 action을 한 번에 destructuring함
- 파생 가능한 값을 별도 state로 저장함
- 하나의 app store가 무관한 모든 도메인을 포함함
- persist에 version, migration 또는 저장 범위가 없음
- action마다 API, toast, navigation side effect가 뒤섞임
- 작은 store에 slice와 middleware를 과도하게 도입함

## 완료 기준

- [ ] Zustand가 필요한 shared client state가 맞다.
- [ ] 원격 상태와 URL 상태가 store에 중복되지 않았다.
- [ ] state와 action 이름만으로 의도를 이해할 수 있다.
- [ ] selector가 필요한 값만 구독한다.
- [ ] Next.js 사용 시 store가 요청 간 공유되지 않는다.
- [ ] server/client 초기 렌더가 hydration-safe하다.
- [ ] persist 범위, version과 migration 정책을 확인했다.
- [ ] reset 시점과 route 이동 시 store lifetime이 명확하다.
- [ ] 변경 범위에 맞는 상태 전이·복원 검증과 관련 자동 검증을 통과했다.

## 공식 기준

- [Zustand Setup with Next.js](https://zustand.docs.pmnd.rs/learn/guides/nextjs.html)
- [Zustand Selectors](https://zustand.docs.pmnd.rs/learn/guides/auto-generating-selectors.html)
- [Zustand Slices Pattern](https://zustand.docs.pmnd.rs/learn/guides/slices-pattern.html)
- [Zustand Persist Middleware](https://zustand.docs.pmnd.rs/reference/middlewares/persist.html)
