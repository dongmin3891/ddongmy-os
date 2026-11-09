---
name: playwright-e2e
description: >
  Playwright로 실제 브라우저 사용자 흐름을 작성·수정·검토할 때 사용한다. locator 선택,
  fixture·인증·테스트 데이터 격리, network 대체 범위, web-first assertion과 실패 증거를
  다룬다. 테스트 층 선택 자체는 testing-ui를 우선한다.
---

# Playwright E2E

## 이 스킬의 기준

테스트는 컴포넌트 구조가 아니라 **사용자가 시작한 행동이 관찰 가능한 결과까지 이어지는
계약**을 검증한다. 실제로 통과하지 않은 browser·server·data 경계를 통과했다고 표현하지
않으며, 변경 위험을 관찰하는 가장 짧은 사용자 여정을 선택한다.

## 먼저 확인한다

1. 기존 Playwright 버전, config, script, fixture와 테스트 디렉터리 규칙을 확인한다.
2. 앱을 어떤 명령과 환경 변수로 실행하는지, production build 검증이 필요한지 확인한다.
3. 시작 상태, 사용자 행동, 성공 결과와 실제 회귀 위험을 한 문장씩 적는다.
4. navigation, cookie, storage, auth, network, server render, DB와 시간 중 포함된 경계를 적는다.
5. 각 경계를 실제로 통과할지, 대체할지와 테스트 데이터 생성·정리 방법을 정한다.

Next.js 설정이나 실행 방식을 바꿀 때는 저장소에 설치된 Next.js 문서의 Playwright guide를
먼저 확인한다. 기존 도구와 명령을 우선하고, 이 스킬만을 이유로 runner나 앱 구조를 바꾸지
않는다.

## 테스트 범위를 정확히 부른다

- browser부터 실제 app route와 격리된 test DB까지 통과하면 E2E로 본다.
- `page.route()`로 앱의 API 응답을 대체하면 browser 통합 또는 browser 회귀 테스트로
  기록한다. React, hydration, browser API와 UI 결과는 검증하지만 route·DB는 검증하지
  않는다.
- third-party 결제·메일·분석처럼 통제할 수 없는 외부 경계는 provider sandbox를 쓰거나
  가장 바깥 HTTP 경계에서 대체한다. 내부 Hook이나 상태를 대체해 실제 UI 흐름을 지우지
  않는다.
- 하나의 긴 E2E로 모든 parser 오류 조합을 반복하지 않는다. 순수 계약은 단위 테스트에
  두고 E2E는 대표 사용자 여정과 경계 연결을 확인한다.

## 시나리오를 사용자 계약으로 쓴다

테스트 이름과 본문은 Given, When, Then이 드러나게 작성한다.

```ts
test('저장에 실패하면 입력을 유지하고 다시 시도할 수 있다', async ({ page }) => {
  // Given: 편집할 데이터와 실패하는 외부 경계
  // When: 사용자가 값을 입력하고 저장
  // Then: 오류 안내, 입력 유지와 재시도 가능 상태
})
```

- 정상 경로 하나를 먼저 고른다.
- 실패, 중복 실행, 세션 만료, 새로고침 중 실제 위험에 해당하는 경계만 추가한다.
- 구현 함수 호출보다 화면, URL, focus, 저장 결과나 요청 횟수처럼 사용자가 관찰할 수 있는
  결과를 검증한다.
- UI 피드백과 사업 결과를 구분한다. 예를 들어 결제 중 버튼 비활성화와 결제 요청 1회는
  서로 다른 계약이므로 위험에 따라 각각 확인한다.

## locator 우선순위

1. `getByRole()`과 접근 가능한 이름
2. form 입력의 `getByLabel()`
3. 고유한 사용자 표시 text, placeholder, alt text
4. 안정적인 명시적 테스트 계약인 `getByTestId()`
5. 다른 방법이 실제로 불가능할 때만 제한된 CSS locator

같은 이름의 요소가 여러 개면 순서 대신 사용자가 구분하는 상위 문맥으로 범위를 좁힌다.

```ts
const proPlan = page
  .getByRole('article')
  .filter({ has: page.getByRole('heading', { name: '프로 플랜' }) })

await proPlan.getByRole('button', { name: '결제하기' }).click()
```

- `dialog`, `region`, `form`, `row`, `listitem`, `article`처럼 의미 있는 상위 영역을 사용한다.
- 대상 UI를 함께 바꿀 수 있다면 semantic element, label, heading과 `aria-labelledby`로
  문맥을 표현한다. 테스트만 통과시키려고 잘못된 role이나 불필요한 `aria-label`을 넣지
  않는다.
- 사용자 언어나 문구 변경이 검증 대상이 아니고 실제로 자주 바뀌는 핵심 제어점에는
  `data-testid`를 명시적 계약으로 사용할 수 있다. test id는 도메인 의미로 이름 짓고
  배열 index나 생성 순서를 넣지 않는다.
- `.first()`, `.last()`, `.nth()`는 순서 자체가 사용자 계약일 때만 사용한다.
- 긴 CSS chain, XPath, Tailwind class와 DOM 부모 이동으로 대상을 찾지 않는다.

## 상태와 테스트 데이터를 격리한다

- 테스트마다 독립된 browser context를 기본으로 한다. 테스트 순서와 이전 테스트의 cookie,
  localStorage, IndexedDB에 의존하지 않는다.
- `storageState`는 역할별 인증 시작점을 제공하는 데 사용하되 여러 테스트가 같은 변경 가능
  계정이나 장바구니를 공유하지 않게 한다.
