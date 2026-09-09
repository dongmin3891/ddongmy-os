# 경계 parser와 화면 모델

Zod 4 기준이다. schema는 순수하게 유지하고 framework 응답 선택은 호출 경계에서 한다.

## URL 입력을 한 번 정규화한다

```ts
import { z } from 'zod'

const projectSearchSchema = z.object({
  page: z.string().regex(/^[1-9]\d*$/, '페이지 번호가 올바르지 않습니다.')
    .default('1')
    .transform(Number)
    .pipe(z.number().int().min(1).max(10_000)),
  status: z.enum(['all', 'active', 'archived']).default('all'),
})

export type ProjectFilters = z.infer<typeof projectSearchSchema>

export function parseProjectSearch(
  input: Record<string, string | string[] | undefined>,
) {
  return projectSearchSchema.safeParse(input)
}
```

이 계약은 `page` 누락만 1로 대체하고 빈 문자열, 0, 소수와 반복 key 배열을 거절한다.
무관한 query key는 제거한다. 허용하지 않는 key 자체가 오류인 API라면 설치 버전의
strict object 옵션을 선택한다.

Next.js 15+의 async page props를 사용하는 route 발췌:

```tsx
type ProjectsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const result = parseProjectSearch(await searchParams)
  if (!result.success) return <InvalidProjectSearch />

  const projects = await getProjectSummaries(result.data)
  return <ProjectList projects={projects} />
}
```

`InvalidProjectSearch`에는 필터 초기화 링크처럼 복구 행동을 제공한다. 이 예시의 정책은
잘못된 검색 안내다. 다른 제품에서 404나 redirect가 필요하면 route에서 결정한다.

## API 응답을 검증하고 공개 모델로 축소한다

```ts
import 'server-only'
import { z } from 'zod'

const projectDtoSchema = z.object({
  id: z.string().min(1),
  display_name: z.string(),
  owner: z.object({ display_name: z.string() }),
})

type ProjectDto = z.infer<typeof projectDtoSchema>
export type ProjectSummary = {
  id: string
  name: string
  ownerName: string
}

function toProjectSummary(project: ProjectDto): ProjectSummary {
  return {
    id: project.id,
    name: project.display_name,
    ownerName: project.owner.display_name,
  }
}

export async function readProjectSummaries(response: Response) {
  if (!response.ok) throw new Error('프로젝트 조회 실패')
  const raw: unknown = await response.json()
  return z.array(projectDtoSchema).parse(raw).map(toProjectSummary)
}
```

외부 요청을 하는 `getProjectSummaries`가 이 함수를 호출한다. 인증된 원본 서비스 접근과
cache 정책은 그 data layer가 소유한다. client transport에서는 `server-only` 모듈을
import하지 않고 공개 endpoint 응답에 같은 경계 원칙을 적용한다.

계약 위반·JSON 해석 실패를 잡아 `[]`로 반환하지 않는다. 상위 오류 UI로 전달하고,
예상 가능한 form 실패는 [next-forms 예시](../../next-forms/references/action-flow.md)처럼
명시한 public result로 변환한다.
