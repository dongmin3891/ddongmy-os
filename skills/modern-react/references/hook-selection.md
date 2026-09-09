# React Hook 선택 가이드

Hook 이름보다 해결하려는 상태와 동기화 문제를 먼저 찾는다.

## Local state

| 상황 | 기본 선택 | 확인할 점 |
| --- | --- | --- |
| 독립적인 단순 값 | `useState` | 파생 가능한 값인지 먼저 확인 |
| 여러 event가 복잡한 전이를 만듦 | `useReducer` | reducer를 순수하게 유지 |
| render와 무관한 mutable 값 | `useRef` | UI에 표시할 값이면 state 사용 |
| subtree에 안정적인 의존성 제공 | `useContext` | 값 identity와 Provider 범위 확인 |

## External synchronization

| 상황 | 기본 선택 | 확인할 점 |
| --- | --- | --- |
| 외부 시스템 연결·구독 | `useEffect` | cleanup과 dependency |
| paint 전에 DOM 측정·보정 | `useLayoutEffect` | browser 전용 여부와 blocking 비용 |
| 외부 store 구독 | `useSyncExternalStore` | server snapshot과 hydration |
| CSS-in-JS 스타일 삽입 | `useInsertionEffect` | library 구현 외 일반 앱에서 거의 불필요 |
| Effect가 호출하는 비반응성 event | `useEffectEvent` | React 19.2+, lint 회피 금지 |

## Async와 responsiveness

| 상황 | 기본 선택 | 확인할 점 |
| --- | --- | --- |
| 지연 가능한 state update | `useTransition` | 입력 값 자체에는 사용하지 않음 |
| 느린 파생 UI에 이전 값 유지 | `useDeferredValue` | 고정 debounce 대체가 아님 |
| action 결과를 state로 사용 | `useActionState` | React 19+, 호출 context와 queue |
| action 중 임시 성공 UI | `useOptimistic` | React 19+, rollback과 최종 동기화 |
| 부모 form 제출 상태 | `useFormStatus` | React DOM 19+, form 내부 자식에서 호출 |
| Promise 또는 Context resource 읽기 | `use` | React 19+, Suspense와 framework 지원 |

## Identity와 성능

| 상황 | 기본 선택 | 확인할 점 |
| --- | --- | --- |
| 비싼 계산 재사용 | `useMemo` | 측정 가능한 비용과 dependency |
| memoized 자식에 안정 callback 전달 | `useCallback` | 자식 최적화가 실제로 필요한지 |
| 접근성 ID 생성 | `useId` | list key로 사용하지 않음 |
| debugging label 제공 | `useDebugValue` | custom Hook 개발 경험에 가치가 있을 때 |

## Hook이 필요 없는 경우

### 파생 값

```tsx
const visibleProjects = projects.filter((project) => project.isVisible)
```

`visibleProjects`를 Effect로 별도 state에 저장하지 않는다.

### 사용자 event

```tsx
function submitProject() {
  analytics.track('project_submitted')
  onSubmit()
}
```

사용자가 submit했다는 사실에 반응하는 작업은 Effect보다 handler에 둔다.

### 초기 state 계산

```tsx
const [index] = useState(() => buildInitialIndex(items))
```

초기 계산이 비싸면 lazy initializer를 사용한다. mount Effect에서 다시 설정하지 않는다.

## 선택 검증 질문

- 이 값의 원본은 어디인가?
- render 중 계산할 수 있는가?
- 변경을 일으키는 event는 무엇인가?
- React 밖의 시스템과 동기화하는가?
- 사용자가 기다리는 동안 어떤 UI가 필요한가?
- 실패하면 어떤 상태로 돌아가야 하는가?
- 선택한 Hook이 현재 React와 renderer에서 안정적으로 지원되는가?
