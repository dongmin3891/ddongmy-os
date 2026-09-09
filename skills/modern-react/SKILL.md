---
name: modern-react
description: >
  React 프로젝트에서 현재 설치 버전이 지원하는 안정 API와 현대적인 컴포넌트 패턴을
  선택·구현·리팩터링·검토할 때 사용한다. React 19 Actions, useActionState,
  useOptimistic, use, ref prop과 React 19.2의 Activity, useEffectEvent 등을 포함한다.
  특정 framework나 저장소 구조를 강제하지 않으며 실험 API가 필요한 작업에는 사용하지 않는다.
  이름·컴포넌트 추출 기준은 readable-ui, Next.js 폼의 검증·제출·실패·갱신 흐름은
  next-forms가 담당한다.
---

# Modern React

## 이 스킬의 기준

최신 API를 많이 사용하는 것이 목표가 아니다. 현재 환경에서 지원되는 **가장 단순하고
읽기 쉬운 안정 API**를 선택한다.

- 설치 버전과 renderer 지원 여부를 먼저 확인한다.
- 기존 API가 더 읽기 쉬우면 최신 API로 형식적인 교체를 하지 않는다.
- state의 소유자와 데이터 흐름을 먼저 결정하고 Hook을 선택한다.
- Effect는 외부 시스템과 동기화할 때만 사용한다.
- framework가 제공하는 routing, data fetching과 mutation 기능을 존중한다.

## 먼저 확인한다

1. `react`, renderer(`react-dom`, `react-native` 등)와 type package의 실제 설치 버전을
   lockfile에서 확인한다.
2. Next.js, Remix, React Router, Vite, React Native 등 실행 환경을 확인한다.
3. SSR, hydration, React Server Components와 Server Functions 지원 여부를 확인한다.
4. React Compiler와 `eslint-plugin-react-hooks` 설정을 확인한다.
5. stable, canary, experimental API를 구분한다.
6. package 업그레이드는 사용자가 요청한 경우에만 수행한다.

버전을 확인하지 않은 채 React 19 또는 19.2 API를 작성하지 않는다. 최신 안정 버전이
필요하면 npm stable tag와 React 공식 release 문서를 작업 시점에 다시 확인하고 기준일을
기록한다.

## 필요한 문서만 읽는다

- state, Effect, 성능과 concurrency Hook을 고를 때
  [references/hook-selection.md](references/hook-selection.md)를 읽는다.
- React 19 또는 19.2 기능을 사용하거나 기존 코드를 마이그레이션할 때
  [references/react-19-features.md](references/react-19-features.md)를 읽는다.

## 컴포넌트와 공통 가독성

이름, 역할별 추출, early return, 주석과 UI 행동 검증은
[readable-ui](../readable-ui/SKILL.md)를 따른다. 이 스킬은 React API와 동기화 의미에 집중한다.

- 관련 state는 가장 가까운 공통 소유자에 둔다.
- 파생 가능한 값은 render 중 계산하고 render는 순수하게 유지한다.
- custom Hook은 실제 Hook을 조합하는 동작에만 사용하고 Hook 호출 순서를 보존한다.

## State 소유자와 Hook 선택

