# Query key와 읽기 흐름

TanStack Query v5 기준이다. 도메인 타입과 transport import는 프로젝트 구현을 사용한다.
공통 이름·추출·화면 분기 기준과 before/after는
[readable-ui](../../readable-ui/SKILL.md)에 있다.

## 배치 예시

feature가 작으면 `queries.ts`와 `mutations.ts`에서 시작한다.

```text
features/
└── projects/
    ├── api/
    │   ├── get-projects.ts
    │   └── update-project.ts
    ├── queries.ts
    ├── mutations.ts
    ├── schemas.ts
    └── components/
        └── project-list.tsx
```

파일이 커졌을 때만 다음처럼 query별로 분리한다.

```text
features/projects/queries/
├── keys.ts
├── project-list-options.ts
└── project-detail-options.ts
```

- API transport는 HTTP 요청과 응답 검증을 담당한다.
- query option은 key, query function과 cache 의미를 묶는다.
- 컴포넌트는 option을 사용하고 화면 상태를 표현한다.
- query hook 이름만 바꾼 의미 없는 wrapper는 만들지 않는다.

## Query key와 options

현재 버전이 지원하면 `queryOptions`로 재사용 가능한 정의와 타입 추론을 함께 유지한다.

```ts
import { queryOptions } from '@tanstack/react-query'

export const projectQueries = {
  all: () => ['projects'] as const,
  lists: () => [...projectQueries.all(), 'list'] as const,
  list: (filters: ProjectFilters) =>
    queryOptions({
      queryKey: [...projectQueries.lists(), filters] as const,
      queryFn: ({ signal }) => getProjects({ filters, signal }),
      staleTime: 60_000,
    }),
  details: () => [...projectQueries.all(), 'detail'] as const,
  detail: (projectId: string) =>
    queryOptions({
      queryKey: [...projectQueries.details(), projectId] as const,
      queryFn: ({ signal }) => getProject({ projectId, signal }),
    }),
}
```

### Query key 규칙

- 최상위는 직렬화 가능한 배열을 사용한다.
- query function의 결과를 바꾸는 모든 입력을 key에 포함한다.
- `all → lists → list(filters)`, `all → details → detail(id)`처럼 계층을 읽을 수
  있게 만든다.
- 화면 문구나 컴포넌트 이름보다 안정적인 도메인 이름을 사용한다.
- 객체 filter는 API에 전달하기 전에 정규화하고 불필요한 값은 제거한다.

### Query function 규칙

- transport 오류를 숨기거나 성공 값으로 변환하지 않는다.
- 외부 응답은 query cache에 넣기 전에 schema를 검증한다.
- 라이브러리가 제공하는 `AbortSignal`을 가능한 transport에 전달한다.
- 서버 DTO를 화면 모델로 변환할 책임을 한 곳에 둔다.
- `select`는 가벼운 파생 값이나 구독 범위 축소에 사용하고 원본 cache 의미를
  바꾸는 복잡한 정제 과정에는 남용하지 않는다.

## Client 화면

```tsx
const projectsQuery = useQuery(projectQueries.list(filters))

if (projectsQuery.isPending) return <ProjectSkeleton />
if (projectsQuery.isError && !projectsQuery.data) {
  return <ProjectError retry={() => projectsQuery.refetch()} />
}
if (projectsQuery.data.length === 0) return <ProjectEmpty />

return (
  <>
    {projectsQuery.isError && <p role="status">최신 정보를 가져오지 못했습니다.</p>}
    <ProjectList projects={projectsQuery.data} />
  </>
)
```

이 예시는 항상 활성인 목록 query다. `enabled: false` 또는 offline 대기는 초기 fetch의
로딩과 다르므로 실제 옵션에 맞는 안내를 제공한다. 초기 오류와 refetch 오류를 구분하고,
기존 데이터가 있으면 background refetch 중에도 화면을 유지한다.

## Key 검증

- tenant·사용자·filter 변경 시 결과가 달라지면 key에도 반영한다. secret은 key에 넣지 않는다.
- 인증 주체가 바뀌면 이전 사용자의 cache를 제거하거나 적절히 격리한다.
- list와 infinite query는 서로 다른 key 공간을 사용한다. cache 구조가 서로 다르다.
- 서버 prefetch와 client 조회에는 같은 정규화 입력·key·공개 데이터 형태를 사용한다.

## 공식 자료

- [Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [Query Options](https://tanstack.com/query/latest/docs/framework/react/guides/query-options)
