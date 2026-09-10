---
name: http-client
description: >
  TypeScript 프로젝트의 fetch·Axios HTTP 요청 코드를 설계·구현·리팩터링·검토할 때
  사용한다. 도메인 요청 함수, 공통 client 책임, HTTP·network·응답 계약 오류,
  취소·timeout·재시도와 browser/server 경계를 다룬다. API 타입 설계, runtime schema
  자체나 TanStack Query cache 정책을 정하는 스킬은 아니다.
---

# HTTP Client

## 이 스킬의 기준

통신 코드는 **요청 의도 → 실행 → 상태 확인 → body 해석 → 검증 → 결과 또는 오류 전달**
순서로 읽혀야 한다. 호출자는 URL과 header 조립이 아니라 `getProjects`, `renameProject`
같은 도메인 작업을 본다.

## 먼저 확인한다

1. 기존 HTTP 도구와 버전, 공통 client, 오류 class·로깅 규칙을 확인한다.
2. browser, server, worker 등 실행 환경과 base URL, cookie·token 소유자를 확인한다.
3. 성공 status와 body 유무, 오류 body 형식, pagination·upload·stream 요구사항을 확인한다.
4. 응답 schema·공개 모델과 요청·응답 타입의 원본을 확인한다.
5. 취소, timeout, retry와 인증 갱신을 어느 계층이 소유하는지 확인한다.

기존에 fetch 또는 Axios를 일관되게 사용하고 있으면 유지한다. 새 프로젝트의 단순한 요청은
추가 기능과 지원 runtime을 확인한 뒤 fetch부터 시작할 수 있다. 이 스킬만을 이유로
의존성을 추가하거나 두 도구를 혼용하지 않는다.

## 도구별 reference

- fetch를 사용할 때만 [references/fetch.md](references/fetch.md)를 읽는다.
- Axios를 사용할 때만 [references/axios.md](references/axios.md)를 읽는다.
- 새 공통 client 정책, 오류 체계 또는 넓은 transport 리팩터링의 근거를 비교할 때만
  [references/repository-evidence.md](references/repository-evidence.md)를 읽는다.

공통 판단은 이 문서에 두고 도구 API 차이만 reference에서 적용한다.

## 도메인 함수가 요청 의도를 드러낸다

```ts
const projects = await getProjects({ filters, signal })

const updatedProject = await renameProject({
  projectId,
  name,
})
```

- 함수 이름은 HTTP method보다 업무 의도를 표현한다. `postData`보다 `createProject`,
  `patchRequest`보다 `renameProject`가 호출부에서 읽기 쉽다.
- URL, method, query 직렬화, endpoint별 header와 응답 처리는 도메인 함수 안이나 바로
  아래의 작은 transport helper에서 찾을 수 있게 둔다.
- 인자가 여러 개이거나 선택 값·signal이 있으면 이름 있는 객체 인자를 사용한다. 요청 body와
  함수 실행 옵션의 의미가 다르면 계약에서도 구분한다.
- 공개 option bag은 `GetProjectsOptions`처럼 작업 이름을 붙이고 `timeoutMs`,
  `delaySeconds`처럼 시간 단위를 이름에 포함한다. 내부의 짧은 config까지 장황하게 만들지는
  않는다.
- `request → execute → adapter → service → repository`처럼 책임 없이 전달만 하는 wrapper를
  늘리지 않는다. 한 번 쓰더라도 독립적인 통신 정책이 있으면 추출할 수 있다.

## 공통 client의 책임

실제로 반복되는 통신 정책만 공통화한다.

- base URL과 안전한 URL·query 조립
- 공통 `Accept`·인증 정보 전달 방식과 body별 올바른 `Content-Type`
- body 직렬화와 endpoint가 기대하는 성공 status 확인
- HTTP 오류와 network·취소·timeout 오류의 안정적인 정규화
- 관측에 필요한 request ID, status 같은 안전한 metadata 연결

다음 책임은 공통 client에 숨기지 않는다.

- 화면 toast, modal, navigation과 문구 선택
- Query cache invalidation, 전역 store 갱신과 optimistic UI
- endpoint별 DTO를 하나의 거대한 generic response로 강제하는 일
- 권한 판단이나 업무 실패를 status code 하나만 보고 임의로 결정하는 일

