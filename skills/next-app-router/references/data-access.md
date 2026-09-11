# 서버 데이터 접근과 공개 반환 모델

Next.js App Router에서 Server Component, Server Function과 Route Handler가 애플리케이션
내부 데이터에 접근할 때 사용한다. 목표는 **누가 읽고 변경할 수 있으며 무엇을 반환하는지**
한 server-only 경계에서 읽히게 만드는 것이다.

기존에 별도 backend HTTP API가 데이터와 권한을 소유하면 그 계약을 유지하고
[http-client](../../http-client/SKILL.md)로 호출한다. 이 문서는 Next.js 서버가 DB, SDK나
내부 서비스를 직접 사용하는 경우의 기본값이다.

## 책임

```text
page / layout / Route Handler / Server Function
  → server data-access 함수
  → DB · SDK · 내부 서비스
  → 최소 공개 모델 또는 구분 가능한 실패
```

- data-access 모듈은 `server-only`로 보호하고 secret, DB client와 admin SDK를 밖으로
  export하지 않는다.
- route params, searchParams와 form 값은 route 경계에서 먼저 검증한다. data-access
  함수는 [schema-at-boundary](../../schema-at-boundary/SKILL.md)를 통과해 좁혀진 값을 받는다.
- 인증은 현재 사용자가 누구인지 확인하고, 인가는 그 사용자가 해당 자원을 읽거나
  변경할 수 있는지 데이터 접근 직전에 확인한다.
- `userId`를 인수로 받는다면 `requireUser()` 같은 신뢰한 세션 결과에서만 가져온다.
  params, searchParams, form, JSON body와 hidden input의 ID를 사용자 신원으로 쓰지 않는다.
  함수 안에서 세션을 읽는 구조도 가능하다.
- 조회와 변경은 화면에 필요한 최소 공개 모델만 반환한다. DB row, SDK 응답, token과
  내부 권한 필드를 그대로 전달하지 않는다.
- 변경도 같은 server-only 모듈에서 인가 직후 수행한다. 제출·pending·오류 표시와 성공
  후 갱신 흐름은 [next-forms](../../next-forms/SKILL.md)가 담당한다.

## 실패 계약

예상 가능한 `not_found`와 `forbidden`은 호출자가 구분할 수 있게 반환한다. 프로젝트에
확립된 typed error 규칙이 있으면 그것을 일관되게 사용한다. 별도 규칙이 없다면
discriminated union을 기본으로 하고 DB 연결 실패·timeout 같은 인프라 오류는 예외로
전달한다.

```ts
type DataResult<T> =
  | { status: 'success'; data: T }
  | { status: 'not_found' }
  | { status: 'forbidden' }
```

- 없음, 권한 없음과 인프라 오류를 `null`, 빈 배열 또는 하나의 `notFound()`로 뭉개지 않는다.
- data-access 함수에서 `notFound()`, `redirect()`나 HTTP response를 만들지 않는다.
  page, Server Function과 Route Handler가 같은 결과를 각 경계에 맞게 표현한다.
- 예상 도메인 실패와 인프라 오류 처리 방식을 한 feature 안에서 Result와 throw로
  임의 혼용하지 않는다.

## 예시 1 — 공개 게시글 조회

```ts
import 'server-only'

type PublishedPost = {
  slug: string
  title: string
  summary: string
  body: string
}

type PublishedPostResult =
  | { status: 'success'; data: PublishedPost }
  | { status: 'not_found' }

export async function getPublishedPost(
  slug: string,
): Promise<PublishedPostResult> {
  const post = await db.post.findUnique({ where: { slug } })

  if (!post || !post.isPublished) return { status: 'not_found' }

  return {
    status: 'success',
    data: {
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      body: post.body,
    },
  }
}
```

route는 검증된 slug를 넘기고 결과에 따라 `notFound()` 또는 게시글 UI를 선택한다.
DB 오류는 `not_found`로 바꾸지 않고 상위 오류 경계로 전달한다.

## 예시 2 — 인가가 필요한 편집 데이터

```ts
import 'server-only'

type GetEditableProjectInput = {
  projectId: string
  userId: string
}

type EditableProject = {
  id: string
  name: string
  description: string
}

type EditableProjectResult =
  | { status: 'success'; data: EditableProject }
  | { status: 'not_found' }
  | { status: 'forbidden' }

export async function getEditableProject({
  projectId,
  userId,
}: GetEditableProjectInput): Promise<EditableProjectResult> {
  const project = await db.project.findUnique({ where: { id: projectId } })

  if (!project) return { status: 'not_found' }
  if (project.ownerId !== userId) return { status: 'forbidden' }

  return {
    status: 'success',
    data: {
      id: project.id,
      name: project.name,
      description: project.description,
    },
  }
}
```

호출부에서 신원과 요청 입력의 출처를 분리한다.

```ts
const user = await requireUser()
const projectId = projectIdSchema.parse(rawProjectId)

const result = await getEditableProject({
  projectId,
  userId: user.id,
})
```

`user.id`만 세션에서 오며 `projectId`는 요청 경계에서 형식만 검증한 자원 식별자다.
변경 함수도 이와 같은 신원 출처와 인가 순서를 사용하고, 인가 성공 직후 저장한다.

## 공개 모델과 검증 경계

- [readable-contracts](../../readable-contracts/SKILL.md)는 함수 입력·결과와 공개 모델의
  의미를 정한다. 이 문서는 data-access가 실제로 반환할 필드를 결정한다.
- 외부 HTTP 응답의 runtime 검증과 DTO 변환 방법은
  [schema-at-boundary](../../schema-at-boundary/SKILL.md)를 따른다.
- 타입이 보장된 ORM·DB client 결과에 Zod를 의무로 추가하지 않는다. `$queryRaw`, JSON
  column, 느슨한 SDK 반환처럼 타입 보장이 끊기는 값은 신뢰하지 않는 경계로 검증한다.

## 배치와 추상화

- `getPublishedPosts`, `getEditableProject`, `updateOwnedProject`처럼 대상과 권한 의도를
  이름에 드러낸다. `getData`, `fetchItem`, `repository`만으로 의미를 숨기지 않는다.
- 한 함수로 읽히면 feature 가까운 server 파일 하나로 시작한다. 전달만 하는
  repository → service → adapter 계층을 미리 만들지 않는다.
- page, metadata와 Route Handler가 같은 데이터를 사용하면 동일한 server 함수를
  공유한다. Server Component가 같은 앱의 Route Handler를 HTTP로 다시 호출하지 않는다.
- cache 수명과 invalidation은 [modern-nextjs](../../modern-nextjs/SKILL.md)를 따른다.
  사용자별 결과나 권한 판정을 공유 cache에 넣지 않는다.

## 확인

- 요청에서 받은 ID가 사용자 신원으로 사용되지 않는가?
- 없음, 권한 없음과 인프라 오류를 호출자가 구분할 수 있는가?
- 조회와 변경 모두 실제 작업 직전에 인가하는가?
- 반환 모델에 화면이 필요 없는 내부 필드가 포함되지 않는가?
- route 표현, HTTP 실행과 제출 UI가 data-access에 섞이지 않았는가?

## 공식 기준

- [Next.js Data Security](https://nextjs.org/docs/app/guides/data-security)
- [Next.js Backend for Frontend](https://nextjs.org/docs/app/guides/backend-for-frontend)
