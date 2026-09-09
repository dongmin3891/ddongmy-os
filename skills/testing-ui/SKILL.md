---
name: testing-ui
description: >
  React·Next.js UI 변경을 검증할 테스트 층과 mock 경계를 선택하고 테스트를 작성·검토할 때
  사용한다. 단위·컴포넌트·E2E 선택, QueryClient·store 격리와 사용자 행동 기반 검증을
  다룬다. 단순 이름·class·정적 마크업 변경만으로 새 테스트나 테스트 도구를 도입하지 않는다.
---

# Testing UI

## 이 스킬의 기준

**회귀를 관찰할 수 있는 가장 작은 테스트 층**을 선택한다. 테스트를 읽으면 어떤 입력과
행동이 어떤 결과를 만드는지 알 수 있어야 한다. 실제 동작에 필요한 경계를 mock으로
제거한 뒤 검증했다고 판단하지 않는다.

## 먼저 확인한다

1. 기존 test script, runner, DOM·browser 환경과 fixture 규칙을 확인한다.
2. 설치된 React·Next.js와 테스트 도구가 대상 컴포넌트·API를 지원하는지 확인한다.
3. 변경한 동작, 회귀 위험과 기존 테스트가 이미 보장하는 범위를 적는다.
4. 동작에 network, 시간, 인증, navigation, cookie와 cache 중 무엇이 포함되는지 확인한다.

기존 도구를 우선한다. 이 스킬만을 이유로 runner를 교체하거나 unit·component·E2E
도구를 모두 설치하지 않는다.

## 테스트 층 선택

### 단위: parser·순수 변환·schema 실패

- DOM 없이 입력과 출력으로 확인할 수 있는 계약에 사용한다.
- 실제 parser·schema·변환 함수를 실행한다. 검증 대상 schema 자체를 mock하지 않는다.
- 정상 입력과 누락·빈 문자열·잘못된 타입·중복 key 중 실제 입력 경로에 해당하는 실패를
  확인한다. 공개 모델 변환은 비공개 필드가 출력에 포함되지 않는지도 확인한다.
- 순수 상태 전이는 초기 값, event와 결과를 확인한다. UI와 무관한 규칙을 검증하려고
  전체 화면을 렌더링하지 않는다.

### 컴포넌트: 사용자 상호작용과 화면 결과

- 입력, 클릭, 제출, 오류 표시와 재시도처럼 브라우저에서 일어나는 상호작용을 확인한다.
  DOM 환경에서 충분한지, 실제 browser의 focus·layout 동작이 필요한지 구분한다.
- 대상 컴포넌트와 필요한 실제 Provider를 렌더링한다. 자식 컴포넌트 트리를 통째로
  mock해 이벤트 전달이나 접근 가능한 이름이 사라지게 하지 않는다.
- `QueryClient`와 store는 테스트마다 새로 만들고, 종료 시 구독·진행 중 요청·cache를
  정리한다. module singleton을 공유하거나 테스트 실행 순서에 의존하지 않는다.
- 초기 오류와 기존 데이터가 있는 refetch 오류를 구분한다. Query retry가 검증 대상이
  아니면 테스트 설정에서 끄되 query별 명시적 설정도 확인한다.
- Server Function 결과를 대체한 폼 테스트는 pending·필드 오류·입력 유지만 보장한다.
  서버 검증·인가와 실제 제출 연결까지 보장했다고 보고하지 않는다.

### E2E: framework와 browser를 통과하는 흐름

- App Router의 async Server Component와 실제 navigation·cookie·cache가 동작에
  포함되면 실행 중인 앱을 대상으로 E2E를 선택한다.
- Next.js는 async Server Component에 대한 일부 테스트 도구의 지원이 불완전하므로
  이 컴포넌트의 검증에 E2E를 권장한다. 설치 버전의 지원을 확인하고, async 컴포넌트를
  함수로 직접 호출한 결과만으로 streaming·hydration까지 검증했다고 판단하지 않는다.
- 변경한 사용자 여정을 좁게 선택한다. 예를 들어 저장 → 이동 → 최신 값 표시를
  확인하고, 같은 parser 실패 조합을 E2E에서 모두 반복하지 않는다.
