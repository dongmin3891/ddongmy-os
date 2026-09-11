# ddongmy-os

프론트엔드 개발자 천재동민의 개인 포트폴리오 웹사이트입니다.

- 운영 주소: [https://ddongmy.com](https://ddongmy.com)
- 프로젝트, 기술 스택, 자기소개 및 연락처 제공
- 데스크톱과 모바일을 지원하는 반응형 다크 테마 UI

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| Frontend | Next.js 16.3 (App Router), React 19.3, TypeScript |
| Styling | Tailwind CSS 3, Pretendard |
| Container | Docker, GHCR |
| Deployment | Kubernetes, Argo CD, Traefik Ingress |
| CI/CD | GitHub Actions, GitOps |

## 프로젝트 구조

```text
ddongmy-os/
├── .github/workflows/
│   └── deploy.yml            # 이미지 빌드·푸시 및 배포 매니페스트 갱신
├── app/
│   ├── globals.css           # 전역 스타일
│   ├── layout.tsx            # 루트 레이아웃과 메타데이터
│   └── page.tsx              # 메인 페이지
├── components/
│   ├── sections/             # Hero, About, Projects, Skills, Contact 섹션
│   └── ProjectCard.tsx       # 프로젝트 카드
├── types/
│   └── index.ts              # 공통 TypeScript 타입
├── k8s/
│   ├── deployment.yaml       # 애플리케이션 Deployment
│   ├── service.yaml          # ClusterIP Service
│   └── ingress.yaml          # Traefik Ingress 및 TLS 설정
├── argocd/
│   └── application.yaml      # Argo CD Application
├── Dockerfile                # 프로덕션 이미지 빌드
└── package.json              # 의존성과 npm 스크립트
```

## 로컬 개발

### 요구 사항

- Node.js 22.13 이상
- npm

### 실행 방법

```bash
npm ci
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다. 현재 애플리케이션 실행에 필요한 별도의 환경 변수는 없습니다.

### npm 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 생성 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run typecheck` | TypeScript 타입 검사 |

## Docker 이미지 확인

프로덕션 배포와 동일한 Dockerfile을 로컬에서 확인할 수 있습니다.

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
```

이미지를 push한 뒤 `k8s/deployment.yaml`의 이미지 태그를 commit SHA로 변경하고 저장소에 commit합니다. `k8s/**`만 변경된 push는 워크플로 실행 대상에서 제외되어 배포 commit으로 인한 중복 빌드를 방지합니다.

### CD: Argo CD와 Kubernetes

`argocd/application.yaml`은 `main` 브랜치의 `k8s` 디렉터리를 감시합니다. 자동 동기화, 리소스 정리(`prune`), 상태 복구(`selfHeal`)가 활성화되어 있습니다.

현재 Kubernetes 구성은 다음과 같습니다.

- Deployment: `web-app`, 2 replicas, 컨테이너 포트 `3000`
- Service: `web-service`, ClusterIP `80` → 컨테이너 `3000`
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
| 프로젝트 목록과 상태 | `components/sections/ProjectsSection.tsx` |
| 기술 스택 | `components/sections/SkillsSection.tsx` |
| GitHub와 이메일 | `components/sections/ContactSection.tsx` |
| 페이지 제목과 설명 | `app/layout.tsx` |
