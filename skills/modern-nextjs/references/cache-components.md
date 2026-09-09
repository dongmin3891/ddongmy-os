# Cache Components

Cache Components는 static shell과 request-time dynamic content를 하나의 route 안에서
구성하는 opt-in model이다. 현재 Next.js version과 `next.config.*`의
`cacheComponents` 활성화 여부를 먼저 확인한다.

## 사용 판단

### 적합하다

- 대부분의 화면은 재사용할 수 있지만 일부 영역만 request data에 의존한다.
- product catalog, article, report처럼 cache 가능한 data가 명확하다.
- navigation shell을 즉시 보여주고 동적 영역은 stream하려 한다.
- freshness, revalidation과 invalidation event를 정의할 수 있다.

### 보류한다

- 대부분의 데이터가 사용자별이며 매 요청 즉시 최신이어야 한다.
- cache key에 포함되는 입력과 private data 경계를 설명할 수 없다.
- 현재 runtime 또는 hosting environment가 지원하지 않는다.
- 단순 version upgrade와 함께 도입해 회귀 원인을 분리하기 어렵다.

## 기본 모델

```text
cache 가능한 영역
→ 'use cache'
→ cacheLife로 수명 표현
→ cacheTag로 data identity 표현

request-time 동적 영역
→ Suspense boundary
→ 의미 있는 fallback
→ streaming
```

## `'use cache'`

- async function, component 또는 file scope 중 가장 작은 명확한 범위를 선택한다.
- argument와 closure 값이 cache key에 미치는 영향을 확인한다.
- cached function에 secret이나 사용자별 값을 부주의하게 캡처하지 않는다.
- random, 현재 시간과 UUID도 cache 수명 동안 같은 값이 된다는 점을 고려한다.
- cached result가 Client Component로 전달되면 공개 가능한 모델로 축소한다.

## `cacheLife`

다음 세 의미를 제품 요구사항으로 설명한다.

- `stale`: client가 새 확인 없이 재사용할 수 있는 시간
- `revalidate`: background regeneration 주기
- `expire`: 오래된 값도 더 이상 제공할 수 없는 최대 시간

profile 이름을 관성적으로 선택하지 않는다. CMS content, inventory, user settings와
historical report는 서로 다른 수명을 가진다.

## `cacheTag`

- tag는 화면 경로보다 data identity를 표현한다.
- entity와 collection 관계를 고려한다.
- mutation이 영향을 주는 최소 tag 집합을 정의한다.
- tag 문자열 생성 규칙을 한 곳에서 관리하되 의미 없는 wrapper를 만들지 않는다.

```ts
const postTag = {
  all: 'posts',
  detail: (slug: string) => `post:${slug}`,
}
```

## 갱신 선택

| 요구사항 | 기본 API |
| --- | --- |
| 작성자가 변경 직후 자신의 값을 봐야 함 | `updateTag` |
| 독자가 잠시 stale content를 봐도 됨 | `revalidateTag(..., 'max')` |
| 특정 route 또는 layout 범위를 다시 생성 | `revalidatePath` |
| Server Action 뒤 현재 client route refresh | `refresh` |

- `updateTag`의 Server Action 전용 제약을 확인한다.
- 넓은 path invalidation보다 정확한 tag를 우선 검토한다.
- 하나의 mutation이 path와 tag 모두 갱신해야 하는지 중복 없이 판단한다.

## Dynamic holes와 Suspense

- request-time API를 읽는 subtree를 의미 있는 `Suspense` 경계로 감싼다.
- fallback은 최종 UI의 크기와 의미를 반영한다.
- 하나의 느린 query 때문에 route 전체가 block되지 않는지 확인한다.
- 독립 data fetching은 가능한 한 병렬로 시작한다.
- 지나치게 많은 작은 Suspense 경계가 화면을 산만하게 만들지 않게 한다.

## 보안과 개인정보

- 인증 결과와 사용자별 데이터를 공유 cache에 넣지 않는다.
- authorization은 cached UI 존재 여부와 무관하게 data access 직전에 수행한다.
- tenant, locale, permission처럼 결과를 바꾸는 입력이 cache identity에 반영되는지 확인한다.
- 외부 API 응답은 cache에 넣기 전에 검증하고 공개 모델로 변환한다.

## Runtime 제약

- Cache Components의 Node.js runtime 요구사항을 현재 공식 문서에서 확인한다.
- Edge runtime과 함께 사용할 수 있다고 가정하지 않는다.
- multi-instance self-hosting이면 cache storage와 invalidation 전파 방식을 확인한다.
- rolling deployment 중 build ID와 cache compatibility를 확인한다.

## 검증

- [ ] cacheComponents 활성화 여부가 명확하다.
- [ ] cache key를 결정하는 입력을 설명할 수 있다.
- [ ] stale, revalidate와 expire가 제품 요구사항과 맞는다.
- [ ] mutation 이후 사용자가 볼 consistency가 정의되었다.
- [ ] 사용자별 정보가 공유 cache에 들어가지 않는다.
- [ ] static shell과 dynamic hole의 loading UI가 자연스럽다.
- [ ] build output에서 예상 route가 prerender 또는 dynamic으로 분류된다.
- [ ] 배포 환경에서 revalidation과 multi-instance 동작을 확인했다.

## 공식 자료

- [Next.js Caching and Cache Components](https://nextjs.org/docs/app/getting-started/caching)
- [Next.js Revalidating](https://nextjs.org/docs/app/getting-started/revalidating)
- [Next.js Data Security](https://nextjs.org/docs/app/guides/data-security)