[readable-ui의 상태 성격별 소유자](../readable-ui/SKILL.md#상태-성격별-소유자)를
기준으로 소유자를 정한 뒤 필요한 Hook을 선택한다.

- 독립적인 local 값은 `useState`를 사용한다.
- event별 전이가 복잡하면 `useReducer`를 고려한다.
- 가까운 subtree에 의존성을 전달하면 Context를 고려한다.
- 여러 영역의 client workflow에는 필요할 때 외부 store를 고려한다.

같은 원본을 props, local state, Context와 외부 store에 복제하지 않는다.

## Effect 규칙

- Effect는 network connection, DOM API, timer, subscription, analytics처럼 React 밖의
  시스템과 동기화할 때 사용한다.
- props나 state에서 계산 가능한 값을 Effect로 다시 저장하지 않는다.
- 사용자 event에 따른 작업은 event handler에서 처리한다.
- Effect마다 setup과 cleanup을 함께 읽을 수 있게 둔다.
- dependency를 숨기기 위해 lint를 끄거나 빈 배열을 사용하지 않는다.
- React 19.2 이상에서 Effect 내부의 비반응성 event가 필요하면 `useEffectEvent`를
  검토하되 lint 회피 수단으로 사용하지 않는다.

## 비동기 UI와 Actions

- 긴급한 입력과 지연 가능한 update를 구분한다.
- pending 상태가 필요한 action은 `useTransition` 또는 환경이 지원하는 Action API를
  고려한다.
- action 결과가 다음 state가 되는 경우 React 19 이상의 `useActionState`를 고려한다.
- 서버 응답을 기다리는 동안 되돌릴 수 있는 임시 UI가 유용하면 `useOptimistic`을
  고려한다.
- web form의 제출 상태는 React DOM 19 이상의 `useFormStatus`를 고려한다.
- 중복 제출, 실패, 취소, rollback과 접근 가능한 pending 표현을 함께 설계한다.

최신 Hook을 사용하는 것만으로 API 호출의 멱등성이나 race condition이 해결된다고
가정하지 않는다.

## 성능

- 성능 최적화 전에 실제 render 또는 interaction 병목을 확인한다.
- `useMemo`와 `useCallback`은 정확성 도구가 아니라 성능 최적화 도구로 취급한다.
- React Compiler가 활성화된 프로젝트에는 관성적으로 수동 memoization을 추가하지 않는다.
- 무거운 non-urgent render에는 `useDeferredValue` 또는 `useTransition`을 검토한다.
- 외부 store 구독에는 직접 만든 Effect보다 `useSyncExternalStore`를 우선 검토한다.
- list key에는 배열 index보다 데이터의 안정적인 identity를 사용한다.

## Ref와 DOM

- ref는 focus, selection, measurement, imperative media control처럼 선언형 props로
  표현하기 어려운 작업에 사용한다.
- render 중 `ref.current`를 읽거나 수정하지 않는다.
- React 19 이상에서는 새 function component에 `ref` prop 사용을 고려한다.
- React 18 이하 또는 호환성이 필요한 library component는 `forwardRef`를 유지한다.
- callback ref가 cleanup을 반환하는 React 19 동작과 type 변경을 확인한다.

## Framework와 renderer 경계

- `react-dom` API는 web renderer에서만 사용한다.
- React Server Components, server cache와 Server Functions는 이를 실제로 지원하는
  framework에서만 사용한다.
- Next.js 전용 directive와 cache API를 일반 React 규칙처럼 사용하지 않는다.
- React Native에서는 해당 renderer가 기능을 지원하는지 별도로 확인한다.
- library code는 지원 범위의 가장 낮은 React version에서 동작하도록 peer dependency와
  build output을 확인한다.

## 폼과 경계 검증

React Action과 Hook의 동작은 이 스킬의 reference에서 확인한다. Next.js 폼의 서버
검증·인가·성공 후 갱신은 [next-forms](../next-forms/SKILL.md), 외부 입력의 parser와
공개 모델은 [schema-at-boundary](../schema-at-boundary/SKILL.md)를 해당 작업 때만 읽는다.

## 작업 흐름

1. 현재 React 생태계 버전과 renderer 기능을 확인한다.
2. state 소유자와 event, Effect, async 경계를 짧게 정리한다.
3. 지원되는 안정 API 중 가장 단순한 것을 선택한다.
4. pending, error, empty, success와 optimistic 상태를 필요한 만큼 구현한다.
5. Strict Mode, hydration, keyboard와 screen reader 동작을 확인한다.
6. typecheck, lint, test와 production build 중 프로젝트에 있는 검증을 실행한다.

## 위험 신호

- 버전 확인 없이 최신 Hook을 import함
- 파생 값을 Effect로 state에 복사함
- event handler 대신 Effect가 사용자 작업을 실행함
- lint dependency 경고를 무시하거나 비활성화함
- 모든 함수와 객체를 `useCallback`과 `useMemo`로 감쌈
- `useOptimistic` 사용 후 실패 rollback과 서버 동기화가 없음
- `useEffectEvent`를 dependency 제거 수단으로 사용함
- `useFormStatus`를 form의 자식이 아닌 곳에서 호출함
- React 19만 지원하는 library가 peer dependency 범위를 넓게 선언함
- framework 전용 RSC API를 일반 SPA에서 사용함

## 완료 기준

- [ ] 실제 설치 버전과 renderer가 선택한 API를 지원한다.
- [ ] 실험 API를 안정 API처럼 사용하지 않았다.
- [ ] state마다 단일하고 명확한 소유자가 있다.
- [ ] render가 순수하고 Effect는 외부 동기화만 담당한다.
- [ ] async UI의 pending, error와 rollback 동작이 정의되었다.
- [ ] memoization에는 확인 가능한 이유가 있다.
- [ ] Strict Mode와 hydration에서 불필요한 부작용이 없다.
- [ ] 접근성과 기존 public component contract가 유지되었다.
- [ ] 프로젝트의 자동 검증을 통과했다.

## 공식 기준

- [React 최신 문서](https://react.dev/reference/react)
- [React 19](https://react.dev/blog/2024/12/05/react-19)
- [React 19.2](https://react.dev/blog/2025/10/01/react-19-2)
- [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