- navigation·cookie·framework cache가 검증 대상이면 해당 기능을 mock하지 않는다.
  cache 동작을 확인할 때는 production build로 실행하고 초기 cache 조건을 통제한다.
- browser context와 테스트 데이터를 격리한다. 같은 서버의 DB·cache는 context를
  나눠도 공유될 수 있으므로 데이터 식별자·계정·초기화 전략을 별도로 정한다.

## Mock은 외부 경계에 둔다

- network·시간·auth 같은 경계에서 필요한 조건을 만든다. 실제 transport와 parser가
  검증 대상이면 HTTP 응답을 대체하고 내부 Query Hook의 결과를 통째로 대체하지 않는다.
- auth fixture는 인증 주체·session 조건을 제공한다. 권한 검사가 검증 대상이면
  인가 함수를 성공으로 고정하지 않고 권한 없는 입력도 실제 로직으로 처리한다.
- 시간 의존 동작에만 fake timer를 사용하고 작업이 끝나면 timer·mock·storage를 복구한다.
- 고정 sleep 대신 화면 결과나 요청 완료처럼 관찰 가능한 조건을 기다린다.
- 서버에서 발생한 요청과 browser 요청을 구분한다. browser의 네트워크 가로채기로
  RSC의 서버 요청까지 대체된다고 가정하지 않는다.

## 읽기 쉬운 검증

- 단순 이름·추출 변경은 기존 관련 검증을 실행한다. 상태 전이·경계 계약을 바꾸면
  성공뿐 아니라 잘못된 입력, 실패, 복구 중 회귀 위험이 있는 행동을 검증한다.
- UI 테스트는 역할과 접근 가능한 이름으로 조작한다. 테스트 이름은
  `저장에 실패하면 입력을 유지하고 오류를 표시한다`처럼 사용자가 관찰하는 결과로 쓴다.
  내부 Hook 호출 횟수나 전체 JSX snapshot으로 구현 모양을 고정하지 않는다.
- fixture에는 해당 행동을 이해하는 데 필요한 값만 드러낸다. assertion을 숨기는
  범용 helper와 서로 다른 시나리오가 조건문으로 섞인 테스트를 만들지 않는다.
- 키보드·focus·label의 확인 기준은 [readable-ui](../readable-ui/SKILL.md#접근성과-검증)를 따른다.

## 새 테스트를 만들지 않는 경우

- 동작이 그대로인 내부 이름 변경과 역할별 추출
- class 나열·순서 정리, 한 번 쓰는 정적 마크업의 단순 정리
- 기존 테스트가 같은 계약과 회귀 위험을 이미 보장하는 경우

이 경우 관련 기존 검증을 실행하고 스타일 변경은 필요한 시각 확인을 한다. 같은 파일을
고쳤더라도 접근 가능한 이름·요소 의미·상태 전이·외부 계약이 바뀌면 해당 행동을 검증한다.

## 위험 신호

- 구현 함수를 mock한 뒤 그 함수가 반환한다고 정한 값만 확인함
- 테스트마다 QueryClient·store·storage 값이 새로 시작하지 않음
- component 테스트만 통과했는데 navigation·서버 인가도 확인했다고 보고함
- sleep과 재실행 횟수를 늘려 실패 원인을 가림
- 단순 마크업 변경에 snapshot이나 도구 설정이 대량으로 추가됨

## 완료 기준

- [ ] 변경한 계약과 선택한 테스트 층의 이유가 명확하다.
- [ ] 검증하려는 실제 동작이 mock 뒤에 숨지 않았다.
- [ ] 상태·요청·시간·테스트 데이터가 다른 테스트에 영향을 주지 않는다.
- [ ] 사용자 관점의 결과와 필요한 실패·복구를 확인했다.
- [ ] 관련 검증을 실행하고 실행하지 못한 층과 남은 제한을 기록했다.

## 공식 기준

- [Next.js 테스트 층과 async Server Components](https://nextjs.org/docs/app/guides/testing)
- [Testing Library query 선택](https://testing-library.com/docs/queries/about/)
- [TanStack Query 테스트 격리와 retry](https://tanstack.com/query/latest/docs/framework/react/guides/testing)
- [Playwright 테스트 격리와 사용자 행동](https://playwright.dev/docs/best-practices)
