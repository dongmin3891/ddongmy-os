---
name: readable-ui
description: >
  React UI의 이름, 컴포넌트·Hook 추출, 조건 분기와 파일 책임을 설계·리팩터링·검토할 때
  사용하는 공통 가독성 기준이다. UI 코드의 before/after와 접근성·행동 검증 기준을
  제공한다. 라이브러리 API 선택이나 framework 버전 업그레이드는 각 전문 스킬에서 다룬다.
---

# Readable UI

## 이 스킬의 기준

파일을 위에서 아래로 읽으면 **무엇을 보여주고, 누가 상태를 소유하며, 어떤 행동으로
바뀌는지** 알 수 있어야 한다. 짧은 코드보다 의도가 드러나는 코드를 선택한다.

## 먼저 확인한다

1. 화면의 사용자 역할과 변경하려는 동작을 한 문장으로 적는다.
2. 기존 이름, 파일 배치와 공용 컴포넌트를 확인한다.
3. 각 값의 원본과 event, 비동기 작업, 외부 입력의 경계를 찾는다.
4. 현재 동작과 public props를 보존할 범위를 정한다.

## 이름과 파일 책임

- 컴포넌트와 파일은 `ProjectList`, `project-filters.ts`처럼 맡는 역할로 이름 짓는다.
- 사용자 행동 구현에 `handleClick`, `handleChange`를 쓰지 않는다.
  `openProject`, `changeSearchTerm`처럼 의도를 드러낸다. callback prop은
  `onProjectOpen`처럼 호출 계약을 표현하고, 외부 API가 정한 이름은 유지한다.
- boolean은 `isSaving`, `hasProjects`, `canEdit`처럼 긍정문으로 읽히게 한다.
- `data`가 여러 개면 `projectQuery`, `membersQuery`처럼 주어를 붙인다.
  이미 대상이 명확한 짧은 함수 안에서 불필요하게 긴 이름을 만들지 않는다.
- 한 파일에는 함께 바뀌는 UI 역할이나 동작을 둔다. 줄 수 상한으로 분할하지 않는다.
- 새 도메인 코드를 `utils.ts`, `helpers.ts`, 거대한 `types/index.ts`에 모으지 않는다.
  `format-project-budget.ts`, `project.ts`처럼 책임 가까이에 둔다. 기존 shadcn `cn()`
  진입점처럼 역할이 한정된 파일을 이름 때문에 이동하지 않는다.
- 주석은 권한, 브라우저 제약, 일관성 정책 등 코드만으로 알 수 없는 이유를 쓴다.
  함수 이름을 번역한 주석과 낡은 주석은 제거한다.

## 추출한다 / 유지한다

### 추출한다

- 독립적으로 이름 붙일 사용자 역할이 생겼다.
- 같은 의미와 변경 이유를 가진 동작이 실제로 반복된다.
- 상태 전이 또는 외부 동기화를 분리하면 UI 흐름을 더 쉽게 읽을 수 있다.
- 입력 검증·데이터 변환처럼 UI와 다른 책임이 섞였다.

### 그대로 둔다

- 한 번 쓰는 짧은 wrapper가 이름 외에는 의미를 더하지 않는다.
- Hook을 쓰지 않는 순수 계산을 `useSomething`으로 감싸려 한다.
- 줄 수를 줄이기 위해 사용처와 구현 사이를 계속 오가게 만든다.
- 닮은 마크업 두 개를 합치려고 boolean props와 분기가 계속 늘어난다.

한 번 쓰더라도 독립된 역할이면 추출할 수 있다. 재사용 횟수만으로 결정하지 않는다.

## 조건과 상태 흐름

- 오류·초기 로딩·빈 상태는 가능하면 early return으로 처리하고 정상 JSX 한 줄기를 남긴다.
- 일반 Hook은 early return 전에 같은 순서로 호출한다. 조건부 작업은 하위 컴포넌트
  경계나 해당 라이브러리의 활성화 옵션으로 표현한다.
- 짧은 선택은 삼항 연산자를 써도 된다. 중첩 삼항과 복합 조건이 화면 의미를 가리면
  이름 있는 조건이나 역할별 컴포넌트로 나눈다.
- background refetch가 진행된다는 이유로 기존 성공 화면을 skeleton으로 교체하지 않는다.

## 상태 성격별 소유자

| 상태 성격 | 소유자 |
| --- | --- |
| render 중 계산 가능 | 저장하지 않음 |
| 한 컴포넌트의 UI | `useState` / `useReducer` |
| 공유·복원·탐색해야 하는 화면 상태 | URL |
| 서버가 소유하는 데이터 | Server Component 또는 Query |
| 여러 Client 영역의 workflow·초안 | Zustand / Context |

모든 도구를 순서대로 도입하지 않는다.

편집 초안은 서버 원본과 수명이 다른 상태다. 편집 시작, 저장, 취소, 원본 변경 시
동기화 정책이 있으면 별도로 보관할 수 있다.

## Before / After

아래는 책임과 흐름을 비교하는 발췌다. 생략한 import와 도메인 함수는 프로젝트 구현을
사용한다. API 호환성과 상세 구현은 해당 전문 스킬에서 확인한다.

### 1. 여러 책임을 가진 `page.tsx`

Before — route에서 HTTP, 검증, 변환과 UI를 모두 읽어야 한다.

```tsx
export default async function ProjectsPage() {
  const response = await fetch(projectsApiUrl)
  if (!response.ok) throw new Error('프로젝트 조회 실패')
  const projects = projectsResponseSchema.parse(await response.json())

  return (
    <main>
      <h1>프로젝트</h1>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <h2>{project.display_name}</h2>
            <p>{project.owner.display_name}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
```

