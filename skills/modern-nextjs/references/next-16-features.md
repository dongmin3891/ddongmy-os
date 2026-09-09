# Next.js 16 안정 기능

이 문서는 Next.js 16 계열을 위한 기준이다. 적용 전 설치된 minor/patch와 현재 공식
문서를 확인한다. 이후 release에서 상태나 동작이 달라지면 최신 공식 문서를 우선한다.

## 필수 호환성 확인

- 지원되는 Node.js와 TypeScript 최소 버전
- Next.js가 요구하는 React와 React DOM 조합
- React type package
- browser support
- custom webpack/Turbopack 설정
- hosting provider 또는 self-hosting adapter

정확한 숫자는 upgrade 작업 시 공식 guide에서 다시 확인한다.

## Async Request APIs

Next.js 16에서는 다음 request-time API의 동기 접근을 사용하지 않는다.

- `cookies()`
- `headers()`
- `draftMode()`
- page, layout와 Route Handler의 `params`
- page의 `searchParams`
- 일부 metadata image와 sitemap parameter

```tsx
export default async function ProjectPage(
  props: PageProps<'/projects/[slug]'>,
) {
  const { slug } = await props.params
  const searchParams = await props.searchParams

  const input = parseProjectRoute({ slug, view: searchParams.view })
  if (!input.success) return <InvalidProjectRoute />

  return <ProjectScreen {...input.data} />
}
```

- `next typegen`이 제공되는 버전이면 route-aware helper type을 검토한다.
- params와 search params는 사용자 입력으로 보고 검증한다. 위 `parseProjectRoute`와
  오류 UI는 도메인 구현을 생략한 발췌다. parser 작성은
  [schema-at-boundary](../../schema-at-boundary/SKILL.md)를 따른다.
- async 전환을 이유로 상위 component 전체를 Client Component로 바꾸지 않는다.

## Turbopack

- Next.js 16에서는 `next dev`와 `next build`의 기본 bundler다.
- 기존 script의 불필요한 `--turbopack` flag를 정리할 수 있다.
- custom webpack config가 있으면 build 동작과 loader/plugin 대안을 먼저 확인한다.
- fallback bundler를 사용할 때는 임시 호환성 조치인지 운영 선택인지 기록한다.

## React Compiler

- Next.js 16의 `reactCompiler` option은 stable이지만 기본 활성화는 아니다.
- 활성화 전에 compiler plugin 요구사항과 build 시간 영향을 확인한다.
- compiler 도입과 대규모 수동 memoization 제거를 한 번에 섞지 않는다.
- behavior와 performance를 측정하고 기존 tests를 실행한다.

## Proxy

- Next.js 16에서 `middleware` convention은 `proxy`로 이름이 변경되었다.
- 공식 codemod를 검토하고 config option 이름도 함께 확인한다.
- Proxy는 redirect, rewrite와 request header처럼 network boundary 작업에 사용한다.
- 느린 data fetching이나 최종 authorization의 유일한 계층으로 사용하지 않는다.
- runtime과 hosting 동작을 확인한다.

## Cache API

- `cacheLife`와 `cacheTag`의 stable 지원 범위를 확인한다.
- `updateTag`는 Server Action에서 즉시 만료해 read-your-own-writes가 필요할 때 사용한다.
- `revalidateTag`는 stale-while-revalidate가 허용되는 공유 content에 사용한다.
- `revalidatePath`는 특정 route 범위를 갱신해야 할 때 사용한다.
- `refresh`는 Server Action 이후 client router refresh가 실제로 필요할 때 사용한다.
- 가장 좁은 data identity와 invalidation 범위를 선택한다.

## Cache Components

Cache Components는 opt-in programming model이다. 단순 version upgrade만으로 모든
프로젝트에 활성화하지 않는다. 세부 설계는 [cache-components.md](cache-components.md)를
읽는다.

## React 19.2 통합

Next.js 16 App Router가 제공하는 React 기능과 일반 npm React stable의 차이를 공식
문서에서 확인한다.

- `useEffectEvent`
- `<Activity>`
- View Transition 관련 기능
- server cache와 framework integration

React 기능의 일반적인 선택 기준은 `modern-react` 스킬이 사용 가능한 환경이면 그 지침도
적용한다. 해당 스킬이 없다면 React 공식 release와 reference를 직접 확인한다.

## Navigation — 16.3+

Next.js 16.3 이상에서 instant navigation과 partial prefetching 기능을 사용할 때는
현재 공식 문서의 활성화 조건을 확인한다.

- route shell이 즉시 표시되는지 확인한다.
- 동적 데이터는 의미 있는 Suspense fallback과 함께 stream한다.
- 유지되어야 하는 client state와 새로고침되어야 하는 server data를 구분한다.
- cache를 늘리기 전에 navigation waterfall을 먼저 찾는다.
- 제공되는 navigation test helper가 stable인지 설치 버전에서 확인한다.

## 제거·변경 확인

- `next lint` 제거와 ESLint CLI 전환
- async params/searchParams
- image default 변경
- deprecated middleware convention
- 제거된 runtime config와 experimental flag
- cache API signature 변경
- 전역 smooth scroll과 route navigation 동작

## 공식 자료

- [Next.js 16](https://nextjs.org/blog/next-16)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Next.js Proxy](https://nextjs.org/docs/app/getting-started/proxy)
- [Next.js Revalidating](https://nextjs.org/docs/app/getting-started/revalidating)
- [Next.js Releases](https://nextjs.org/blog)
