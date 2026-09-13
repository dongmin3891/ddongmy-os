# ddongmy.com Portfolio / Dev Log / Homelab Handoff

## 0. 완료 — 공통 스킬팩과 자동 라우팅

가독성을 최우선으로 하는 React / Next.js 공통 스킬팩 12개를 `skills/`에 구성했다.

| 판단 영역 | 스킬 |
| --- | --- |
| UI 이름·분기·추출 | `readable-ui` |
| API·함수·props 타입 계약 | `readable-contracts` |
| 외부 입력 런타임 검증 | `schema-at-boundary` |
| `fetch`·Axios HTTP 실행 | `http-client` |
| React API·Hook 선택 | `modern-react` |
| Next.js 버전·cache·runtime | `modern-nextjs` |
| App Router 구조·route 조립 | `next-app-router` |
| form·Server Function | `next-forms` |
| client server-state cache | `tanstack-query` |
| client workflow state | `zustand` |
| Tailwind·shadcn/ui·Radix | `tailwind-ui` |
| 테스트 층·mock 경계 | `testing-ui` |

공통 기준은 한곳에 두고, 도구 스킬에는 그 스킬만 읽어도 오용을 막을 금지사항을 남겼다.
타입 계약은 `readable-contracts`, 런타임 검증은 `schema-at-boundary`, HTTP 통신은
`http-client`, client cache는 `tanstack-query`가 담당한다. 모든 도구를 순서대로
도입하지 않고 실제로 바뀌는 층의 스킬만 선택한다.

`tanstack-query`는 inline query → `queryOptions` → custom Hook → key factory 중 필요한
추상화 깊이만 선택한다. 한 호출부의 짧은 inline key는 허용하고, 같은 문자열을 여러
화면에서 반복 조합하는 경우만 금지한다. `zustand`는 원격 원본을 복사하지 않고 client
workflow와 복원할 초안만 소유한다.

App Router 내부 데이터 접근·인가·공개 DTO 기준은 독립 스킬로 늘리지 않고
[`next-app-router/references/data-access.md`](skills/next-app-router/references/data-access.md)에
두었다. 요청 입력을 사용자 신원으로 쓰지 않고, 없음·권한 없음·인프라 오류를 호출자가
구분하며, 변경도 같은 server-only 모듈에서 인가 직후 수행한다.

루트 [`AGENTS.md`](AGENTS.md)는 작업마다 가장 작은 스킬 집합을 선택하고 해당
`SKILL.md`를 먼저 읽도록 지시한다. 필요한 reference만 추가로 읽으며, 사용자가 스킬을
직접 지정하면 그 선택을 우선한다.

현재 스킬팩은 닫힌 상태다. `data-access-layer`는 위 reference가 커질 때까지 승격하지
않고, `auth-session`은 인증·인가 판단이 여러 프로젝트에서 반복될 때, `accessible-ui`는
combobox·tabs·tree 같은 복합 위젯이 반복될 때 추가한다.

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

- Next.js `16.3.4`
- React `19.3.0`
- Node.js `22`

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

`개발 노트` Notion workspace에 Database를 생성했고, 사이트에 먼저 표시한 초안 3개를
`Published = false`로 등록했다. 웹 애플리케이션은 MCP 연결과 별개의 Notion Integration을
사용한다.

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
Next.js     16.3.4
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

### 다음 운영 지표 경계

`/lab`은 Kubernetes API를 직접 넓게 조회하지 않는다. 서버 지표와 Kubernetes 상태를
서로 다른 내부 소스에서 받아 공개 모델로 줄인다.

```text
Linux / K3s
  → Netdata
  → server-only data access
  → /lab

Kubernetes API
  → status-exporter
  → ClusterIP Service
  → server-only data access
  → /lab
```

Netdata에서는 CPU, memory, root disk, temperature와 uptime만 읽는다. 원본 chart,
host 주소와 내부 식별자는 Browser에 전달하지 않는다. Temperature는 센서가 없거나 값을
읽지 못할 수 있으므로 `null`을 허용하며, 일부 지표 누락을 전체 장애로 바꾸지 않는다.

두 소스의 공개 결과는 같은 상태 형태를 사용한다. 확인 시각은 항상 `checkedAt`으로,
실제 관찰 시각을 알 수 있을 때만 `observedAt`으로 표현한다.

```ts
type HomelabStatus<T> =
  | {
      status: 'available'
      checkedAt: string
      observedAt: string
      data: T
    }
  | {
      status: 'unavailable'
      checkedAt: string
    }
```

