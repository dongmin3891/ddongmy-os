# fetch 요청 구현

fetch를 선택한 작업에서만 읽는다. runtime이 제공하는 fetch와 `AbortSignal` 기능 범위를 먼저
확인한다. framework가 확장한 fetch를 사용하면 cache·revalidation 옵션도 그 framework
계약에 맞춘다.

## fetch에서 명시해야 하는 차이

- fetch는 network나 URL 오류 등에는 reject하지만 404·500 응답만으로는 reject하지 않는다.
  endpoint가 기대한 성공 범위를 `response.ok` 또는 구체적인 status로 확인한다.
- response body는 한 번 소비하는 stream이다. 오류 body를 읽은 뒤 같은 response에서 성공
  body를 다시 읽지 않는다.
- `response.json()`의 타입 표기는 body를 검증하지 않는다. 결과를 `unknown`으로 받아
  schema나 명시적인 parser로 좁힌다.
- JSON이 필요한 endpoint에서 빈 body나 잘못된 JSON은 응답 계약 오류다. 204를 허용하는
  endpoint는 별도의 no-content 흐름으로 다룬다.
- 취소할 수 있어야 하는 요청에는 상위 `signal`을 그대로 전달한다.

## 공통 helper와 도메인 함수

아래는 책임 배치 예시다. 오류 class와 schema API는 프로젝트의 기존 구현을 사용한다.

```ts
class HttpResponseError extends Error {
  constructor(readonly status: number) {
    super(`HTTP request failed with status ${status}`)
  }
}

class InvalidJsonResponseError extends Error {}

async function readRequiredJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch (cause) {
    throw new InvalidJsonResponseError('Expected a JSON response', { cause })
  }
}

async function requestJson(
  input: string | URL,
  init: RequestInit,
): Promise<unknown> {
  const response = await fetch(input, init)

  if (!response.ok) {
    throw new HttpResponseError(response.status)
  }

  return readRequiredJson(response)
}
```

지원 대상의 `Error` constructor가 `cause` option을 지원하는지 확인한다. 지원하지 않으면
기존 오류 class 방식으로 원인을 보존한다. 실제 API가 안전한 오류 code를 제공한다면
`HttpResponseError`를 만들 때 제한된 크기로 parsing하되 원문 body 전체를 노출하지 않는다.

도메인 함수는 URL 조립과 응답 검증을 이어서 읽게 한다.

```ts
type GetProjectsInput = {
  filters: ProjectFilters
  signal?: AbortSignal
}

export async function getProjects({
  filters,
  signal,
}: GetProjectsInput): Promise<ProjectSummary[]> {
  const url = new URL('/projects', projectsApiBaseUrl)
  url.searchParams.set('status', filters.status)
  url.searchParams.set('page', String(filters.page))

  const raw = await requestJson(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  })

  return parseProjectList(raw).map(toProjectSummary)
}
```

`requestJson`이 schema generic을 받게 만들 수도 있지만 모든 endpoint가 동일한 body·오류
정책을 가질 때만 공통화한다. schema와 DTO→공개 모델 변환은
[schema-at-boundary](../../schema-at-boundary/SKILL.md), 입력·결과 타입은
[readable-contracts](../../readable-contracts/SKILL.md)를 따른다.

## query, header와 body

- query는 `URL`과 `URLSearchParams`로 encode한다. 배열, 중복 key와 생략 값이 API에서
  어떤 의미인지 정하고 그 방식으로 append한다.
- JSON body를 보낼 때만 `JSON.stringify`와 맞는 `Content-Type`을 설정한다. `FormData`의
  multipart boundary를 browser가 정해야 하면 `Content-Type`을 직접 덮지 않는다.
- `credentials: 'include'`는 cookie가 실제로 필요한 cross-origin 요청에서 CORS·CSRF
  정책과 함께 사용한다.
- redirect, cache, mode를 문제를 숨기기 위한 옵션으로 바꾸지 않는다. 특히 `no-cors`는
  일반적인 CORS 오류 해결책이 아니다.

## 취소와 timeout

timeout만 필요한 작업에서는 지원 runtime에서 다음 형태를 사용할 수 있다.

```ts
return fetch(url, { signal: AbortSignal.timeout(10_000) })
```

상위 취소와 timeout을 함께 적용하고 대상 runtime과 TypeScript DOM type이 지원하면
`AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)])`로 합칠 수 있다. 지원하지 않아
직접 `AbortController`와 timer를 조합하면 body 처리까지 끝난 뒤 timer를 정리하고 상위
signal listener도 제거한다. timeout과 상위 취소를 다른 UI로 보여줘야 하면 종료 reason을
보존한다.

## 공식 자료

- [Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok)
- [AbortSignal.timeout](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static)
- [AbortSignal.any](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static)