공통화할 정책이 아직 하나뿐이면 작은 도메인 함수에서 시작한다. 모든 요청을 같은 envelope,
폴더 구조나 `request<T>()`에 맞추지 않는다.

## 응답과 실패를 구분한다

| 결과 | 처리 기준 |
| --- | --- |
| HTTP success | endpoint가 약속한 status와 body를 해석한 뒤 외부 값은 검증한다. |
| HTTP error | status와 공개 가능한 오류 정보가 있는 transport 오류로 전달한다. |
| network failure | 응답을 받지 못한 실패로 구분한다. HTTP status를 만들어내지 않는다. |
| cancellation | 사용자가 떠났거나 상위 작업이 취소한 흐름으로 보존한다. |
| timeout | 정한 시간 정책이 끝낸 요청임을 취소와 구분할 필요가 있는지 정한다. |
| invalid response | JSON 해석 실패와 schema 계약 위반을 성공 값으로 바꾸지 않는다. |

- HTTP 오류, network 실패와 응답 계약 위반을 `[]`, `null`, 빈 객체로 바꿔 숨기지 않는다.
- `204 No Content`처럼 body가 없는 성공과 JSON body가 필요한 성공을 endpoint 계약으로
  구분한다. 모든 성공 응답에 무조건 JSON parsing을 적용하지 않는다.
- 도메인 함수는 대부분의 호출자가 필요한 검증된 논리 결과를 기본으로 반환한다. status,
  header나 stream이 실제 계약이면 그 함수의 이름·반환형에서 raw response 접근을 드러낸다.
- `404`를 “없음” 값으로 반환하려면 `getOptionalProject`처럼 호출 계약에 그 의미가
  드러나야 한다. 전역 client에서 모든 404를 정상 값으로 바꾸지 않는다.
- 원문 오류 body, token, cookie, 개인정보를 사용자 메시지나 log metadata로 그대로
  전달하지 않는다. public 오류로 바꾸는 위치와 내부 진단 정보를 보존하는 방식을 구분한다.
- 응답 generic이나 type assertion은 runtime 검증이 아니다. 반환형만 호출자가 고르는
  `request<T>()`도 숨은 assertion이다. 외부 body는 검증 전 `unknown`으로 취급하고 schema
  또는 OpenAPI처럼 실제 원본과 타입 관계를 연결한다.
- 오류 body를 읽어 정규화하면 size와 시간 상한을 둔다. 진단 정보를 얻으려다 큰 body나
  끝나지 않는 stream 때문에 원래 실패 처리가 멈추지 않게 한다.

## 취소·timeout·retry의 소유자

- 호출자가 준 `AbortSignal`을 마지막 transport까지 전달한다. TanStack Query가 전달한
  signal을 중간 wrapper에서 버리지 않는다.
- 취소 오류는 generic network 오류로 감싸지 않는다. 상위 cache·화면 계층이 취소를 정상
  제어 흐름으로 처리할 수 있게 원인이나 안정적인 취소 code를 보존한다.
- timeout은 client 기본 정책인지 특정 작업의 요구사항인지 한 곳에서 정한다. 상위 signal과
  timeout signal을 합칠 때 runtime 지원과 어떤 이유로 종료됐는지 확인한다.
- retry는 client, interceptor, Query, 화면 event 중 한 계층이 소유한다. 여러 계층의
  기본 재시도가 곱해지지 않게 한다.
- 읽기 요청도 status, 횟수, backoff와 `Retry-After` 정책을 확인한 뒤 제한적으로 재시도한다.
  변경 요청은 멱등성이나 idempotency key가 보장되지 않으면 자동 재시도하지 않는다.
- 사용자가 명시적으로 다시 시도하는 행동과 자동 retry를 구분하고 종료 조건을 둔다.

## interceptor와 인증 갱신

interceptor는 공통 header 주입, 관측과 제한된 인증 갱신처럼 실제 횡단 정책에만 사용한다.

