# ddongmy.com Portfolio / Dev Log / Homelab Handoff

## 0. 최우선 작업 — 공통 스킬 2개 추가

**다음 작업자는 사이트 설계·구현과 Notion API 연동보다 먼저 아래 두 스킬을 `skills/`에 추가한다.**
현재는 추가 예정이며, 기존 스킬팩을 보강하는 첫 작업이다.

1. `skills/readable-contracts/SKILL.md`
   - API 요청·응답, 함수 입력·결과와 컴포넌트 props의 계약을 읽기 쉽게 설계하는 기준을 담는다.
   - 용도가 드러나는 이름, 요청·응답·편집 초안의 구분, 필수·생략·`null`의 의미,
     성공·실패 상태 표현과 계약 원본의 단일화를 다룬다.
   - `type` / `interface`는 기존 프로젝트 규칙을 우선하고, 과도한 generic·utility type보다
     사용처에서 바로 이해할 수 있는 표현을 선택한다.
2. `skills/http-client/SKILL.md`
   - `fetch` / Axios 기반 요청 실행, 응답 처리와 통신 실패 전달의 공통 기준을 담는다.
   - 기존 도구 우선, 의도가 드러나는 도메인 요청 함수, 공통 client의 책임, 오류 구분,
     취소·timeout·재시도 소유자, interceptor와 서버·브라우저 경계를 다룬다.
   - `fetch`와 Axios를 별도 스킬로 늘리지 않고 도구별 차이·예시는 `references/`로 분리한다.

두 스킬 모두 **가독성을 최우선**으로 하고 다른 프로젝트에도 공통으로 사용할 수 있게 작성한다.
특정 framework, validator, 폴더 구조나 응답 envelope를 일괄 강제하지 않는다.
공통화는 실제로 반복되는 책임에만 적용하고 의미 없는 타입·wrapper·계층을 늘리지 않는다.

역할 경계는 `readable-contracts`가 계약 설계, `http-client`가 통신 실행,
[schema-at-boundary](skills/schema-at-boundary/SKILL.md)가 런타임 검증,
[tanstack-query](skills/tanstack-query/SKILL.md)가 client cache·갱신·구독을 담당하도록 유지한다.
기존 스킬에는 선택이 갈리는 위치에만 링크를 연결하고, 각 도구의 오용 방지 규칙은 유지한다.
완료 시 스킬 형식·상대 링크·추가한 코드 예시를 검증한 뒤 아래 사이트 작업으로 진행한다.

---

## 1. 프로젝트 목표

`ddongmy.com`을 단순 개인 홈페이지가 아니라 아래 3가지 역할을 동시에 하는 사이트로 만든다.

1. Frontend Developer 포트폴리오
2. 검색엔진에 노출되는 개발 블로그 / 개발 회고
3. 실제 홈서버 운영 상태를 보여주는 Homelab 페이지

핵심 컨셉:

> 지금 보고 있는 이 사이트 자체가 내가 직접 구축하고 운영하는 홈서버에서 실행되고 있다.

단순히 Kubernetes / Argo CD 등을 사용했다고 적는 것이 아니라, 사이트 자체를 실제 운영 결과물로 보여준다.

---

## 2. 현재 서비스 / 인프라

### Repository

- `dongmin3891/ddongmy-os`

### Application

- Next.js
- 현재 런타임: `15.5.25`

### Infrastructure

```text
Internet
  ↓
ddongmy.com
  ↓
Home Server
  ↓
K3s
  ↓
Traefik
  ↓
Ingress
  ↓
Service
  ↓
web-app Deployment
  ↓
Next.js
```

### Deployment

```text
main push
  ↓
GitHub Actions
  ↓
Docker Build
  ↓
GHCR
  ↓
같은 ddongmy-os repository의 k8s manifest image SHA 갱신
  ↓
Argo CD
  ↓
K3s rollout
```

중요:

- 아직 별도의 GitOps repository는 만들지 않았다.
- application source와 `k8s` manifest가 `ddongmy-os` repository에 같이 존재한다.

---

## 3. 사이트 정보 구조

```text
/
├── Home
├── /projects
├── /log
│   └── /log/[slug]
├── /lab
└── /about
```

### `/`

Home