`status-exporter`는 내부에서 `namespace + kind + name`으로 지정한 Deployment 또는
StatefulSet만 조회하고 `webApp`, `argoCd`, `traefik` 같은 안정적인 공개 key로 변환한다.
초기에는 전체 Pod 수를 제공하지 않으며 cluster-wide `list pods` 권한도 부여하지 않는다.
Secret, ConfigMap, Pod log·exec와 create·update·patch·delete 권한은 항상 제외한다.

exporter는 외부 Ingress 없이 ClusterIP로만 제공하고 NetworkPolicy가 활성화된 환경에서는
`ddongmy-os`에서만 접근하게 한다. 운영 검증을 마친 뒤 기존 `web-app-status`
Role·RoleBinding을 제거했고, `web-app`에는 `automountServiceAccountToken: false`를
적용했다.

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

`status-exporter` ServiceAccount에만 `web-app` Deployment 하나를 `get`하는 권한을
부여한다. exporter가 Kubernetes 응답을 공개 모델로 줄이고, 애플리케이션은 그 응답을
다시 검증한다.

```text
Kubernetes
  ↓
status-exporter
  ↓
ClusterIP
  ↓
homelab-status
  ↓
sanitized JSON
  ↓
ddongmy.com
```

RBAC 역시 최소 권한만 부여한다.

---

## 9. 재미 요소

사이트 Footer와 `/lab`에 실제 운영 정보를 작게 노출한다.

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

### Phase 0 — 완료

0절의 공통 스킬팩 12개, App Router data-access reference와 `AGENTS.md` 라우팅을
추가하고 문서 구조·상대 링크·TypeScript 예시를 검증했다.

### Phase 1 — 완료

사이트 IA와 기본 route shell을 구현했다.

- `(site)` route group의 공통 Header, Footer, skip link
- `/`, `/projects`, `/log`, `/log/[slug]`, `/lab`, `/about`
- 프로젝트와 개발 로그를 각각 `features/` 아래에 둔 기본 데이터 경계
- 존재하지 않는 개발 로그의 404와 초안 페이지의 `noindex`

### Phase 2 — 완료

Notion `Development Log` Database와 초기 초안 3개를 만들었다.

### Phase 3 — 완료

- `/log`는 `Published = true`인 글만 조회한다.
- `/log/[slug]`는 검증된 slug로 공개 글과 Notion Markdown 본문을 조회한다.
- 외부 응답은 Zod로 검증하고 Notion 전용 server-only 모듈에서 공개 모델로 변환한다.
- API 오류와 불완전하거나 중복된 공개 글을 빈 값으로 숨기지 않는다.

### Phase 4 — 구현 완료

- `/sitemap.xml`에 정적 route와 Notion 공개 글만 포함한다.
- `/robots.txt`에서 공개 페이지를 허용하고 `/api/` 크롤링을 막는다.
- 홈과 글 상세에 canonical, Open Graph와 Twitter metadata를 제공한다.
- 공개 글 상세에 Article JSON-LD를 제공한다.
- sitemap은 운영 Pod의 Notion Secret을 사용하도록 request time에 생성하며, 외부 응답은
  검증한 공개 모델로 변환한 뒤 사용한다.

### Phase 5 — 기본 페이지 완료

`/projects` 목록을 구현했다. 상세 case study는 프로젝트 콘텐츠가 준비될 때 확장한다.

### Phase 6 — 기본 페이지 완료

`/lab` 기본 페이지를 구현했다. 공개 가능한 실제 운영 데이터 연결은 Phase 7에서 진행한다.

### Phase 7 — 운영 검증 완료

- `web-app` Deployment 하나만 조회하는 ServiceAccount, Role과 RoleBinding을 추가했다.
- `/api/server-status`는 준비된 replica 수, 목표 replica 수, release SHA, 배포 시각과
  확인 시각만 반환한다.
- `/lab`은 실제 상태와 release를 서버에서 표시한다.
- Footer는 작은 client 배지로 공개 상태 API를 한 번 조회한다.
- Kubernetes 조회 실패는 내부 정보를 노출하지 않고 `unavailable`로 표시한다.
- 운영에서 `2/2` 상태와 release SHA를 확인했다.
- `kubectl auth can-i`로 `web-app` Deployment 단건 조회만 허용되고 Secret, Pod와 전체
  Deployment 조회는 거부되는 것을 확인했다.

### Phase 8 — 구현 완료

- 현재 Kubernetes release와 검증된 주요 배포를 함께 보여주는 Deployment History
- 증상·실제 원인·해결과 상세 개발 로그를 연결하는 Incident Log
- 운영 문제와 구조 변경을 시간순으로 보여주는 Homelab Changelog
- 추가 Kubernetes 권한이나 외부 API 없이 공개 가능한 정적 기록과 기존 상태 응답만 사용

