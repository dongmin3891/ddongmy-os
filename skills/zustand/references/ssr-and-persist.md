# SSR과 persist 수명

Zustand v5 기준이다. store의 state·action 타입은
[store-and-selectors.md](store-and-selectors.md)의 예시를 사용한다.

## Next.js App Router와 SSR

### 기본값

- React Server Component에서 Zustand store를 읽거나 수정하지 않는다.
- 서버 module scope에 요청별 상태를 가진 singleton store를 만들지 않는다.
- SSR이 있는 Next.js에서는 vanilla store factory와 Client Provider를 기본으로 고려한다.
- server와 client의 초기 상태가 같아야 한다.
- Provider는 store가 필요한 가장 가까운 안정적인 layout 또는 feature 경계에 둔다.

```ts
import { createStore } from 'zustand/vanilla'

export const createProjectEditorStore = (
  initialState: ProjectEditorState = initialProjectEditorState,
) =>
  createStore<ProjectEditorStore>()((set) => ({
    ...initialState,
    selectProject: (selectedProjectId) => set({ selectedProjectId }),
    clearSelection: () => set({ selectedProjectId: null }),
    openPreview: () => set({ isPreviewOpen: true }),
    closePreview: () => set({ isPreviewOpen: false }),
  }))
```

Provider에서는 `useState(() => createProjectEditorStore(initialState))` 같은 안정적인
초기화 방식으로 store를 한 번 만들고,
Context에 Store API를 제공한 뒤 `useStore(store, selector)`로 구독한다.

## Persist

persist는 “새로고침 후에도 반드시 남아야 하는 상태”에만 사용한다.

- `partialize`로 필요한 필드만 저장한다.
- 저장 schema를 변경할 수 있으면 `version`과 `migrate`를 정의한다.
- localStorage 값도 신뢰할 수 없는 외부 입력으로 보고 복원 전에 검증한다.
- token, 권한 판정, 민감 정보와 서버 데이터 전체를 저장하지 않는다.
- SSR에서 browser storage 때문에 markup이 달라지면 `skipHydration`과 명시적
  `rehydrate`를 고려한다.
- hydration 완료 전 UI와 완료 후 UI가 달라질 때 loading 또는 안정적인 placeholder를
  설계한다.

## 복원 순서와 실패 정책

1. server와 client의 첫 렌더는 같은 기본값·주입값으로 만든다.
2. browser storage를 사용하는 persist는 필요하면 `skipHydration: true`로 자동 복원을
   미루고 client mount 후 `rehydrate()`한다. 이 Effect는 외부 저장소와의 동기화다.
3. `partialize`에는 실제 유지할 필드만 넣는다. 저장 값·version이 맞는지 확인하고
   이전 version은 `migrate`, 현재 version도 `merge` 또는 storage adapter에서 검증한다.
4. 검증한 필드만 현재 state에 합친다. 저장된 객체를 통째로 spread해 action이나 서버
   주입값을 덮어쓰지 않는다. 잘못된 값은 기본값으로 복구한다.
5. storage 접근·JSON 해석·migration 실패에도 준비 상태가 끝나도록 실패 경로를 둔다.
   무한 placeholder를 남기지 않는다.

`hasHydrated()`를 render에서 한 번 읽는 것만으로 완료 시 다시 렌더링되지 않는다.
`onHydrate`·`onFinishHydration` 구독 또는 명시적인 준비 state로 UI를 갱신하고 구독을
해제한다. 이미 복원된 경우와 실패한 경우도 포함한다.

Provider 초기 props가 바뀌었다고 기존 store가 자동 초기화되지는 않는다. route 이동,
편집 대상 변경과 logout 중 무엇이 reset 조건인지 정하고 명시적 reset 또는 Provider
key를 사용한다. RSC는 직렬화 가능한 초기 props만 전달하고 store API를 읽지 않는다.

## 검증

- 두 사용자 요청이 서로 다른 store를 가지며 첫 server/client markup이 같은지 확인한다.
- 새로고침, Provider 유지·재생성, 대상 변경과 logout의 reset 정책을 확인한다.
- 저장 값 없음·이전 version·현재 version의 잘못된 타입·storage 사용 불가를 확인한다.
- 복원 후 값은 적용되고 action 함수는 그대로 남는지 확인한다.

## 공식 자료

- [Zustand Next.js](https://zustand.docs.pmnd.rs/learn/guides/nextjs.html)
- [Zustand Persist](https://zustand.docs.pmnd.rs/reference/middlewares/persist.html)