- Developer Introduction
- Featured Projects
- Latest Development Logs
- Home Lab Live Status

### `/projects`

Portfolio

대표 프로젝트 예:

- U+tv모바일
- U+모아tv
- U+ ITGO
- next-manual-scroll-restoration
- Home Server Lab

프로젝트 페이지는 단순 기술 나열이 아니라 아래 흐름 중심으로 구성한다.

```text
문제
→ 역할
→ 해결
→ 결과
```

### `/log`

Development Log / 개발 블로그

- 개발 회고
- 장애 분석
- 기술 선택 과정
- 문제 해결 기록

각 게시글은 독립적인 URL을 가진다.

예:

```text
/log/kubernetes-oomkilled
/log/argocd-web-terminal
/log/cloudflare-access-oidc
```

### `/log/[slug]`

검색엔진에서 직접 유입될 수 있는 실제 게시글 페이지.

### `/lab`

실제 홈서버 운영 상태와 구조를 보여주는 페이지.

### `/about`

- 경력
- 기술
- GitHub
- Contact

---

## 4. Development Log CMS

자체 에디터는 만들지 않는다.

Notion을 Headless CMS처럼 사용한다.

### 작성

```text
사용자
  ↓
ChatGPT 등으로 회고 작성
  ↓
Notion
```

### 공개

```text
ddongmy.com
  ↓
Next.js Server
  ↓
Notion API
  ↓
Notion 글 조회
  ↓
HTML 렌더링
```

Notion 수정 후 별도 배포가 없어도 다음 페이지 요청에서 최신 내용을 가져올 수 있게 한다.

초기에는 webhook까지 구현하지 않는다.

Notion API는 반드시 Server Side에서 호출하고 Notion Integration Token을 Browser에 노출하지 않는다.

---

## 5. Notion Database

`Development Log` Database를 만든다.

필드 예:

- `Title`
- `Slug`
- `Summary`
- `Series`
- `Order`
- `Tags`
- `Published`
- `PublishedAt`
- `SEO Title`
- `SEO Description`

`Published = true` 게시글만 사이트에 공개한다.

현재 작성되어 있는 주요 Home Server 회고는 8편이다.

1. 공유기부터 HTTPS까지
2. Docker 운영
3. Docker → K3s / Traefik
4. GHCR / GitOps
5. Deployment 운영 안정화
6. Argo CD Web Terminal / RBAC
7. Cloudflare Tunnel / Access / Google OIDC
8. OOMKilled / 비정상 프로세스 / 보안 패치 / Runtime Memory

---

## 6. SEO

개발 블로그의 중요한 목적 중 하나는 Google / Naver 검색을 통한 외부 유입이다.

반드시 고려:

- Server-rendered HTML
- `generateMetadata`
- title
- description
- canonical
- Open Graph
- `sitemap.xml`
- `robots.txt`
- Article structured data
- semantic heading structure
- 안정적인 slug URL

추후:

- Google Search Console
- Naver Search Advisor

등록.

---

## 7. Home Lab 페이지

`/lab`은 이 사이트의 차별점으로 만든다.

예:

```text
ddongmy Home Lab

🟢 All systems operational

Web          2 / 2 Ready
K3s          Healthy
Release      294a574
Last deploy  18m ago
```

### How this page reached you

```text
You
  ↓
Internet
  ↓
Home Network
  ↓
K3s
  ↓
Traefik
  ↓
Ingress
  ↓
Service
  ↓
Next.js Pod
```

### This request was served by

```text
Instance    web-2
Release     294a574
Next.js     15.5.25
Response    42ms
```

### Recent Deployments

최근 Git SHA / 배포 시간 / 배포 성공 여부를 보여준다.

### Homelab Changelog

홈서버 인프라 진화 과정을 타임라인으로 보여준다.

```text
Docker + Nginx
  ↓
K3s
  ↓
Traefik
  ↓
GHCR
  ↓
GitHub Actions
  ↓
Argo CD
  ↓
Cloudflare Tunnel / Access
  ↓
Google OIDC
  ↓
Runtime / Security Monitoring
```

### Incident Log

실제로 발생한 장애를 보여준다.

예:

```text
OOMKilled

Symptom:
Pod 반복 restart

Initial hypothesis:
Next.js memory leak

Actual evidence:
컨테이너 내부 비정상 프로세스가 약 300~380MiB 메모리를 사용하며
512MiB cgroup memory limit 초과

Resolution:
Next.js security patch
clean image rebuild
Pod replacement
```

관련 Development Log로 연결한다.

---

## 8. 공개 운영 데이터 보안

웹 애플리케이션에 Kubernetes 관리자 권한을 주지 않는다.

외부 공개 가능한 데이터만 가공해서 노출한다.

### 공개 가능 예

- Healthy / Unhealthy
- `2 / 2` replicas
- CPU / Memory를 가공한 값
- uptime
- release commit
- deployment age
- Next.js version

### 공개 금지

- Kubernetes API endpoint
- 내부 IP
- 실제 Pod UID
- ServiceAccount token
- Secret
- 환경변수
- SSH 정보
- 민감한 Node 정보

향후 필요하면 별도의 read-only 서비스를 고려한다.

```text
Kubernetes
  ↓
homelab-status
  ↓
sanitiized JSON
  ↓
ddongmy.com
```

RBAC 역시 최소 권한만 부여한다.

---

## 9. 재미 요소

사이트 Footer에 실제 운영 정보를 작게 노출하는 것을 고려한다.

예:

```text
Built with Next.js
Running on K3s in my home 🏠
Release 294a574 · deployed 2h ago
🟢 2/2 replicas healthy
```

또는:

> This site is running on my home server.

Home 페이지에서도 `/lab`으로 자연스럽게 연결한다.

---

## 10. 현재 하지 않을 것

현재 단계에서는 아래를 만들지 않는다.

- 자체 블로그 Editor
- 별도 CMS
- MCP Server
- 불필요한 Grafana / Prometheus 추가
- 기술을 보여주기 위한 목적만의 인프라 추가

필요성이 생겼을 때 확장한다.

MCP Server는 나중에 아래 데이터를 AI가 조회 / 조작하게 만드는 확장 프로젝트로 고려한다.

- Notion
- GitHub
- Kubernetes
- Runtime Metrics
- Portfolio

---

## 11. 개발 우선순위

### Phase 0 — 최우선

0절의 `readable-contracts`와 `http-client` 스킬 추가 및 검증.
두 스킬을 먼저 완성한 뒤 Phase 1부터 진행한다.

### Phase 1

사이트 IA 및 기본 디자인

### Phase 2

Notion Development Log Database

### Phase 3

- `/log`
- `/log/[slug]`
- Notion API 연결

### Phase 4

SEO

- sitemap
- robots
- metadata

### Phase 5

`/projects`

### Phase 6

`/lab` 기본 페이지

### Phase 7

실제 Homelab 상태 데이터 연결

### Phase 8

Deployment History / Incident / Changelog

### Phase 9

Search Console 등록 및 실제 검색 노출 확인

---

## 12. 개발 원칙

- 기존 `ddongmy.com` 운영을 깨지 않는다.
- 한 번에 전체 구조를 갈아엎지 않는다.
- 작은 단위로 구현하고 배포 후 검증한다.
- 모바일 대응한다.
- SEO를 처음부터 고려한다.
- 공개 사이트 성능을 우선한다.
- Notion API Secret 및 운영 인프라 정보를 Browser에 노출하지 않는다.
- Homelab 기능을 위해 `web-app`에 과도한 Kubernetes 권한을 부여하지 않는다.
- 디자인보다 먼저 정보 구조와 데이터 모델을 확정한다.

---

## 13. 다음 작업

**첫 작업은 0절의 `readable-contracts`와 `http-client` 스킬 추가다.**

두 스킬을 추가·검증한 뒤 사이트 작업을 시작한다. 사이트 작업은 Notion API 연동에 앞서
현재 `ddongmy-os` 프로젝트 구조를 분석하고 기존 기능을 유지한 상태에서 아래 라우트와
공통 컴포넌트 구조를 설계한다.

```text
/
/projects
/log
/log/[slug]
/lab
/about
```

사이트 애플리케이션 코드는 아직 수정하지 않고 먼저 구조 / 컴포넌트 / 데이터 흐름을 제안한다.

설계가 확정되면 별도 작업 브랜치에서 작은 단위로 구현한다.
