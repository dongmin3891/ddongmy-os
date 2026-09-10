# TanStack Query 레포지토리 근거

이 문서는 규칙을 바꾸거나 큰 query layer를 리팩터링할 때만 읽는다. 2026-09-10에
공개된 source와 GitHub 표시값을 확인했다. star는 조사 후보를 고르는 보조 신호이며 코드
품질이나 현재 프로젝트 적합성을 보장하지 않는다.

## 비교 대상

| 레포지토리 | 당시 규모 | 확인한 패턴 | 이 스킬의 판단 |
| --- | ---: | --- | --- |
| [TanStack Query](https://github.com/TanStack/query) | 약 50.3k stars | `queryOptions`로 key·function·정책을 함께 재사용하고, query key에 결과를 바꾸는 입력을 포함하며, `AbortSignal`을 제공한다. | 동작과 타입 보증의 기준으로 채택한다. |
| [Bulletproof React](https://github.com/alan2207/bulletproof-react) | 약 35.8k stars | feature의 API 파일에 도메인 요청, options, hook을 함께 둔다. | feature 근접성과 도메인 이름은 채택한다. 모든 query를 hook으로 감싸는 형식은 의무화하지 않는다. |
| [Supabase](https://github.com/supabase/supabase) | 약 109k stars | 큰 앱에서 도메인별 key 파일, typed query hook, 명시적 invalidation 함수와 signal 전달을 사용한다. | 규모가 큰 feature의 key 분리와 cancellation 전달은 채택한다. 범용 options와 wrapper는 필요가 확인될 때만 쓴다. |

## 코드에서 확인한 점

- TanStack의 [Query Options 문서](https://tanstack.com/query/latest/docs/framework/react/guides/query-options)는
  같은 key와 query function을 여러 소비자에서 공유할 때 `queryOptions`가 한 원본과 타입
  추론을 유지한다고 설명한다. 따라서 재사용이 없는 짧은 query까지 추출하라는 뜻으로
  확대하지 않는다.
- TanStack의 [Render Optimizations 문서](https://tanstack.com/query/latest/docs/framework/react/guides/render-optimizations)는
  query 결과의 사용한 속성을 추적하며 object rest destructuring이 이를 방해한다고 밝힌다.
  결과 객체에 도메인 이름을 붙여 필요한 속성을 직접 읽는 방식은 성능과 가독성에 모두
  맞는다.
- Bulletproof React의
  [`get-discussions.ts`](https://github.com/alan2207/bulletproof-react/blob/master/apps/nextjs-app/src/features/discussions/api/get-discussions.ts)는
  `getDiscussions`, `getDiscussionsQueryOptions`, `useDiscussions`를 같은 feature 경계에 둔다.
  찾기 쉬운 구조는 참고하되, 예시의 query function이 `signal`을 전달하지 않는 점은
  [공식 cancellation 계약](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation)에
  맞춰 보완한다.
- Supabase의
  [`organizations-query.ts`](https://github.com/supabase/supabase/blob/master/apps/studio/data/organizations/organizations-query.ts)와
  [`keys.ts`](https://github.com/supabase/supabase/blob/master/apps/studio/data/organizations/keys.ts)는
  도메인 key, transport 변환, hook과 invalidation 진입점을 명시하고 `signal`을 transport에
  전달한다. 다만 예상과 다른 응답을 빈 배열로 바꾸는 코드는 계약 위반과 실제 빈 목록을
  구분하지 못하므로 이 팩에서는 채택하지 않는다.

## 도출한 우선순위

1. 화면에서 어떤 원격 데이터를 읽고 어떤 상태를 보여주는지 먼저 보인다.
2. 한 번 이동하면 key·입력·요청·cache 정책을 찾을 수 있다.
3. 재사용이 생긴 뒤 `queryOptions`, key factory, custom hook 순으로 필요한 것만 추가한다.
4. 유명 레포의 관례도 오류 의미를 숨기거나 이동 단계를 늘리면 채택하지 않는다.
