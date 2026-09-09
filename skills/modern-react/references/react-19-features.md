# React 19 안정 기능 가이드

이 문서는 설치된 React와 renderer 버전을 확인한 뒤 필요한 부분만 적용한다. 정확한 최신
patch version은 문서에 고정하지 않고 npm stable tag와 React 공식 release에서 확인한다.

## 지원 범위

| 최소 버전 | 기능 |
| --- | --- |
| React 19 | Actions, `useActionState`, `useOptimistic`, `use`, function component의 `ref` prop |
| React DOM 19 | function form action, `useFormStatus`, `requestFormReset` |
| React 19.2 | `<Activity>`, `useEffectEvent`, `cacheSignal` |

React package 버전만으로 충분하지 않을 수 있다. framework, renderer, type package와
lint plugin이 해당 기능을 지원하는지도 확인한다.

## Actions

Action은 async transition과 form action을 포함하는 비동기 작업 패턴이다.

### 사용한다

- mutation의 pending state와 결과를 UI에 연결한다.
- form 제출과 action 결과를 하나의 읽기 쉬운 흐름으로 만든다.
- framework의 Server Function과 React form을 통합한다.

Next.js에서 서버 검증·인가·오류 계약·cache 갱신까지 연결할 때는
[next-forms](../../next-forms/SKILL.md)를 읽는다. 여기서는 React API의 선택과 제약만 다룬다.

## `useActionState`

action의 이전 결과, dispatcher와 pending 상태가 함께 필요할 때 사용한다.

```tsx
const [result, submitAction, isPending] = useActionState(
  updateProfile,
  initialResult,
)

return (
  <form action={submitAction}>
    <ProfileFields />
    <button disabled={isPending}>저장</button>
    <p role="status">{result.message}</p>
  </form>
)
```

- 반환 state는 화면이 실제로 사용하는 최소 public result로 만든다.
- action의 첫 번째 인수가 previous state라는 점을 타입과 구현에 반영한다.
- 단순 event handler 하나에 필요 이상의 reducer-like state를 만들지 않는다.

## `useOptimistic`

서버 응답 전 임시 UI가 사용자 경험을 개선하고 실패 시 되돌릴 수 있을 때 사용한다.

- 원본 state와 optimistic state의 관계가 명확해야 한다.
- stable client ID가 필요한 생성 작업은 identity 전략을 정한다.
- 실패 메시지와 rollback 동작을 제공한다.
- server response가 도착하면 authoritative data와 다시 동기화한다.
- 결제, 권한과 파괴적 작업은 화면만 낙관적으로 성공 처리하지 않는다.

## `useFormStatus`

부모 `<form>`의 제출 상태가 필요한 button이나 status component에서 사용한다.

```tsx
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? '저장 중…' : '저장'}
    </button>
  )
}
```

- Hook을 호출하는 component가 관찰할 `<form>`의 자식이어야 한다.
- 동일 component가 반환하는 `<form>`의 상태를 위에서 읽을 수 있다고 가정하지 않는다.
- 시각적 pending 표현뿐 아니라 중복 제출과 접근성도 처리한다.

## `use`

render 중 Promise 또는 Context 같은 resource를 읽을 때 사용한다.

- Promise를 읽으면 Suspense 경계가 필요하다.
- rejected Promise를 처리할 Error Boundary가 필요하다.
- render마다 새 Promise를 만드는 구조를 피한다.
- 일반적인 client data fetching을 모두 `use`로 교체하지 않는다.
- RSC와 streaming 동작은 framework 지원을 확인한다.

`use`는 다른 Hook과 달리 조건문과 반복문 안에서 호출할 수 있지만 component 또는
custom Hook 안에서 호출해야 하며 `try/catch` 안에서 호출하지 않는다. 현재 공식 규칙을
적용 전에 다시 확인한다.

## `ref` prop과 cleanup

React 19의 새 function component는 필요한 경우 `ref`를 prop으로 받을 수 있다.

```tsx
type SearchInputProps = React.ComponentPropsWithoutRef<'input'> & {
  ref?: React.Ref<HTMLInputElement>
}

function SearchInput({ ref, ...props }: SearchInputProps) {
  return <input ref={ref} type="search" {...props} />
}
```

- React 18도 지원하는 library면 `forwardRef`를 유지한다.
- callback ref가 cleanup 함수를 반환할 수 있다.
- 값의 암시적 반환이 cleanup으로 오해되지 않도록 block body를 사용한다.

## `<Activity>` — React 19.2+

숨긴 subtree의 state를 보존하거나 다음 화면을 낮은 우선순위로 준비하는 데 사용한다.

- 단순히 DOM을 숨기는 CSS 대체로 사용하지 않는다.
- hidden 상태에서 Effect가 unmount된다는 점을 고려한다.
- 유지되는 state와 memory 비용이 실제 요구사항에 맞는지 확인한다.
- framework routing과 중복되는 pre-render 전략을 만들지 않는다.

## `useEffectEvent` — React 19.2+

Effect가 외부 시스템의 event를 등록하면서 최신 props/state를 읽어야 하지만 그 값의
변경 때문에 연결 자체를 다시 만들 필요가 없을 때 사용한다.

```tsx
const onConnected = useEffectEvent(() => {
  showNotification('연결됨', theme)
})

useEffect(() => {
  const connection = connect(roomId)
  connection.on('connected', onConnected)
  return () => connection.disconnect()
}, [roomId])
```

- Effect와 의미상 연결된 event에만 사용한다.
- dependency array에서 값을 숨기는 escape hatch가 아니다.
- 같은 component 또는 custom Hook의 Effect와 함께 둔다.
- 호환되는 최신 `eslint-plugin-react-hooks` 규칙을 사용한다.

## `cacheSignal` — React 19.2+ RSC

React Server Components에서 `cache()` 수명이 끝날 때 비동기 작업을 취소하거나 정리할
필요가 있을 때 사용한다.

- 일반 Client Component용 AbortSignal로 사용하지 않는다.
- framework가 React server cache를 지원하는지 확인한다.
- HTTP client가 signal을 실제로 전달하고 취소하는지 확인한다.

## 마이그레이션 원칙

1. React, renderer, type package와 lint plugin을 호환되는 조합으로 맞춘다.
2. 공식 codemod가 있으면 diff를 검토하며 적용한다.
3. deprecated API를 새 API와 한 개념씩 교체한다.
4. Strict Mode에서 render와 Effect의 순수성을 확인한다.
5. SSR 프로젝트는 hydration과 streaming을 확인한다.
6. component library는 peer dependency 하한과 빌드 결과를 별도로 검증한다.

## 공식 자료

- [React 19](https://react.dev/blog/2024/12/05/react-19)
- [React 19.2](https://react.dev/blog/2025/10/01/react-19-2)
- [`useActionState`](https://react.dev/reference/react/useActionState)
- [`useOptimistic`](https://react.dev/reference/react/useOptimistic)
- [`useEffectEvent`](https://react.dev/reference/react/useEffectEvent)
- [`useFormStatus`](https://react.dev/reference/react-dom/hooks/useFormStatus)
