# Next.js 안정 버전과 업그레이드

## 안정 버전 선정

버전 번호를 기억이나 이 문서에 고정하지 않고 작업 시점에 다시 확인한다.

1. npm의 `next` package에서 `latest` dist-tag를 확인한다.
2. Next.js Support Policy에서 Active LTS와 Maintenance LTS를 확인한다.
3. 최근 공식 security advisory가 요구하는 최소 patch를 확인한다.
4. 목표 Next.js의 React와 React DOM 호환 범위를 확인한다.
5. Node.js, TypeScript, browser와 ESLint 최소 요구사항을 확인한다.
6. `@types/react`, `@types/react-dom`과 lockfile 실제 버전을 확인한다.
7. 조회 기준일과 공식 source URL을 결과에 기록한다.

### Target 선택

- 신규 프로젝트: 특별한 제약이 없으면 최신 Active LTS의 최신 stable patch
- 기존 운영 프로젝트: 현재 Maintenance LTS의 보안 상태와 migration 비용을 비교
- 긴급 보안 업데이트: 같은 major의 patched release를 우선하고 major migration과 분리
- canary/preview: 실험 검증용이며 production target으로 자동 선택하지 않음

“최신”과 “가장 안전한 이번 배포 단위”는 다를 수 있다. 목표 버전과 배포 순서를
구분해서 제안한다.

## 현재 상태 표

```md
| 항목 | 선언 범위 | lockfile 실제 버전 | 목표 | 근거 |
| --- | --- | --- | --- | --- |
| Next.js |  |  |  |  |
| React |  |  |  |  |
| React DOM |  |  |  |  |
| Node.js |  |  |  |  |
| TypeScript |  |  |  |  |
| ESLint |  |  |  |  |
```

- manifest의 caret/tilde 범위와 실제 설치 버전을 섞지 않는다.
- Docker base image, CI setup action과 production runtime도 표에 포함한다.
- monorepo는 package별 peer dependency와 overrides/resolutions를 확인한다.

## 변경 영향 조사

### Code

- deprecated 또는 제거된 API
- async request API와 type 변화
- routing, navigation, metadata와 image 동작
- Server/Client boundary
- cache default와 revalidation 의미
- middleware/proxy와 runtime

### Tooling

- default bundler와 custom webpack 설정
- ESLint CLI와 flat config
- type generation과 TypeScript plugin
- test environment와 React testing package
- codemod가 변경하는 파일

### Operations

- Node.js 지원 상태
- Docker base와 native dependency
- standalone/serverless/static output
- environment variable 읽는 시점
- health, readiness와 graceful shutdown
- multi-instance cache 일관성

## 권장 배포 단위

위험을 분리할 가치가 있으면 다음 순서를 사용한다.

```text
지원 중인 Node.js LTS
→ 배포 및 smoke test
→ Next.js·React·type package 호환 조합
→ lint와 codemod migration
→ production build 및 배포
→ 선택적인 새 framework 기능
```

작고 테스트가 충분한 프로젝트에서는 한 변경으로 합칠 수 있다. 변경을 분리하는 비용과
원인 추적의 이점을 함께 판단한다.

## Codemod

- 공식 codemod 명령과 target version을 현재 upgrade guide에서 확인한다.
- 실행 전 working tree와 적용 범위를 확인한다.
- codemod 결과를 자동으로 정답으로 취급하지 않고 diff를 검토한다.
- format 변경과 의미 변경을 가능한 한 분리한다.
- codemod가 해결하지 못한 TODO와 warning을 검색한다.

## 검증

```text
clean install
→ lint
→ typecheck
→ unit/component test
→ production build
→ Docker 또는 target artifact build
→ 주요 route smoke test
→ logs와 health check
```

- authenticated/unauthenticated route를 모두 확인한다.
- static, dynamic, cached와 error route를 대표로 확인한다.
- hydration warning, browser console과 server log를 확인한다.
- rollback image와 이전 manifest가 실제로 사용 가능한지 확인한다.

## 공식 자료

- [Next.js npm](https://www.npmjs.com/package/next?activeTab=versions)
- [Next.js Support Policy](https://nextjs.org/support-policy)
- [Next.js Version 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Node.js Releases](https://nodejs.org/en/about/previous-releases)