- 인증 갱신 후 원 요청 재시도는 최대 횟수와 최종 실패 경로를 드러낸다.
- 갱신 요청이 같은 interceptor에 다시 걸려 무한 반복되지 않게 한다.
- 동시에 만료된 요청이 갱신을 중복 실행할지 하나의 갱신을 공유할지 정책을 정한다.
- 원 요청의 취소 상태와 안전한 config만 보존한다.
- toast, redirect, cache 갱신과 업무별 fallback을 interceptor에 넣지 않는다.

복잡한 갱신 흐름이 없으면 interceptor를 만들지 않는다. 함수 호출을 숨기는 전역 마법보다
명시적인 요청 코드가 읽기 쉽다.

## browser와 server 경계

- server secret과 내부 base URL을 browser bundle에 import하지 않는다.
- browser cookie 전송, CORS와 CSRF 조건을 확인하고 credentials를 관성적으로 전역
  활성화하지 않는다.
- server 요청에서 들어온 cookie나 authorization을 외부 host로 자동 전달하지 않는다.
- 사용자별 token·cookie가 들어간 mutable client를 server singleton으로 공유하지 않는다.
- server와 browser의 인증·cache·proxy 정책이 다르면 억지로 하나의 instance에 합치지
  않는다. 공통인 오류 타입이나 순수 helper만 공유할 수 있다.
- framework가 fetch에 cache·revalidation 옵션을 추가하면 wrapper가 그 의미를 지우지
  않는지 확인한다.

## 관련 스킬의 책임

- 요청·응답·함수 인자와 결과 타입: [readable-contracts](../readable-contracts/SKILL.md)
- 외부 body의 runtime 검증과 공개 모델 변환:
  [schema-at-boundary](../schema-at-boundary/SKILL.md)
- 원격 데이터 cache·갱신·구독과 Query retry:
  [tanstack-query](../tanstack-query/SKILL.md)
- 화면 오류·pending·재시도 행동: [readable-ui](../readable-ui/SKILL.md)

## 검증 방법

변경한 endpoint의 성공 status와 body 있음·없음을 확인한다. HTTP 오류, network 실패,
취소, timeout, 잘못된 JSON과 schema 위반 중 실제 경로에 해당하는 사례가 서로 구분되어
호출자에게 도달하는지 검증한다. signal 전달과 retry 횟수를 확인하고, server/browser 양쪽에서
사용하면 secret 노출, cookie 전달과 사용자 간 client 상태 공유도 점검한다.

## 위험 신호

- 컴포넌트와 Query 함수마다 URL·header·status 처리가 반복됨
- `response.json()`이나 `axios.get<T>()` 결과를 검증 없이 신뢰함
- catch가 모든 실패를 빈 배열·`null` 또는 같은 문구로 바꿈
- client와 Query가 같은 요청을 각각 자동 재시도함
- interceptor가 navigation, toast와 cache 갱신까지 실행함
- server secret과 사용자별 인증 상태를 공용 browser/server instance가 함께 가짐
- 도메인 요청 하나가 이름만 다른 wrapper 여러 개를 통과함

## 완료 기준

- [ ] 호출부에서 도메인 요청 의도와 입력을 이해할 수 있다.
- [ ] status 확인, body 해석, 검증과 결과 반환 순서가 드러난다.
- [ ] HTTP·network·취소·timeout·응답 계약 실패가 필요한 수준으로 구분된다.
- [ ] signal이 transport까지 연결되고 retry 소유자와 종료 조건이 하나다.
- [ ] 공통 client와 interceptor에 UI·cache·업무 흐름이 숨지 않았다.
- [ ] browser/server 인증 정보와 secret 경계가 안전하다.
- [ ] 변경한 성공·실패·취소 경로를 검증했다.

## 참고 기준

- [MDN Fetch API 사용](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
- [Axios 요청 설정](https://axios-http.com/docs/req_config)
- [Axios 오류 처리](https://axios-http.com/docs/handling_errors)
- [Axios 취소](https://axios-http.com/docs/cancellation)
- [Axios interceptor](https://axios-http.com/docs/interceptors)
- [오픈소스·기업 저장소 비교](references/repository-evidence.md)
