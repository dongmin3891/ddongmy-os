---
name: next-forms
description: >
  Next.js App Router의 form과 Server Function을 구현·리팩터링·검토할 때 사용한다.
  서버 검증·인가, useActionState 결과, pending·필드 오류·실패 복구와 성공 후 cache
  갱신의 흐름을 다룬다. 일반 React Hook 선택이나 Next.js cache API 버전 비교는 제외한다.
---

# Next Forms

## 이 스킬의 기준

폼은 **입력 → 서버 검증·인가 → 변경 → 갱신 → 결과 표시** 순서로 읽혀야 한다.
서버는 변경의 권한과 성공 여부를 결정하고 client는 입력·pending·오류를 표현한다.

## 먼저 확인한다

1. 설치된 Next.js, React와 React DOM이 Server Functions와 선택한 Action API를 지원하는지
   확인한다. `useActionState` 예시는 React 19+다. 지원하지 않으면 기존 제출 방식을 유지한다.
2. 기존 form 도구, validator, 인증 함수, mutation과 cache 소유자를 확인한다.
3. 성공 후 머무를지 이동할지, 입력 초기화·유지와 중복 제출 정책을 정한다.
4. 파일 업로드, 배열 필드, 동적 필드와 재시도 요구사항을 확인한다.

## 사용한다 / 사용하지 않는다

- 내부 서버 변경에는 form에서 호출하는 Server Function을 기본으로 검토한다.
- 외부 client가 사용하는 HTTP 계약, webhook, 별도 upload가 필요하면 Route Handler를
  사용한다. Server Function을 호출하려고 불필요한 HTTP 계층을 추가하지 않는다.
- 결과가 UI state가 되어야 할 때 `useActionState`를 사용한다. 단순 제출·redirect만
  있으면 결과 state를 억지로 만들지 않는다.
- 공유 제출 버튼이 부모 form의 pending을 읽을 때만 `useFormStatus`를 검토한다.
  현재 form 컴포넌트에 이미 `isPending`이 있으면 그대로 사용한다.
- 복잡한 입력 상호작용 때문에 기존 form 라이브러리가 필요하면 유지한다.
  사전 검증과 dirty state가 있어도 서버가 최종 검증과 인가를 수행한다.

## 서버 경계와 결과 계약

- action을 공개 endpoint로 취급한다. session에서 신원을 얻고 작업 직전에 대상 자원에
  대한 권한을 확인한다. 클라이언트가 보낸 user ID나 이전 action state를 신뢰하지 않는다.
- [schema-at-boundary](../schema-at-boundary/SKILL.md)에 따라 입력을 파싱한다.
  예상 입력 오류는 직렬화 가능한 `fieldErrors`와 form 수준 `message`로 반환한다.
- 중복 이름·충돌 같은 예상 도메인 오류는 public result로 매핑한다. 예상 밖 예외는
  기존 오류 경계·서버 로깅 정책으로 보내고 원문 오류를 UI에 노출하지 않는다.
- pending 버튼 비활성화는 DB 중복 방지 장치가 아니다. 중복이 문제가 되는 작업에는
  서버의 uniqueness, transaction 또는 idempotency 정책을 적용한다.

## 성공·실패 흐름

- 변경 성공 후 cache 갱신을 소유할 action 또는 use case를 하나 정한다. UI Effect,
  action, mutation callback에 같은 invalidation을 중복 배치하지 않는다.
- Next.js cache와 Query cache가 모두 실제로 사용되면 각 cache에 필요한 갱신을 한
  흐름에서 조정한다. 한쪽 갱신이 다른 쪽까지 자동으로 갱신한다고 가정하지 않는다.
- cache API의 의미와 버전 선택은 [modern-nextjs](../modern-nextjs/SKILL.md)를 따른다.
  route 배치는 [next-app-router](../next-app-router/SKILL.md)를 따른다.
- `redirect`는 성공 처리 뒤 catch 밖에서 호출한다. framework의 제어 흐름 예외를
  일반적인 저장 실패로 바꾸지 않는다.
- DB 변경 후 갱신·이동 실패를 DB rollback으로 표현하지 않는다. 이미 저장되었는지
  구분해 안내하고 무조건 재제출하도록 유도하지 않는다.
- 일반 폼은 서버 응답을 기다리는 흐름으로 시작한다. optimistic UI가 필요하면 적용,
  실패 복구, 오류 안내와 원본 갱신을 같은 client action에서 읽을 수 있게 둔다.

## 입력·접근성

- 저장 실패 후 입력을 유지할 방법을 정한다. Action이 오류 객체를 정상 반환해도
  uncontrolled form reset에 영향을 줄 수 있으므로 실제 React 동작을 확인한다.
  controlled draft 또는 명시적인 반환 값 복원 중 단순한 방법을 사용한다.
- field label, `aria-invalid`, 오류와의 `aria-describedby` 연결을 제공한다.
- pending 중 버튼 문구와 상태 안내를 제공하고 성공·실패 결과를 live region으로 알린다.
  긴 폼은 첫 오류 필드 또는 오류 요약으로 focus를 이동하는 정책을 정한다.
- 읽기 전용 입력과 disabled 입력의 제출 차이를 확인한다. 서버 인가는 UI 속성과 별개다.

## 필요한 문서만 읽는다

- action·결과 타입·client form 구현과 optimistic 복구를 연결할 때
  [references/action-flow.md](references/action-flow.md)를 읽는다.
- action 입력·결과의 이름, 필수성·상태 union은
  [readable-contracts](../readable-contracts/SKILL.md)를 따른다.
- 이름·추출·키보드·행동 테스트의 공통 기준은 [readable-ui](../readable-ui/SKILL.md)를 따른다.

## 검증 방법

서버 action을 직접 호출하는 경우도 포함해 잘못된 입력과 권한 없는 변경이 저장되지
않는지 확인한다. 화면에서는 실패 시 입력 유지, 필드 오류 연결, pending, 성공 후 최신
값을 확인한다. optimistic UI를 도입했다면 실패 후 원본 복구도 검증한다.

## 위험 신호

- 하나의 폼에 `isLoading`, Hook pending, store pending이 중복됨
- 클라이언트 검증만 있고 action 인가가 없음
- catch가 redirect까지 잡거나 저장 후 갱신 실패를 저장 취소로 표시함
- 성공 처리가 여러 Effect와 callback에 분산됨

## 완료 기준

- [ ] 검증·인가·변경·갱신 순서와 소유자를 읽을 수 있다.
- [ ] public 결과 타입과 예상·예상 밖 오류 처리 경로가 구분된다.
- [ ] pending·오류·성공을 접근 가능하게 표시한다.
- [ ] 실패 시 입력 유지와 재시도·중복 방지 정책을 확인했다.
- [ ] 성공 후 최신 값과 필요한 실패 복구를 검증했다.

## 공식 기준

- [Next.js Forms](https://nextjs.org/docs/app/guides/forms)
- [React useActionState](https://react.dev/reference/react/useActionState)
- [React form reset](https://react.dev/reference/react-dom/components/form)
- [React useOptimistic](https://react.dev/reference/react/useOptimistic)
- [Next.js redirect](https://nextjs.org/docs/app/api-reference/functions/redirect)
