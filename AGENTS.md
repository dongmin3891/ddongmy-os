# Project Instructions

## Skills

코드를 작성·수정·검토하기 전에 현재 작업에 적용되는 스킬을 `skills/`에서 고른다.

1. 가장 작은 스킬 집합을 선택하고, 작업 시작 시 선택한 스킬과 이유를 짧게 알린다.
2. 선택한 `SKILL.md`를 먼저 끝까지 읽는다.
3. `SKILL.md`가 안내하는 reference만 필요한 시점에 읽는다.
4. 모든 스킬을 한꺼번에 읽지 않는다.
5. 사용자가 스킬을 직접 지정하면 그 선택을 우선한다.
6. 해당하는 스킬이 없으면 억지로 적용하지 않고 저장소의 기존 패턴을 따른다.

### 작업별 진입점

- UI 이름·조건 분기·컴포넌트와 Hook 추출: `skills/readable-ui/SKILL.md`
- API·함수·props의 TypeScript 계약: `skills/readable-contracts/SKILL.md`
- params·API·form 등 외부 입력 검증: `skills/schema-at-boundary/SKILL.md`
- fetch·Axios와 HTTP 오류·취소·재시도: `skills/http-client/SKILL.md`
- React API와 Hook 선택: `skills/modern-react/SKILL.md`
- Next.js 버전·upgrade·cache·runtime: `skills/modern-nextjs/SKILL.md`
- App Router 폴더·의존성·route 조립: `skills/next-app-router/SKILL.md`
- Next.js form·Server Function·pending·오류: `skills/next-forms/SKILL.md`
- TanStack Query cache·mutation·hydration: `skills/tanstack-query/SKILL.md`
- Zustand client workflow·persist·SSR: `skills/zustand/SKILL.md`
- Tailwind·shadcn/ui·Radix 스타일 구조: `skills/tailwind-ui/SKILL.md`
- 단위·컴포넌트·E2E 테스트 층과 mock 경계: `skills/testing-ui/SKILL.md`

여러 층이 실제로 함께 바뀔 때만 스킬을 조합한다. 예를 들어 외부 API 연동은
`readable-contracts`로 계약을 정하고, `schema-at-boundary`로 응답을 검증하며,
`http-client`로 통신을 실행한다. Client cache가 필요할 때만 `tanstack-query`를 더한다.

스킬 지침과 사용자의 명시적 요구가 충돌하면 사용자의 요구를 따른다.
