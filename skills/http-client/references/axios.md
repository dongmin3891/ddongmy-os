# Axios 요청 구현

Axios를 선택한 작업에서만 읽는다. 설치된 major와 기존 instance, adapter, interceptor,
`validateStatus`, params serializer 설정을 먼저 확인한다.

## Axios에서 명시해야 하는 차이

- 기본 `validateStatus`에서는 2xx 밖의 응답이 reject된다. 프로젝트가 이를 바꿨다면 어떤
  status가 성공 경로로 들어오는지 다시 확인한다.
- Axios 오류는 응답을 받은 HTTP 오류, 응답이 없는 요청 오류와 config/setup 오류 정보를
  구분할 수 있다. `axios.isAxiosError`로 확인한 뒤 프로젝트의 안정적인 오류 계약으로
  정규화한다.
- `axios.get<ProjectDto>()`의 generic은 compile-time 기대만 표현하며 runtime body를
  검증하지 않는다. `response.data`를 `unknown`으로 받아 schema로 좁힌다.
- 취소는 현재 API의 `signal`을 사용한다. 오래된 `CancelToken`을 새 코드에 도입하지 않는다.
- Axios `timeout`과 상위 `AbortSignal`의 역할이 다를 수 있다. 설치 버전과 adapter별 동작을
  확인하고 하나의 timeout 정책으로 정규화한다.

## instance와 도메인 함수

반복되는 base URL·공통 header가 있으면 작은 instance를 둘 수 있다.

```ts
import axios from 'axios'

const projectsApi = axios.create({
  baseURL: projectsApiBaseUrl,
  headers: { Accept: 'application/json' },
  timeout: 10_000,
})
```

server와 browser의 token·cookie·base URL이 다르면 instance도 분리한다. 사용자별 token을
server singleton의 mutable defaults에 기록하지 않는다.

transport 오류 정규화와 body 검증이 섞이지 않게 경계를 둔다.

```ts
type GetProjectsInput = {
  filters: ProjectFilters
  signal?: AbortSignal
}

export async function getProjects({
  filters,
  signal,
}: GetProjectsInput): Promise<ProjectSummary[]> {
  let raw: unknown

  try {
    const response = await projectsApi.get('/projects', {
      params: { status: filters.status, page: filters.page },
      signal,
    })
    raw = response.data
  } catch (error) {
    throw normalizeAxiosError(error)
  }

  return parseProjectList(raw).map(toProjectSummary)
}
```

`normalizeAxiosError`는 Axios 오류만 HTTP·network·취소·timeout 계약으로 변환하고, 알 수
없는 오류는 원인을 보존해 다시 전달한다. schema parsing을 `try` 밖에 두어 응답 계약
위반이 Axios 통신 오류로 잘못 분류되지 않게 한다. schema와 DTO→공개 모델 변환은
[schema-at-boundary](../../schema-at-boundary/SKILL.md), 입력·결과 타입은
[readable-contracts](../../readable-contracts/SKILL.md)를 따른다.

## params, body와 오류

- Axios의 기본 params serialization이 서버의 배열·중첩 객체·빈 값 규칙과 맞는지 확인한다.
  맞지 않을 때만 명시적인 serializer를 둔다.
- JSON, `FormData`, stream 등 body 형태에 맞는 설정을 사용한다. 공통 instance가 모든
  요청에 `Content-Type: application/json`을 강제하지 않게 한다.
- `error.response?.data`는 신뢰하지 않는 외부 값이다. 공개 오류 code가 필요하면 별도
  schema로 검증하고, 원문 body나 request config의 인증 정보를 UI·log에 전달하지 않는다.
- `toJSON()` 결과에도 config와 header가 포함될 수 있으므로 그대로 logging하지 않는다.

## interceptor

- interceptor를 등록한 instance의 요청에만 정책이 적용되는지 확인한다.
- 응답 성공·실패 handler가 어떤 `validateStatus`와 함께 실행되는지 확인한다.
- 인증 갱신 재시도에는 `_retry` 같은 내부 표식이나 별도 상태로 명시적인 상한을 둔다.
  갱신 endpoint는 같은 갱신 분기에 다시 들어가지 않게 한다.
- 테스트나 수명이 짧은 instance에서 interceptor를 동적으로 등록하면 반환된 ID로 eject해
  중복 등록을 막는다.
- interceptor가 던진 정규화 오류를 domain 함수에서 다시 같은 형태로 감싸지 않는다.

## 공식 자료

- [Axios Request Config](https://axios-http.com/docs/req_config)
- [Axios Handling Errors](https://axios-http.com/docs/handling_errors)
- [Axios Cancellation](https://axios-http.com/docs/cancellation)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
