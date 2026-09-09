# App Router prefetch와 hydration

TanStack Query v5 기준이다. RSC로 충분하면 이 구성을 추가하지 않는다. client가 refetch할
데이터에 첫 화면 prefetch가 필요한 경우에 사용한다.

## Provider의 수명

```tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient()
  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
    </QueryClientProvider>
  )
}
```

Provider는 필요한 subtree의 안정적인 layout에 둔다. 60초는 예시이며 실제 freshness
요구사항으로 결정한다. browser client는 초기 render가 suspend되어도 재생성되지 않게
유지하고, server client는 요청 간 공유하지 않는다. 인증 주체 변경 시 cache 정리도 필요하다.

## 같은 key와 공개 모델로 prefetch한다

[query-options.md](query-options.md)의 `projectQueries.list`를 사용하는 route 발췌다.
이 예시의 filters는 route 경계에서 이미 검증·정규화되어 있다.

```tsx
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { projectQueries } from '@/features/projects/queries'
import { getProjectSummaries } from '@/features/projects/server/get-project-summaries'
import { ProjectResults } from '@/features/projects/components/project-results'
import type { ProjectFilters } from '@/features/projects/schemas'

export async function PrefetchedProjects({ filters }: { filters: ProjectFilters }) {
  const queryClient = new QueryClient()
  const options = projectQueries.list(filters)

  await queryClient.prefetchQuery({
    ...options,
    queryFn: () => getProjectSummaries(filters),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectResults filters={filters} />
    </HydrationBoundary>
  )
}
```

`ProjectResults`는 client component로 같은 options를 `useQuery`에 전달한다. 공용 options의
기본 transport는 브라우저가 접근할 공개 HTTP endpoint를 사용한다. 서버에서는 queryFn만
server-only 조회로 바꾸어 자기 Route Handler를 HTTP로 다시 호출하지 않는다. 두 조회는
동일한 공개 모델을 반환해야 하며 서버 조회와 공개 endpoint 모두 인가·검증을 수행한다.
공용 options 모듈에 server-only import를 섞지 않는다.

## 실패와 갱신

- `prefetchQuery`는 실패를 throw하지 않으며 기본 dehydration은 실패 query를 포함하지
  않는다. 이 예시는 client 재시도·오류 UI로 복구하는 정책이다.
- route에서 반드시 404나 오류를 결정해야 하면 `fetchQuery` 또는 직접 조회로 실패를
  처리한다. prefetch 결과에 의존해 무조건 성공 화면을 조립하지 않는다.
- 독립 query는 병렬로 prefetch한다. 관련 없는 데이터까지 상위 layout에 모으지 않는다.
- dehydrated state는 브라우저에 전달된다. 필요한 query만 포함하고 비공개 필드를
  query cache에 넣은 뒤 UI에서 숨기는 방식으로 보호하지 않는다.
- 같은 데이터를 RSC의 별도 숫자·목록과 client Query가 각각 표시하면 client refetch 뒤
  불일치할 수 있다. 갱신되는 영역의 소유자를 맞추거나 양쪽 갱신을 명시적으로 조정한다.

## 검증

서로 다른 사용자 요청의 cache 격리, 같은 key·공개 모델, 첫 hydration과 불필요한 즉시
refetch, prefetch 실패 후 복구를 확인한다. mutation 뒤 목록·상세·서버 표시 값이 필요한
최신성을 유지하는지 확인한다.

## 공식 자료

- [TanStack Advanced SSR](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- [TanStack QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient)
