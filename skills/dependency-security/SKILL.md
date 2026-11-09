---
name: dependency-security
description: >
  npm 의존성 보안 권고를 조사하고 실제 설치 버전·프로젝트 노출 조건과 대조해 패치,
  회귀 검증과 감사 기록을 수행할 때 사용한다. Next.js·React 내부 bundle과 transitive
  dependency를 포함한다. 일반 기능 upgrade나 보안과 무관한 dependency 정리에는 사용하지 않는다.
---

# Dependency Security

## 이 스킬의 기준

보안 데이터베이스의 경고 개수를 줄이는 것이 아니라 **설치 버전 → 공식 영향 범위 → 실제
노출 조건 → 안전한 패치 → 회귀 검증 → 운영 확인**을 연결한다. 현재 시점의 권고와 버전은
기억에 의존하지 않고 다시 확인한다.

작업 전 [의존성 보안 점검 Runbook](../../docs/security/dependency-audit-runbook.md)을 끝까지
읽는다. 날짜별 실행 결과는 `docs/security/audits/YYYY-MM-DD.md`에 기록한다.

## 권한과 작업 범위

- 점검·설명 요청은 읽기와 진단만 허용한다. 패키지와 lockfile을 변경하지 않는다.
- 패치 요청은 필요한 의존성 변경과 로컬 검증을 허용하지만 배포 권한까지 포함하지 않는다.
- 운영 배포, 외부 서비스 smoke test와 rollback은 사용자가 명시적으로 요청한 범위에서만 한다.
- 관련 없는 사용자 변경, 생성 파일과 배포 상태를 보존한다.
- audit이나 테스트 실패를 숨기기 위해 보안 검사 기준을 낮추지 않는다.

## 먼저 확인한다

1. package manager, manifest, lockfile과 workspace 구조를 확인한다.
2. 선언 범위와 lockfile·`node_modules`의 실제 버전을 구분한다.
3. Node.js, Next.js, React, React DOM, type package와 lint 설정을 확인한다.
4. App/Pages Router, RSC, Server Actions, cache, image 처리와 HTML/SVG 삽입을 찾는다.
5. Dockerfile, CI, hosting, reverse proxy, replica, health check와 rollback 경로를 확인한다.
6. 작업 트리의 기존 변경과 변경 전 test·typecheck·lint·production build 기준선을 확인한다.

Next.js나 React를 실제로 변경하면 [modern-nextjs](../modern-nextjs/SKILL.md)를 함께 적용하고,
설치된 Next.js의 bundled docs에서 해당 버전의 upgrade·runtime 지침을 확인한다.

## 설치 상태와 audit

기본 확인은 다음을 포함한다.

```bash
npm ls next react react-dom react-server-dom-webpack --all
npm audit
npm audit --omit=dev
```

- audit에 나온 패키지는 `npm ls <name> --all` 또는 `npm explain <name>`으로 유입 경로를
  확인한다.
- `react-server-dom-webpack`이 npm tree에 없더라도 Next.js 내부 compiled RSC bundle과
  Next.js 자체 권고를 확인한다.
- `--omit=dev` 결과와 실제 runtime image 구성을 혼동하지 않는다. Docker가 전체
  `node_modules`를 복사하면 dev dependency도 배포 artifact에 존재한다.
- JSON 원문 전체를 저장소에 남기지 않는다. 날짜별 문서에는 건수, 핵심 경로와 판단을
  요약한다.
- network 제한으로 audit가 실패하면 제한된 결과를 성공으로 보고하지 않고 필요한 연결을
  다시 요청한다.

## 공식 권고와 노출 조건

시점에 따라 변하는 버전·취약점은 공식 1차 출처로 확인한다.

- framework와 package maintainer의 security advisory
- React·Next.js 공식 blog, support policy와 release/upgrade guide
- npm registry의 stable dist-tag

각 권고에 대해 affected versions, patched versions, 공개·수정일, 전제 기능과 배포 조건을
기록한다. 검색 요약이나 `npm audit`의 fix 제안만으로 target을 정하지 않는다.

코드에서는 권고와 관련된 실제 공격 경로를 확인한다.

