# ddongmy-os

프론트엔드 개발자 천재동민의 개인 포트폴리오 웹사이트입니다.

- 운영 주소: [https://ddongmy.com](https://ddongmy.com)
- 프로젝트, 개발 로그, 홈랩의 실제 상태와 운영 기록 제공
- 데스크톱과 모바일을 지원하는 반응형 다크 테마 UI

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| Frontend | Next.js 16.4 (App Router), React 19.3, TypeScript |
| Styling | Tailwind CSS 3, Pretendard |
| Content | Notion API, React Markdown, Zod |
| Container | Docker, GHCR |
| Deployment | Kubernetes, Argo CD, Traefik Ingress |
| CI/CD | GitHub Actions, GitOps |

## 프로젝트 구조

```text
ddongmy-os/
├── .github/workflows/
│   └── deploy.yml            # 이미지 빌드·푸시 및 배포 매니페스트 갱신
├── app/
│   ├── (site)/               # 공통 헤더·푸터를 사용하는 공개 페이지
│   │   ├── log/[slug]/       # 개발 로그 상세
│   │   ├── about/            # 소개
│   │   ├── lab/              # 홈서버 상태, 리소스 이력과 Deploy Timeline
│   │   └── projects/         # 프로젝트 목록
│   ├── api/health/           # 컨테이너 health check
│   ├── api/deployment-status/# 현재 배포의 Argo CD·Pod Ready 상태
│   ├── api/server-status/    # 공개 가능한 Homelab 상태 JSON
│   ├── globals.css           # 전역 스타일
│   └── layout.tsx            # 루트 레이아웃과 기본 메타데이터
├── components/
│   ├── sections/             # Hero, About, Projects, Skills, Contact 섹션
│   └── site/                 # 사이트 공통 Header, Footer, PageIntro
├── features/
│   ├── development-log/      # 개발 로그 모델·데이터·목록 UI
│   ├── homelab/              # Kubernetes 상태 조회·공개 모델·UI
│   └── projects/             # 프로젝트 모델·데이터·카드 UI
├── data/homelab/
│   └── deployment-history.json # 단계별 배포 시간과 상태 기록
├── k8s/
│   ├── deployment.yaml       # 애플리케이션 Deployment
│   ├── status-exporter.yaml  # 상태 exporter와 최소 read-only 권한
│   ├── service.yaml          # ClusterIP Service
│   └── ingress.yaml          # Traefik Ingress 및 TLS 설정
├── argocd/
│   └── application.yaml      # Argo CD Application
├── Dockerfile                # 프로덕션 이미지 빌드
└── package.json              # 의존성과 npm 스크립트
```

## 로컬 개발

### 요구 사항

- Node.js `22.23.4`
- npm `10.9.9` (`22.23.4`에 포함)
- nvm 사용 권장

### 실행 방법

```bash
nvm install
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

`.nvmrc`, `package.json`의 `engines`·`packageManager`, Docker base image와 GitHub Actions가
같은 Node.js·npm 조합을 사용합니다. `.npmrc`의 `engine-strict=true` 설정으로 지정한 버전과
다른 Node.js·npm에서 의존성을 설치하면 즉시 실패합니다.

일반적인 동기화와 CI에서는 lockfile을 변경하지 않는 `npm ci`를 사용합니다. 새 패키지를
추가하거나 버전을 변경할 때만 `npm install <package>`을 사용하고, 변경된 `package.json`과
`package-lock.json`을 함께 커밋합니다.

Node.js 보안 패치를 올릴 때는 `.nvmrc`, `package.json`의 `engines`·`packageManager`,
루트 `Dockerfile`과 `services/status-exporter/Dockerfile`을 같은 버전으로 변경합니다. 이후
`npm ci`, `npm run check`, `npm run build`와 Docker 이미지 빌드를 모두 통과시켜 로컬·CI·운영
환경의 차이를 막습니다.

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다. Notion의 공개
개발 로그를 확인하려면 `.env.example`을 참고해 `.env.local`에 server-only 환경 변수를
등록합니다. 환경 변수가 없으면 저장소의 개발 로그 초안을 표시합니다.

### npm 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 생성 |
| `npm run build:traffic-backfill` | 운영 이미지용 트래픽 백필 실행 파일 생성 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run check` | 테스트·타입 검사·lint 순차 실행 |
| `npm run test:e2e` | Chromium에서 Playwright 브라우저 회귀 테스트 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run typecheck` | TypeScript 타입 검사 |

## 의존성 보안 점검

Next.js·React와 npm 의존성은 설치 버전 확인, 공식 보안 권고 대조, 코드 노출 조건 분석,
회귀 테스트, 운영 배포와 rollback 순서로 점검합니다.

- [의존성 보안 점검 Runbook](docs/security/dependency-audit-runbook.md)
- [2026-11-09 Next.js 의존성 보안 감사](docs/security/audits/2026-11-09.md)

## Docker 이미지 확인

프로덕션 배포와 동일한 Dockerfile을 로컬에서 확인할 수 있습니다.
최종 이미지는 전체 `node_modules` 대신 Next.js standalone 산출물과 정적 자산만 포함합니다.
트래픽 백필 Job은 빌드 단계에서 만든 `scripts/backfill-site-traffic.cjs`를 실행하므로
운영 이미지에 TypeScript·`tsx`가 필요하지 않습니다.

```bash
docker build -t ddongmy-os:local .
docker run --rm -p 3002:3000 ddongmy-os:local
```

실행 후 [http://localhost:3002](http://localhost:3002)으로 접속합니다.

## 배포 구조

```text
main 브랜치 push
  → GitHub Actions가 Docker 이미지 빌드
  → GHCR에 latest 및 commit SHA 태그로 push
  → k8s/deployment.yaml의 이미지 태그를 commit SHA로 갱신
  → GitHub Actions가 변경된 매니페스트를 main에 commit
  → Argo CD가 k8s 디렉터리 변경 감지 및 자동 동기화
  → Kubernetes Deployment 롤링 업데이트
  → Traefik Ingress를 통해 ddongmy.com 서비스
```

### CI: GitHub Actions

`.github/workflows/deploy.yml`은 다음 경우 실행됩니다.

- `k8s/**`만 변경된 경우를 제외하고 `main` 브랜치에 push된 경우
- GitHub Actions에서 `workflow_dispatch`로 수동 실행한 경우

워크플로는 GitHub 기본 `GITHUB_TOKEN`으로 GHCR에 로그인하고, 아래 이미지 태그를 push합니다.

```text
ghcr.io/dongmin3891/ddongmy-os:latest
ghcr.io/dongmin3891/ddongmy-os:<commit-sha>
ghcr.io/dongmin3891/ddongmy-os:status-exporter-latest
ghcr.io/dongmin3891/ddongmy-os:status-exporter-<commit-sha>
```

이미지를 push한 뒤 웹앱과 status-exporter manifest의 이미지 태그를 commit SHA로 변경하고
저장소에 commit합니다. `k8s/**`와 `data/homelab/deployment-history.json`만 변경된 push는
실행 대상에서 제외되어 배포 기록 commit으로 인한 중복 빌드를 방지합니다.

워크플로는 GitHub Push, GitHub Actions와 GHCR 단계 시간을 직접 기록합니다. 매니페스트
commit 뒤 `/api/deployment-status`를 polling해 status-exporter가 읽은 Argo CD operation과
현재 이미지의 K3s Pod Ready 시간을 합친 뒤 `data/homelab/deployment-history.json`에
90일 동안 보존합니다. `/lab`은 이 기록을 Deploy Timeline과 Netdata 그래프의 배포 마커로
표시합니다. 기능 도입 전 기록에는 당시 저장되지 않았던 단계가 `수집 전`으로 표시됩니다.
CPU, Memory, Disk, 온도 시계열은 별도 DB에 복제하지 않고 기존 Netdata 보존 데이터를
조회합니다.

### CD: Argo CD와 Kubernetes

`argocd/application.yaml`은 `main` 브랜치의 `k8s` 디렉터리를 감시합니다. 자동 동기화, 리소스 정리(`prune`), 상태 복구(`selfHeal`)가 활성화되어 있습니다.

현재 Kubernetes 구성은 다음과 같습니다.

- Deployment: `web-app`, 2 replicas, 컨테이너 포트 `3000`
- Deployment: `status-exporter`, 지정된 workload 상태만 공개
- ServiceAccount: `status-exporter`, `web-app` Deployment 조회, Pod 목록 조회, 이름이
  `ddongmy-os`인 Argo CD Application 조회만 허용
- `web-app`에는 Kubernetes ServiceAccount token을 mount하지 않음
- Service: `web-service`, ClusterIP `80` → 컨테이너 `3000`
- Service: `status-exporter`, ClusterIP `8080`
- Ingress: Traefik, 호스트 `ddongmy.com`
- TLS Secret: `ddongmy-tls`

최초 연결 시 Argo CD가 설치된 클러스터에서 Application을 등록합니다.

```bash
kubectl apply -f argocd/application.yaml
```

클러스터에는 Traefik Ingress Controller와 `ddongmy-tls` Secret이 준비되어 있어야 합니다. GHCR 패키지가 비공개라면 클러스터에 이미지 pull 인증 정보도 별도로 설정해야 합니다.

## 포트폴리오 내용 수정

| 수정 대상 | 파일 |
| --- | --- |
| 이름, 소개 문구, 바로가기 | `components/sections/HeroSection.tsx` |
| 자기소개와 키워드 | `components/sections/AboutSection.tsx` |
| 프로젝트 목록과 상태 | `features/projects/projects.ts` |
| 개발 로그 글과 공개 여부 | Notion `Development Log` Database |
| 개발 로그 임시 초안 | `features/development-log/development-logs.ts` |
| 기술 스택 | `components/sections/SkillsSection.tsx` |
| GitHub와 이메일 | `components/sections/ContactSection.tsx` |
| 공통 내비게이션과 Footer | `components/site/` |
| 페이지 제목과 설명 | `app/layout.tsx` |