### Phase 9 — 등록 완료, 관찰 중

- Google Search Console에서 `ddongmy.com` 소유권을 확인했다.
- `/sitemap.xml` 제출이 처리됐고 13개 페이지가 발견됐다.
- `/`, `/log`, `/lab`의 색인 생성을 요청했다.
- 실제 색인과 검색 유입은 Search Console에서 계속 관찰한다.

### Phase 10 — 완료

Netdata 서버 지표를 `/lab`에 연결했다.

- CPU usage
- memory usage
- root disk usage
- temperature 또는 `null`
- uptime
- server-only HTTP 요청, 외부 응답 검증과 공개 DTO 변환
- 60초 갱신 정책과 source별 `unavailable` 처리
- Pod의 `status.hostIP`로 외부에 공개되지 않은 Netdata Agent에 접근
- 원본 응답과 내부 주소를 Browser에 전달하지 않는 서버 리소스 패널

실행 중인 `web-app` Pod에서 Netdata `/api/v1/info`가 HTTP 200으로 응답하는 것을 확인했다.
배포 후 CPU, memory, root disk와 uptime의 실제 chart 응답을 확인한다. Temperature chart ID는
장비별로 다르며 현재 홈서버의 CPU package 온도는
`sensors.temperature_coretemp-isa-0000_temp1_Package_id_0_input`을 사용한다. Root disk
chart ID는 `disk_space./`이며 `NETDATA_ROOT_DISK_CHART`로 지정한다.
운영 `/lab`에서 CPU, memory, root disk, temperature와 uptime 표시를 확인했다.

### Phase 11 — 완료

기존 `web-app-status` 직접 Kubernetes 조회를 별도 `status-exporter`로 이전했다.

1. exporter 전용 ServiceAccount와 선택 resource의 `get`만 허용하는 최소 RBAC
2. Deployment·StatefulSet을 안정적인 공개 workload 모델로 변환
3. ClusterIP와 NetworkPolicy 검증
4. `ddongmy-os`가 exporter 응답을 검증해 `/lab`에 표시
5. 운영 상태 확인 후 기존 `web-app-status` Role·RoleBinding 제거
6. `web-app`에 `automountServiceAccountToken: false` 적용

전체 Pod 집계와 `list pods` 권한은 실제 표시 가치가 확인될 때까지 추가하지 않는다.

`services/status-exporter`에 Node 표준 HTTP 기반 exporter를 추가했다. 현재는 `default`
namespace의 `web-app` Deployment만 이름을 지정한 `get` 권한으로 읽으며 `/status`에는
`webApp` 공개 key, replica 상태, release SHA와 배포 시각만 반환한다. 전용
ServiceAccount·Role·RoleBinding, ClusterIP Service와 `app=web` Pod만 허용하는 ingress
NetworkPolicy도 `k8s/status-exporter.yaml`에 정의했다.

운영에서 exporter Deployment·Service, 최소 RBAC, ClusterIP 응답과 `/lab` 표시를
확인했다. 기존 `k8s/status-rbac.yaml`과 Kubernetes 직접 조회 코드를 제거했으며,
`web-app`은 `automountServiceAccountToken: false`로 실행한다. Kubernetes API 권한과
ServiceAccount token은 exporter에만 남아 있다.

### 보류 — 방문자와 조회수

전체 방문자, 오늘 방문자, 전체 조회수와 글별 조회수는 이번 운영 지표 작업에서 제외한다.
나중에 구현할 때는 Pod 메모리·파일·SQLite를 사용하지 않고 중앙 PostgreSQL을 사용한다.
익명 방문자와 유효 page view를 저장해 5분 중복을 DB 제약으로 막고, 필요해질 때만
일별 집계나 Redis를 추가한다. Server Component는 같은 앱의 GET API를 다시 호출하지 않고
server-only data-access 함수로 요약과 글별 조회수를 배치 조회한다.

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

Next.js와 React 안정 버전 업그레이드, 기본 사이트 구조, Notion 공개 글, SEO,
Homelab 운영 기록과 Search Console 등록까지 완료했다. 다음 작업을 시작하면 루트
`AGENTS.md`에 따라 필요한 스킬만 선택해 읽는다.

1. exporter와 Netdata 장애 로그 및 `/lab` fallback을 운영에서 관찰한다.
2. Argo CD·Traefik 상태가 실제로 공개할 가치가 생기면 정확한 kind·namespace·name을 확인한
   뒤 대상별 `get` 권한과 공개 key를 추가한다.
3. Search Console에서 색인과 검색 유입을 계속 관찰한다.
