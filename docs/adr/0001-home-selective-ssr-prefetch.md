# ADR-0001: 홈 첫 화면 데이터만 SSR Prefetch한다

- 상태: 채택 · 회고 기록
- 회고 작성일: 2026-11-09
- 대상: 기존 U+모아tv 홈 화면
- 관련 기술: Next.js, TanStack Query, SSR, Hydration

## 문제

기존 홈 화면은 주요 데이터를 브라우저에서 조회하는 CSR 구조였다. HTML을 받은 뒤 데이터
요청과 렌더링이 이어져 주요 콘텐츠 노출이 늦었고, 데이터가 도착한 뒤 화면 구조가 바뀌며
레이아웃 이동이 발생했다.

초기 측정값은 개발·QA 환경의 Lighthouse 기준 LCP 12.2초, CLS 0.69였다. 초기 화면을
SSR로 전환할 필요가 있었지만 모든 홈 데이터를 서버에서 조회하면 느린 API가 HTML 응답을
막고, TTFB와 요청당 cache·timer·직렬화 비용이 증가할 수 있었다.

## 검토한 대안

### 기존 CSR 유지

- 장점: 서버의 데이터 조회와 메모리 부담이 작고 사용자별 데이터를 다루기 쉽다.
- 포기한 이유: 초기 요청이 HTML 응답 이후에 시작되고, 주요 콘텐츠 노출과 레이아웃 안정화가
  늦어진다.

### 모든 홈 데이터를 SSR로 조회

- 장점: 첫 HTML에 더 많은 콘텐츠를 포함하고 브라우저의 초기 요청 수를 줄일 수 있다.
- 포기한 이유: 첫 화면에 필요하지 않은 API까지 TTFB를 지연시키고, 일부 API 장애가 전체
  응답에 영향을 주며, 서버의 Query cache와 직렬화 범위를 불필요하게 키울 수 있다.

### 첫 화면 데이터만 SSR Prefetch

- 장점: LCP에 직접 영향을 주는 요청은 앞당기고, 나머지 요청은 초기 HTML 응답 경로에서
  분리할 수 있다.
- 비용: 서버와 클라이언트의 Query 계약을 맞춰야 하고, 서버 cache 생명주기와 중복 요청을
  별도로 관리해야 한다.

## 결정

첫 화면과 LCP에 직접 영향을 주는 데이터만 서버에서 Prefetch하고 TanStack Query
Hydration으로 브라우저에 전달한다. 초기 렌더링을 막을 필요가 없는 데이터는 클라이언트에서
조회한다.

- 첫 화면의 주요 콘텐츠를 서버 Prefetch 대상으로 제한한다.
- 서버에서 조회한 Query를 Hydration해 브라우저의 같은 초기 요청을 줄인다.
- 서버와 클라이언트에서 같은 Query key와 데이터 계약을 사용한다.
- 첫 배너 요청과 이미지 로딩 우선순위 조정은 별도 후속 최적화로 수행한다.

## 결과

- SSR 적용 단계에서 LCP: 12.2초 → 7.2초, CLS: 0.69 → 0.034
- SSR과 `next/image` 최적화를 함께 적용한 최종 Lighthouse 리포트에서 LCP: 2.7초,
  CLS: 0.002
- 첫 배너 요청 우선순위 조정 후 LCP: 2.7초 → 1.3초

각 수치는 개발·QA Lighthouse의 서로 다른 단계별 리포트다. 하나의 연속 실험이나 운영
사용자 전체의 RUM 개선율로 해석하지 않는다.

## 감수한 비용과 위험

- 서버가 초기 API 요청과 직렬화를 담당하므로 CPU·메모리 비용이 증가할 수 있다.
- QueryClient, cache와 timer가 요청 이후 남으면 SSR 서버의 heap이 증가할 수 있다.
- Query key나 staleTime이 서버와 브라우저에서 다르면 Hydration 직후 중복 요청이 발생할
  수 있다.
- Prefetch API가 느리거나 실패하면 TTFB와 초기 화면에 영향을 줄 수 있다.

당시 서버 비용의 금액과 운영 TTFB 변화는 별도 수치로 남아 있지 않으므로 효과로 추정하지
않는다.

## 검증과 후속 관찰

- Lighthouse에서 단계별 LCP와 CLS를 비교한다.
- Hydration 직후 같은 API가 중복 호출되는지 확인한다.
- 반복 SSR 요청에서 Node.js heap이 안정 구간으로 돌아오는지 관찰한다.
- Prefetch API 실패 시 초기 화면의 fallback과 클라이언트 복구를 확인한다.
- 운영 환경에서는 LCP만이 아니라 TTFB, 오류율과 서버 메모리를 함께 관찰한다.

## 관련 기록

- [홈 LCP 12.2초에서 1.3초까지, App Router 전환과 함께 한 단계씩 줄인 기록](https://ddongmy.com/log/utv-mobile-home-performance-app-router)
- [SSR V8 Heap OOM: QueryClient와 gcTime을 의심하고 검증한 과정](https://ddongmy.com/log/nextjs-ssr-queryclient-gctime-oom)