After — 조회 경계가 검증된 공개 모델을 반환하고 route는 화면을 조립한다.

```tsx
export default async function ProjectsPage() {
  const projects = await getProjectSummaries()
  return <ProjectList projects={projects} />
}
```

`getProjectSummaries`에 transport·검증·공개 모델 변환을, `ProjectList`에 제목·목록·
빈 상태를 둔다. 두 책임만 생겼으므로 repository/service/adapter 계층까지 늘리지 않는다.

### 2. Effect로 파생 값 복사

Before:

```tsx
const [visibleProjects, setVisibleProjects] = useState<Project[]>([])
useEffect(() => {
  setVisibleProjects(projects.filter((project) => project.isVisible))
}, [projects])
```

After:

```tsx
const visibleProjects = projects.filter((project) => project.isVisible)
```

원본과 복사본의 동기화를 없앤다. 실제 계산 비용이 확인되기 전에는 `useMemo`도 필요 없다.

### 3. Query 결과를 Zustand로 복사

Before:

```tsx
const projectQuery = useQuery(projectQueries.detail(projectId))
const project = useProjectStore((state) => state.project)
const setProject = useProjectStore((state) => state.setProject)
useEffect(() => {
  if (projectQuery.data) setProject(projectQuery.data)
}, [projectQuery.data, setProject])
```

After:

```tsx
const projectQuery = useQuery(projectQueries.detail(projectId))
const project = projectQuery.data
```

원격 원본은 Query가 소유한다. 선택된 ID가 URL에 속하면 URL에서 읽고, 여러 영역의
임시 선택에 속할 때만 store에 둔다. 편집 초안을 만드는 동작과 자동 복사를 구분한다.

### 4. 중첩된 화면 분기

Before:

```tsx
return projectQuery.isPending ? <ProjectSkeleton /> : projectQuery.isError ? (
  <ProjectError retry={() => projectQuery.refetch()} />
) : projectQuery.data.length === 0 ? <ProjectEmpty /> : (
  <ProjectList projects={projectQuery.data} />
)
```

After:

```tsx
if (projectQuery.isPending) return <ProjectSkeleton />
if (projectQuery.isError && !projectQuery.data) {
  return <ProjectError retry={() => projectQuery.refetch()} />
}
if (projectQuery.data.length === 0) return <ProjectEmpty />

return (
  <>
    {projectQuery.isError && <p role="status">최신 정보를 가져오지 못했습니다.</p>}
    <ProjectList projects={projectQuery.data} />
  </>
)
```

이 예시는 항상 실행되는 목록 query다. 비활성·offline 상태는 사용한 Query 옵션에 맞게
별도 안내한다. 초기 오류와 기존 데이터가 있는 갱신 오류도 구분한다.

## 접근성과 검증

- 행동은 `button`, 이동은 링크로 표현한다. 아이콘 버튼에도 접근 가능한 이름을 준다.
- 입력은 label과 연결하고 오류는 해당 필드의 `aria-describedby`로 연결한다.
  저장 결과·대기 상태는 필요한 곳에 `role="status"` 등으로 전달한다.
- 모달은 열릴 때 focus 진입, Tab 이동, Escape 닫기와 닫은 뒤 focus 복원을 확인한다.
  검증된 primitive를 사용해도 제목과 설명은 화면 작성자가 제공한다.
- 키보드만으로 주요 행동을 수행하고 focus 표시, 읽기 순서, 확대 시 잘림을 확인한다.
- 테스트 층·mock 범위는 [testing-ui](../testing-ui/SKILL.md)를 따른다.

## 필요한 스킬만 읽는다

- Hook·React 안정 API 선택: [modern-react](../modern-react/SKILL.md)
- 폴더·의존성 방향·route 조립: [next-app-router](../next-app-router/SKILL.md)
- Next.js 버전·upgrade·cache·runtime: [modern-nextjs](../modern-nextjs/SKILL.md)
- 외부 입력·DTO 검증과 변환: [schema-at-boundary](../schema-at-boundary/SKILL.md)
- Next.js 폼 제출·실패·재검증: [next-forms](../next-forms/SKILL.md)
- Tailwind·공용 UI·variant: [tailwind-ui](../tailwind-ui/SKILL.md)
- 원격 client cache: [tanstack-query](../tanstack-query/SKILL.md)
- 공유 client workflow: [zustand](../zustand/SKILL.md)

작업에 해당하는 스킬만 추가로 읽고 이미 읽은 공통 기준은 다시 읽지 않는다.

## 위험 신호

- 파일 이름만 보고 책임을 설명할 수 없음
- 추출 후 사소한 동작 하나를 이해하는 데 여러 wrapper를 따라가야 함
- JSX보다 삼항·플래그 조합을 해석하는 시간이 더 오래 걸림
- 화면마다 같은 입력을 다시 검증하거나 같은 원본을 여러 store에 복사함
- 접근성과 테스트가 완료 체크박스로만 존재함

## 완료 기준

- [ ] 이름과 정상 JSX만으로 화면 역할과 사용자 행동을 이해할 수 있다.
- [ ] 추출한 코드에는 독립적인 역할이나 실제 반복이 있다.
- [ ] 각 상태의 원본과 변경 경로가 하나로 드러난다.
- [ ] 오류·로딩·빈 상태·복구가 정상 흐름을 가리지 않는다.
- [ ] 변경한 상호작용의 키보드·focus·상태 안내를 확인했다.
- [ ] 변경 위험에 맞는 기존 검증 또는 행동 검증을 수행했다.
