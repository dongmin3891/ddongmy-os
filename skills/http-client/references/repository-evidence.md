# 읽기 쉬운 HTTP client를 위한 공개 저장소 근거

새 공통 client, 오류 체계, 인증 갱신 또는 transport 전반을 리팩터링할 때 읽는다. 특정
library 구현을 복제하는 문서가 아니라, 성숙한 client와 기업 SDK에서 반복되는 책임 경계를
app 코드에 맞게 고르기 위한 비교다.

star 규모는 2026-09-10 GitHub 화면의 대략적인 값이며 이후 달라질 수 있다. 높은 star가
구조의 정답을 뜻하지는 않는다. transport library 내부는 다수 runtime·사용자·호환성을
지원하므로 app의 도메인 요청 함수보다 복잡할 수 있다.

## 비교한 사례

| 사례 | 대표성 | 관찰한 통신 설계 | 이 스킬에 반영한 판단 |
| --- | --- | --- | --- |
| [Axios](https://github.com/axios/axios) | 약 109k stars, browser·Node HTTP client | status 정책, config, adapter, interceptor와 `AxiosError` code·request·response를 transport 계층에서 제공한다. | 기존 Axios 프로젝트는 유지하되, endpoint 의미와 UI 행동을 interceptor에 넣지 않고 Axios 오류를 app의 안정적인 분류로 좁힌다. |
| [Ky](https://github.com/sindresorhus/ky) | 약 17k stars, fetch 기반 client | `HTTPError`, `NetworkError`, `TimeoutError`를 나누고 schema validation 오류는 HTTP lifecycle 오류에 포함하지 않는다. retry는 method·status·횟수·`Retry-After`·backoff로 제한하며 오류 body 읽기도 시간·크기 상한을 둔다. | HTTP·network·timeout·계약 위반을 구분하고 retry·오류 parsing에 종료 조건을 둔다. |
| [TanStack Query](https://github.com/TanStack/query) | 약 50k stars, 원격 cache library | query function에 제공한 `AbortSignal`을 fetch와 Axios까지 전달하고 retry 정책을 Query가 소유할 수 있다. | signal을 wrapper에서 잃지 않고 client retry와 Query retry가 중복되지 않게 소유자를 하나 정한다. |
| [Octokit request.js](https://github.com/octokit/request.js) | GitHub의 공개 API transport | fetch에 signal을 직접 전달하고 `AbortError`는 그대로 올리며 다른 fetch 실패만 request 오류로 감싼다. status를 확인한 뒤 오류 response를 붙이고 debug request에서는 인증 정보를 가린다. | 취소를 network 오류로 뭉개지 않고, transport 오류에는 안전한 metadata만 남긴다. |
| [Azure SDK TypeScript design](https://azure.github.io/azure-sdk/typescript_design.html) | Microsoft 공개 SDK 공통 규칙 | operation별 options, `abortSignal`, 단위가 드러나는 timeout 이름을 사용한다. 기본 반환은 protocol-neutral logical entity로 두고 필요한 경우 complete response 접근도 제공한다. | 호출부에는 검증된 업무 결과를 기본으로 주고, raw status·header가 실제 요구일 때만 명시적으로 노출한다. |
| [openapi-fetch](https://github.com/openapi-ts/openapi-typescript/tree/main/packages/openapi-fetch) | 약 8k stars인 OpenAPI 도구군의 fetch client | OpenAPI에서 path·params·body·성공/오류 타입을 연결하고 수기 응답 generic을 없앤 얇은 fetch wrapper를 제공한다. | 명세가 있으면 타입 관계를 원본에서 생성한다. `request<T>()`로 runtime body를 믿게 만들지 않는다. |
| [Stripe Node SDK](https://github.com/stripe/stripe-node) | 결제 회사의 versioned SDK | retry 가능 여부를 응답·횟수와 함께 판단하고 변경 요청 재시도를 위해 idempotency key를 연결한다. request ID·duration 같은 관측 metadata도 별도 event로 만든다. | 변경 요청은 멱등성 보장 없이 자동 재시도하지 않고, retry와 관측 정책을 명시적인 transport 책임으로 둔다. |

## 반복해서 확인된 원칙

### transport 오류와 응답 계약 오류는 다른 책임이다

Ky는 schema validation 실패를 HTTP client 오류 계층 밖에 둔다. Octokit과 Axios는 응답을
받았는지, status가 실패인지, 요청 실행 자체가 실패했는지 구분할 정보를 제공한다. 따라서
`catch { return [] }`처럼 모든 실패를 성공 값으로 바꾸지 않는다.

app의 오류 class 이름은 library와 같을 필요가 없다. 중요한 것은 호출자가 HTTP status가
있는 실패, response가 없는 network 실패, 취소·timeout, JSON/schema 위반을 필요한 수준으로
구분할 수 있다는 점이다.

### signal은 계층을 통과하는 실행 계약이다

TanStack Query 문서와 Octokit 구현은 상위 `AbortSignal`을 실제 fetch·Axios 호출에 전달한다.
Octokit은 `AbortError`를 일반 request 오류로 다시 감싸지 않는다. 따라서 도메인 함수와 작은
helper 모두 signal을 받을 수 있게 하고, 취소 원인을 잃지 않는다.

timeout signal을 추가할 때는 상위 취소와 합성한 뒤 listener·timer를 정리한다. runtime이나
type library가 signal 합성 API를 지원하지 않으면 동등한 수명 관리를 명시적으로 구현한다.

### retry는 기능이 아니라 정책이다

Ky, TanStack Query와 Stripe는 모두 retry를 제공하지만 소유 계층과 안전 조건이 다르다.
이를 함께 켜면 실제 시도 횟수가 곱해지고 변경 요청이 중복 실행될 수 있다. app에서는
client, cache library, use case 중 한 소유자를 정한다.

retry에는 대상 method·status·network 오류, 최대 횟수, backoff 상한과 서버의
`Retry-After`가 포함된다. mutation은 Stripe 사례처럼 idempotency 보장이 있을 때만 자동
재시도를 허용한다.

### 기본 반환은 가장 자주 쓰는 논리 결과다

Azure 지침은 대부분의 사용자가 필요한 logical entity를 기본 반환으로 두면서 complete
response 접근도 가능하게 한다. openapi-fetch도 schema에서 성공·오류 body 관계를 드러낸다.
app의 `getProjects`는 보통 `ProjectSummary[]`를 반환하고, status·header·stream이 실제 업무
계약인 endpoint만 별도 이름이나 반환 타입으로 이를 노출하는 편이 읽기 쉽다.

### library 확장점은 app의 기본 구조가 아니다

Axios interceptor, Ky hook, Octokit defaults는 많은 endpoint와 소비자를 위한 공개
확장점이다. app에서 공통 header 하나를 넣기 위해 같은 수준의 pipeline을 만들 필요는 없다.
작은 도메인 함수에서 시작하고 인증 갱신·관측처럼 실제 횡단 정책이 반복될 때만 공통
client나 hook을 도입한다.

## 채택하지 않은 단순 결론

- “Axios가 가장 star가 많으므로 Axios가 가장 읽기 쉽다”: 기존 환경과 필요한 기능이 더
  중요하며 단순 요청에는 fetch가 더 적은 개념으로 충분할 수 있다.
- “fetch wrapper는 모두 하나의 `request<T>()`여야 한다”: generic이 schema·명세와 연결되지
  않으면 DefinitelyTyped가 지적하는 숨은 assertion과 같다.
- “모든 오류는 하나의 AppError로 바꾼다”: 상위 계층이 취소, retry, 사용자 복구를 판단할
  정보가 사라진다.
- “interceptor에서 401 redirect와 toast를 처리한다”: transport 재사용성과 server/browser
  경계를 깨고 사용자 흐름을 숨긴다.
- “GET은 언제나 retry해도 된다”: 비용이 크거나 side effect가 있는 비표준 endpoint,
  streaming body와 상위 retry 정책을 확인해야 한다.

## 적용 전 확인 질문

1. 참고한 코드는 app의 endpoint 함수인가, 다중 runtime을 지원하는 client library 내부인가?
2. 호출자가 실제로 필요한 결과는 body model인가, status·header를 포함한 raw response인가?
3. 오류 분류가 retry·복구·표시에 필요한 정보를 보존하는가?
4. signal과 timeout이 body 처리 완료까지 이어지고 정리되는가?
5. retry가 다른 cache·interceptor 계층과 중복되지 않으며 mutation의 멱등성이 보장되는가?

## 주요 원문

- [Axios 오류 구현](https://github.com/axios/axios/blob/main/lib/core/AxiosError.js)
- [Axios fetch adapter의 signal 합성](https://github.com/axios/axios/blob/main/lib/adapters/fetch.js)
- [Ky 오류 계층과 retry](https://github.com/sindresorhus/ky/blob/main/readme.md)
- [TanStack Query cancellation](https://github.com/TanStack/query/blob/main/docs/framework/react/guides/query-cancellation.md)
- [TanStack Query retry](https://github.com/TanStack/query/blob/main/docs/framework/react/guides/query-retries.md)
- [Octokit fetch wrapper](https://github.com/octokit/request.js/blob/main/src/fetch-wrapper.ts)
- [Azure SDK TypeScript API design](https://azure.github.io/azure-sdk/typescript_design.html)
- [openapi-fetch](https://github.com/openapi-ts/openapi-typescript/blob/main/packages/openapi-fetch/README.md)
- [Stripe Node request sender](https://github.com/stripe/stripe-node/blob/master/src/RequestSender.ts)