- 데이터는 UI 준비가 검증 대상이 아닐 때 API, DB fixture 또는 전용 setup으로 만든다.
  UI를 통한 로그인·데이터 생성을 모든 테스트에서 반복하지 않는다.
- 병렬 실행에서도 충돌하지 않는 고유 식별자를 사용하고 생성한 데이터를 정리한다.
- DB와 server cache는 browser context를 나눠도 공유된다는 점을 별도로 통제한다.
- 시간 조건은 clock API나 통제된 server time으로 만든다. 실제 30분을 기다리거나 시스템
  시각과 실행 순서에 기대지 않는다.

## network 경계를 다룬다

- `page.route()`는 browser가 보낸 요청만 가로챈다. Server Component와 route handler가
  server에서 수행한 fetch까지 대체된다고 가정하지 않는다.
- 요청을 대체할 때 method, URL, 중요한 request body를 확인하고 실제 client parser가
  읽는 형태로 응답한다.
- 실패 응답은 실제 계약의 status와 body를 사용한다. 임의의 오류 형태를 만들어 테스트가
  현실과 달라지지 않게 한다.
- 중복 요청은 request counter나 server 기록으로 검증한다. 단순히 버튼이 disabled인지만
  보고 중복 처리가 방지됐다고 결론내리지 않는다.
- 실제 app route를 검증하는 E2E에서는 route를 대체하지 않고 test DB, sandbox와 데이터
  초기화 전략을 사용한다.

## 기다림과 assertion

- Playwright의 locator와 web-first `expect()`가 화면 상태를 기다리게 한다.
- `waitForTimeout()`과 고정 sleep으로 동기화하지 않는다.
- `networkidle`을 완료 조건으로 삼기보다 제목, 상태 메시지, URL, 버튼 상태나 저장된 값처럼
  사용자에게 의미 있는 결과를 기다린다.
- locator는 한 요소를 고유하게 찾아야 한다. strict mode 오류를 `.nth()`로 숨기기 전에
  UI 문맥이나 선택자가 모호한 이유를 해결한다.
- 요청이 없음을 검증할 때는 관찰 구간과 완료 신호를 명시한다. 즉시 counter를 확인해 늦은
  요청을 놓치거나 임의 sleep을 늘리지 않는다.

## 인증과 권한

- 인증 준비와 인증 흐름 자체의 검증을 구분한다. 일반 사용자 여정은 fixture나
  `storageState`로 시작하고 로그인 E2E만 로그인 UI를 통과한다.
- 권한이 검증 대상이면 인가 로직을 성공으로 고정하지 않는다. 역할별 계정으로 실제 route와
  화면 결과를 확인한다.
- 만료·로그아웃은 cookie나 token 상태를 통제해 만들고, redirect URL, 안내와 입력 보존 등
  사용자 결과를 검증한다.
- secret, production 계정과 실제 결제 수단을 fixture나 trace에 넣지 않는다.

## 실패를 조사할 수 있게 한다

- CI에서는 실패 시 trace를 남기고 필요에 따라 screenshot·video를 보존한다. 모든 성공
  실행의 대용량 artifact를 무조건 저장하지 않는다.
- 재시도 횟수로 flaky test를 숨기지 않는다. 첫 실패의 trace, console, network와
  테스트 데이터 충돌을 확인한다.
- Page Object나 helper는 사용자 역할과 반복되는 setup을 명확하게 만들 때만 추출한다.
  assertion과 서로 다른 시나리오를 범용 helper 뒤에 숨기지 않는다.

## 함께 사용할 기준

- 단위·컴포넌트·E2E 중 층을 정해야 하면 `testing-ui` 기준을 먼저 사용한다.
- UI 의미, 접근 가능한 이름과 상태 안내를 함께 바꿔야 하면 `readable-ui` 기준을 사용한다.
- HTTP timeout·취소·재시도 구현 자체를 바꾸면 `http-client` 기준을 추가한다.
- Next.js form·Server Function 흐름이면 `next-forms` 기준을 추가한다.

해당 스킬이 대상 저장소에 없으면 같은 이름을 전제로 하지 말고 이 스킬의 범위 안에서
기존 저장소 패턴을 따른다.

## 위험 신호

- 모든 동작을 하나의 거대한 E2E에 넣음
- 내부 API를 mock하고 DB까지 검증했다고 보고함
- CSS class, XPath, 배열 순서로 핵심 요소를 찾음
- 고정 sleep, 강제 click과 retry로 경쟁 조건을 가림
- production 데이터·계정·외부 결제를 테스트가 변경함
- 테스트끼리 계정, storage, DB row와 cache를 공유함
- Page Object가 사용자 행동보다 locator와 assertion을 더 숨김

## 완료 기준

- [ ] 시작 상태, 사용자 행동과 관찰 가능한 결과가 명확하다.
- [ ] 실제로 통과한 경계와 대체한 경계를 구분해 설명할 수 있다.
- [ ] locator가 사용자 의미 또는 명시적 test id 계약에 기반한다.
- [ ] auth, storage, 데이터와 시간이 테스트마다 격리된다.
- [ ] 고정 sleep 없이 관찰 가능한 완료 조건을 기다린다.
- [ ] 정상 경로와 실제 회귀 위험에 해당하는 실패·중복·복구를 확인했다.
- [ ] 실패 시 trace 등 원인을 확인할 증거가 남는다.
- [ ] 관련 테스트와 저장소의 필수 check를 실행하고 결과를 기록했다.

## 공식 기준

- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright test isolation](https://playwright.dev/docs/browser-contexts)
- [Playwright authentication](https://playwright.dev/docs/auth)
- [Playwright trace viewer](https://playwright.dev/docs/trace-viewer)
