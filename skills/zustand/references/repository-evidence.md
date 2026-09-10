# Zustand 레포지토리 근거

이 문서는 규칙을 바꾸거나 큰 store를 리팩터링할 때만 읽는다. 2026-09-10에 공개된
source와 GitHub 표시값을 확인했다. star는 조사 후보를 고르는 보조 신호이며 코드 품질이나
현재 프로젝트 적합성을 보장하지 않는다.

## 비교 대상

| 레포지토리 | 당시 규모 | 확인한 패턴 | 이 스킬의 판단 |
| --- | ---: | --- | --- |
| [Zustand](https://github.com/pmndrs/zustand) | 약 58.7k stars | store 안의 이름 있는 action, 필드별 selector, 필요할 때의 `useShallow`, slice와 scoped store 방법을 제공한다. | 작은 store의 직접적인 state·action·selector를 기본값으로 채택한다. |
| [xyflow](https://github.com/xyflow/xyflow) | 약 38.3k stars | 각 React Flow Provider가 store 인스턴스를 만들고, 소비자는 selector를 명시해 구독한다. | 인스턴스별 수명이 실제 요구일 때 factory와 Provider를 쓰는 근거로 채택한다. |
| [LobeHub](https://github.com/lobehub/lobehub) | 약 82.4k stars | 큰 store를 domain slice·initial state·selector·reducer로 나눈다. | 대규모 store가 실제로 충돌할 때의 참고다. 작은 store의 기본 구조로 복사하지 않는다. |

## 코드에서 확인한 점

- Zustand의 [README](https://github.com/pmndrs/zustand/blob/main/README.md)는 state와 이름 있는
  action을 한 store에서 보여주고, 컴포넌트가 필요한 필드를 selector로 직접 읽는다.
  여러 값을 한 결과로 만들 때만 `useShallow`를 소개한다.
- 공식 [자동 selector 문서](https://github.com/pmndrs/zustand/blob/main/docs/learn/guides/auto-generating-selectors.md)는
  직접 selector가 지루해질 때 사용할 수 있는 선택지다. 추가 generic과 런타임 규칙이
  생기므로 이 팩에서는 기본값으로 삼지 않는다.
- xyflow의
  [`ReactFlowProvider`](https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/ReactFlowProvider/index.tsx)는
  Provider마다 store를 한 번 만들며 여러 flow에는 별도 Provider가 필요하다고 명시한다.
  [`useStore`](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useStore.ts)는
  selector를 공개 계약으로 받고 일반 작업에는 더 구체적인 hook을 권한다. 이는 라이브러리의
  캡슐화 요구가 큰 사례이므로 일반 앱의 모든 store에 같은 wrapper를 강제하지 않는다.
- LobeHub의
  [store data structures 지침](https://github.com/lobehub/lobehub/blob/canary/.agents/skills/store-data-structures/SKILL.md)은
  domain별 initial state, selector와 복잡한 optimistic update용 reducer를 분리한다. 규모가
  충분하면 유효하지만, 서버 응답을 Zustand에 다시 보관하는 구조는 이 팩의 TanStack Query
  소유권 원칙과 충돌하므로 가져오지 않는다.
- 공식 [Next.js 지침](https://github.com/pmndrs/zustand/blob/main/docs/learn/guides/nextjs.md)은
  요청별 store와 동일한 server/client 초기값을 요구한다. 따라서 SSR에서의 Provider는
  장식적 추상화가 아니라 state 격리와 hydration을 위한 책임으로만 둔다.

## 도출한 우선순위

1. 컴포넌트에서 구독 값과 action 이름이 직접 보인다.
2. store 한 곳에서 초기값과 허용된 전이를 함께 찾을 수 있다.
3. 재사용·독립 변경·인스턴스 수명 문제가 생긴 뒤 selector 파일, slice, Provider를 추가한다.
4. 유명 레포의 규모 전용 구조가 작은 앱의 읽기 비용을 늘리면 채택하지 않는다.