- App Router와 framework 내부 RSC endpoint
- `'use server'`, Server Actions와 body size
- `'use cache'`, Draft Mode, 사용자별 cache와 SSG/ISR
- `next/image`, `/_next/image`, remote image, SVG와 sharp
- `ImageResponse`, `next/og`, metadata image route
- upstream `Response`를 그대로 전달하는 Route Handler
- Mermaid, sanitizer와 `dangerouslySetInnerHTML`
- Zod 등 외부 입력 검증의 collection·body 상한

기능을 찾지 못한 사실은 노출 가능성을 낮추는 근거이지, 영향 버전의 patch를 생략하는
근거로 사용하지 않는다.

## 패치 결정

- 긴급 보안 수정은 같은 major의 최신 안전 patch를 우선하고 major migration과 분리한다.
- Next.js, React, React DOM, `eslint-config-next`와 type package는 호환 조합으로 결정한다.
- canary·preview·experimental은 공식 권고가 요구하지 않는 한 production target으로 쓰지 않는다.
- 직접 사용하는 runtime dependency를 transitive dev-only 경고보다 우선한다.
- sanitizer나 UI library처럼 major update가 필요한 항목은 framework patch와 별도 diff로
  나누고 해당 기능의 회귀 범위를 명시한다.
- `npm audit fix --force`를 사용하지 않는다. audit가 제시한 downgrade도 현재 framework
  호환성을 확인하지 않고 적용하지 않는다.
- override/resolution은 maintainer가 호환성을 보장하거나 직접 검증할 수 있을 때만 사용하고
  임시 조치임을 기록한다.

## 검증

변경 전과 패치 후에 같은 핵심 검사를 실행해 비교한다.

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

패치 후에는 설치 트리와 audit도 다시 확인한다. 현재 환경 때문에 기본 bundler build를
실행하지 못하고 fallback build만 성공했다면 둘을 구분해 기록한다. fallback 성공을 기본
production build 성공으로 보고하지 않는다.

변경한 경로에 맞춰 다음을 추가한다.

- image/sharp: 원격 이미지, `/_next/image`, SVG와 WebP 변환
- Mermaid/DOMPurify: 정상 diagram, 잘못된 입력 fallback과 삽입된 SVG
- RSC/Next.js: 정적·동적 route, navigation, hydration와 server log
- external input/Zod: 정상 입력, size 상한, 잘못된 입력과 resource exhaustion 경계
- container: production image build, non-root 실행과 `/api/health`

배포가 범위에 포함되면 readiness/liveness, 주요 route, 로그·5xx·latency·resource 사용량과
직전 commit SHA rollback을 확인한다. 자동 검사가 통과해도 실제 배포 전에는 완료 상태를
로컬 검증 완료로만 기록한다.

## 감사 기록

새 점검은 날짜별 문서를 만들고, 기존 점검의 패치를 이어서 수행하면 같은 문서의 상태와
체크리스트를 갱신한다.

반드시 남길 내용:

- 점검 날짜, 대상 commit과 실행 환경
- 선언 범위, 실제 설치 버전과 patch target
- 전체 audit와 production 분류 요약
- 공식 권고 링크와 영향 범위
- 프로젝트의 실제 노출 조건과 판단
- 적용한 변경과 분리·보류한 항목
- test, typecheck, lint, build, container·smoke 결과
- 배포 여부, 운영 관찰, rollback 경로와 남은 위험

secret, token, cookie, 내부 credential, audit JSON 원문은 기록하지 않는다. "수정 완료",
"배포 완료", "운영 확인 완료"를 실제 상태보다 앞서 표시하지 않는다.

## 완료 기준

- [ ] 실제 설치 버전과 공식 영향·수정 범위를 현재 날짜 기준으로 확인했다.
- [ ] 직접·간접·framework 내부 bundle과 runtime image 포함 여부를 구분했다.
- [ ] 실제 코드·설정·배포 조건으로 노출 가능성을 평가했다.
- [ ] 패치 target과 변경 단위, 보류 이유가 명확하다.
- [ ] 관련 test, typecheck, lint와 production build 결과를 기록했다.
- [ ] 패치 후 설치 트리와 audit를 다시 확인했다.
- [ ] 요청 범위에 맞는 container·smoke·운영 검증과 rollback 상태를 구분했다.
- [ ] 날짜별 감사 기록이 실제 결과와 일치한다.
