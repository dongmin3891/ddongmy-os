# Store 모델과 selector

Zustand v5 기준이다. 공통 이름·추출 규칙은 [readable-ui](../../readable-ui/SKILL.md)를
따른다. 아래 선택 ID는 URL에 노출하지 않는 편집 화면의 임시 선택을 가정한다.

## 읽기 쉬운 기본 구조

store는 사용하는 feature 가까이에 둔다.

```text
features/
└── project-editor/
    ├── components/
    └── store/
        ├── project-editor-store.ts
        ├── project-editor-provider.tsx   # SSR 또는 주입이 필요할 때
        └── project-editor-selectors.ts   # selector가 많아질 때만
```

작은 store는 한 파일로 시작한다. state, action과 selector가 독립적인 변경 이유를 가질
때만 나눈다.

## Store 모델

state와 action 타입을 구분해 읽되 최종 store 타입은 하나로 조합한다.

```ts
type ProjectEditorState = {
  selectedProjectId: string | null
  isPreviewOpen: boolean
}

type ProjectEditorActions = {
  selectProject: (projectId: string) => void
  clearSelection: () => void
  openPreview: () => void
  closePreview: () => void
}

type ProjectEditorStore = ProjectEditorState & ProjectEditorActions

const initialProjectEditorState: ProjectEditorState = {
  selectedProjectId: null,
  isPreviewOpen: false,
}
```

### 모델링 규칙

- action 이름은 `setValue`보다 `selectProject`, `openPreview`처럼 사용자 의도를
  표현한다.
- 계산 가능한 값은 store에 중복 저장하지 않고 selector로 파생한다.
- loading/error 상태는 해당 비동기 작업의 소유자가 관리한다.
- 하나의 거대한 app store보다 변경 이유가 같은 domain store를 선호한다.
- 여러 store 사이의 action 호출과 숨은 결합이 늘면 상태 경계를 다시 설계한다.

## Selector와 렌더링

필요한 값만 구독한다.

```tsx
const selectedProjectId = useProjectEditorStore(
  (state) => state.selectedProjectId,
)
const selectProject = useProjectEditorStore((state) => state.selectProject)
```

- `useStore()`로 store 전체를 구독하지 않는다.
- selector가 새 객체나 배열을 만들면 개별 selector로 나누거나 현재 버전에 맞는
  `useShallow`를 사용한다.
- 단순한 selector를 무조건 별도 파일이나 자동 생성 도구로 추상화하지 않는다.
- 비싼 파생 연산은 selector의 참조 안정성과 실제 render 비용을 확인한다.

## Selector 확인

- 관계없는 필드가 바뀌었을 때 구독 UI가 불필요하게 다시 렌더링되지 않는지 확인한다.
- selector가 매 호출마다 새 배열·객체를 반환하면 참조 안정성을 검토한다. v5에서는
  불안정한 결과가 반복 렌더 문제를 만들 수 있다.
- `useShallow`가 필요한 경우 설치 버전의 import 경로와 사용법을 확인한다.
- 전체 store 타입은 UI가 필요한 selector를 표현할 때만 공개한다.

## 공식 자료

- [Zustand v5 Migration](https://zustand.docs.pmnd.rs/reference/migrations/migrating-to-v5.html)
- [Zustand useShallow](https://zustand.docs.pmnd.rs/learn/guides/prevent-rerenders-with-use-shallow.html)
