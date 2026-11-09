# Next.js 의존성 보안 점검 Runbook

이 문서는 ddongmy의 Next.js·React 및 npm 의존성을 반복해서 점검하고, 공식 보안 권고와
대조한 뒤 패치·회귀 테스트·배포·롤백까지 판단하기 위한 운영 절차다. 명령 실행 자체보다
"우리 서비스가 실제로 영향을 받는가"와 "안전하게 수정됐음을 어떻게 증명할 것인가"를
남기는 데 목적이 있다.

## AI에게 작업 요청하기

저장소의 `AGENTS.md`는 의존성 보안 작업에
[`dependency-security` 스킬](../../skills/dependency-security/SKILL.md)을 사용하도록 연결한다.
따라서 긴 절차를 프롬프트에 다시 작성하지 않고 범위와 권한만 명확히 요청하면 된다.

진단만 요청:

```text
의존성 보안 상태를 점검하고 공식 권고와 대조해줘. 파일은 변경하지 마.
```

로컬 패치와 검증까지 요청:

```text
의존성 보안 점검 후 같은 major의 안전한 패치를 적용하고 회귀 검증과 감사 기록까지
갱신해줘. major upgrade와 운영 배포는 하지 마.
```

운영 배포는 별도 권한으로 요청한다. "점검"은 패키지 변경을, "패치"는 배포를 자동으로
허용하지 않는다.

## 점검 시점

다음 상황에서 이 절차를 실행한다.

- Next.js, React 또는 주요 런타임 패키지의 보안 권고가 공개됐을 때
- Dependabot, npm audit, GitHub Security 알림이 발생했을 때
- 정기 의존성 업데이트 전
- 프로덕션 배포 또는 런타임 구조가 바뀌었을 때
- 장애 원인이 framework나 transitive dependency로 의심될 때

결과는 `docs/security/audits/YYYY-MM-DD.md`에 날짜별로 기록한다. 이 runbook에는 특정
시점의 최신 버전을 고정하지 않는다.

## 1. 점검 범위와 실행 환경 기록

먼저 검사 결과를 재현할 수 있도록 다음 정보를 기록한다.

```bash
date
node --version
npm --version
git rev-parse --short HEAD
```

함께 확인할 항목은 다음과 같다.

- 배포 방식: managed hosting, standalone, container, self-hosting
- Router: App Router, Pages Router 또는 혼용
- 실제 production Node.js 버전
- reverse proxy, CDN, Kubernetes 등 요청 경로
- `package.json`의 선언 버전과 lockfile의 실제 설치 버전

## 2. 실제 설치 버전 확인

```bash
npm ls next react react-dom react-server-dom-webpack --all
```

이 명령은 `package.json`에 작성한 범위가 아니라 현재 `node_modules`에 설치된 의존성
트리를 보여준다.

- `deduped`: 여러 패키지가 같은 설치본을 공유한다.
- `invalid`: peer dependency 또는 선언 범위와 실제 설치가 맞지 않을 수 있다.
- `(empty)` 또는 출력 없음: 별도 npm 패키지로 설치되지 않았다는 뜻이다.

출력에 `react-server-dom-webpack`이 없다고 React Server Components를 사용하지 않는다고
판단하지 않는다. Next.js는 RSC 구현을 framework 내부에 번들링할 수 있으므로 Next.js
자체 보안 권고와 App Router 사용 여부를 함께 확인한다.

필요하면 보안 결과에 등장한 패키지의 유입 경로를 추가로 확인한다.

```bash
npm ls <package-name> --all
npm explain <package-name>
```

## 3. npm 보안 데이터베이스 검사

전체 개발·운영 의존성을 검사한다.

```bash
npm audit
```

프로덕션 설치에 포함되는 의존성을 별도로 본다.

```bash
npm audit --omit=dev
```

`--omit=dev`는 npm의 dependency 분류를 기준으로 한다. 실제 production image가 개발
의존성까지 복사한다면 이 결과만으로 배포 artifact의 공격 표면을 설명할 수 없다. Dockerfile의
install·copy 단계와 최종 image의 패키지 목록을 함께 확인한다.

자동화나 상세 분석이 필요하면 JSON 결과를 사용하되, 원문 전체를 날짜별 문서에 복사하지
않는다.

```bash
npm audit --json
npm audit --omit=dev --json
```

`npm audit` 결과는 취약 패키지가 설치됐다는 증거이지, 현재 코드에서 곧바로 공격 가능하다는
증거는 아니다. 반대로 audit 결과가 0건이어도 framework 내부 번들, 새로 공개됐지만 아직
npm DB에 반영되지 않은 권고, 잘못된 설정까지 안전하다는 의미는 아니다.

`npm audit fix --force`는 기본 대응으로 사용하지 않는다. major downgrade나 unrelated
dependency 변경이 함께 발생할 수 있으므로 목표 버전을 직접 정하고 diff와 lockfile을
검토한다.

## 4. 공식 보안 권고와 대조

각 취약점은 다음 순서로 확인한다.

1. 프로젝트에 설치된 정확한 버전
2. 공식 권고의 affected versions
3. patched versions
4. 공개일과 마지막 수정일
5. 공격에 필요한 기능·설정·배포 조건
6. 현재 코드와 인프라가 그 조건을 만족하는지

우선 사용하는 공식 출처는 다음과 같다.

- [Next.js Security Advisories](https://github.com/vercel/next.js/security/advisories)
- [Next.js Support Policy](https://nextjs.org/support-policy)
- [React Security Advisories](https://github.com/react/react/security/advisories)
- [React Blog](https://react.dev/blog)
- 각 패키지 maintainer의 GitHub Security Advisory
- [npm package registry](https://www.npmjs.com/)의 stable dist-tag

검색 결과나 CVE 요약 사이트만으로 패치 버전을 결정하지 않는다. 공식 권고가 수정되거나
초기 패치가 불완전해 후속 패치가 나올 수 있으므로 점검 날짜에 다시 확인한다.

## 5. 프로젝트 노출 가능성 확인

Next.js·React 보안 권고에서는 version match와 feature exposure를 분리해 기록한다.

| 확인 대상 | 코드·설정 예시 | 판단할 내용 |
| --- | --- | --- |
| React Server Components | App Router, Next.js 내부 RSC bundle | 별도 패키지가 없어도 RSC endpoint가 존재하는가 |
| Server Actions | `'use server'`, form action | 외부 요청으로 호출 가능한 함수와 payload 제한이 있는가 |
| Cache Components | `'use cache'`, `cacheComponents` | 사용자별·Draft Mode 데이터가 공유 cache에 들어가는가 |
| Image Optimization | `next/image`, `/_next/image`, `sharp` | 원격 이미지·SVG·redirect·내부 IP가 처리되는가 |
| Metadata image | `ImageResponse`, `next/og`, `opengraph-image.*` | 외부 입력이 이미지 생성에 들어가는가 |
| Route Handler forwarding | `return fetch(...)`, upstream `Response` 재사용 | self-hosted proxy 뒤에서 원본 응답을 그대로 전달하는가 |
| HTML/SVG 삽입 | `dangerouslySetInnerHTML`, Mermaid, sanitizer | 외부 콘텐츠가 sanitizer를 거쳐 DOM에 삽입되는가 |
| 외부 입력 검증 | Zod schema, body size limit | CPU·메모리 고갈을 막을 상한이 있는가 |

기능을 찾지 못해 노출 가능성이 낮아도 설치 버전이 공식 영향 범위에 있으면 패치를 기본값으로
한다. 코드 검색은 임시 완화 판단과 회귀 테스트 범위를 정하는 데 사용한다.

## 6. 패치 단위 결정

보안 변경은 가능한 한 원인을 추적할 수 있는 작은 단위로 나눈다.

1. 같은 major의 framework·React 보안 patch
2. 직접 사용하는 runtime dependency 보안 patch
3. major upgrade가 필요한 UI·tooling dependency
4. dev-only transitive dependency 정리

Next.js, React, React DOM, `eslint-config-next`, React type package의 호환 조합을 확인한다.
React와 Next.js를 독립적으로 무조건 최신화하지 않는다. canary, experimental, preview 버전은
공식 권고가 명시적으로 요구하지 않는 한 production patch target으로 선택하지 않는다.

패치 전에 다음을 기록한다.

| 항목 | 현재 버전 | 영향 범위 | 목표 버전 | 직접/간접 | 실제 사용 조건 | 결정 |
| --- | --- | --- | --- | --- | --- | --- |
| 예: Next.js |  |  |  | 직접 |  | 즉시 패치/분리/보류 |

## 7. 변경 전후 검증

변경 전 기준선을 먼저 남긴다.

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

패치 후 lockfile과 설치 트리를 다시 확인한다.

```bash
npm ci
npm ls next react react-dom react-server-dom-webpack --all
npm audit
npm audit --omit=dev
npm test
npm run typecheck
npm run lint
npm run build
```

`npm ci`는 현재 작업 디렉터리의 `node_modules`를 다시 구성하므로 미커밋 변경과 실행 중인
개발 서버를 확인한 뒤 사용한다.

ddongmy의 기능 회귀 범위는 최소한 다음을 포함한다.

- 정적 페이지와 동적 App Router 페이지 렌더링
- `/api/health` 및 주요 Route Handler
- Notion/R2 개발 로그 썸네일과 `/_next/image`
- `sharp` 기반 Notion cover WebP 변환
- Mermaid diagram 렌더링과 잘못된 diagram fallback
- metadata, sitemap, robots, SVG asset
- authenticated secret을 사용하는 webhook과 내부 API의 거부 경로
- Docker production image build와 non-root 실행

## 8. 배포와 운영 확인

로컬 build 성공만으로 완료하지 않는다. 운영 서비스라면 다음을 확인한다.

1. commit SHA로 production image 생성
2. image 및 manifest diff 검토
3. rolling update 중 Ready replica 유지
4. startup, readiness, liveness probe 통과
5. 주요 정적·동적 route smoke test
6. `/_next/image`와 Mermaid 포함 페이지 확인
7. 서버 로그에서 hydration, cache, image, RSC 오류 확인
8. CPU·메모리·5xx·latency 관찰
9. 직전 commit SHA image로 rollback 가능한지 확인

보안 패치가 배포되기 전에는 "수정 완료"로 기록하지 않는다. 로컬 검증 완료, image 생성,
배포 완료, 운영 관찰 완료 상태를 구분한다.

## 9. 날짜별 감사 기록 양식

```md
# YYYY-MM-DD 의존성 보안 감사

## 상태

- 범위:
- 대상 commit:
- 실행 환경:
- 결론:

## 설치 버전

| 패키지 | 선언 범위 | 실제 버전 | 목표 버전 |
| --- | --- | --- | --- |

## Audit 요약

- 전체:
- production:

## 공식 권고 대조

| 패키지/권고 | 영향 범위 | 현재 영향 | 프로젝트 노출 | 결정 |
| --- | --- | --- | --- | --- |

## 검증 결과

- [ ] test
- [ ] typecheck
- [ ] lint
- [ ] production build
- [ ] container smoke
- [ ] production smoke
- [ ] rollback 확인

## 남은 위험과 후속 작업
```

## 완료 기준

- 설치 버전과 공식 영향 범위를 날짜와 함께 기록했다.
- 직접·간접·framework 내부 번들을 구분했다.
- 실제 코드와 배포 조건으로 노출 가능성을 평가했다.
- 패치 목표와 보류 이유가 명확하다.
- test, typecheck, lint, production build가 통과했다.
- 운영 배포라면 smoke test, 관찰 결과와 rollback 경로를 확인했다.
- 감사 기록에 secret, token, 내부 credential을 남기지 않았다.
