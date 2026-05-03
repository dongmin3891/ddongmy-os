# ddongmy-os

프론트엔드 개발자 천재동민의 개인 포트폴리오 웹사이트

## 기술 스택

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Docker
- Nginx

## 프로젝트 구조

```
ddongmy-os/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── sections/             # 포트폴리오 섹션 컴포넌트
├── types/
│   └── index.ts              # TypeScript 타입 정의
├── Dockerfile
├── docker-compose.yml
└── nginx.conf.example
```

## 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## Docker로 실행

```bash
# 빌드 및 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

## CI/CD

`main` 브랜치에 push하면 GitHub Actions가 빌드를 확인한 뒤 서버에 SSH로 접속해 Docker Compose로 재배포합니다.

GitHub 저장소의 `Settings > Secrets and variables > Actions`에 아래 Secrets를 등록해야 합니다.

- `DEPLOY_HOST`: 배포 서버 IP 또는 도메인
- `DEPLOY_USER`: SSH 접속 사용자
- `DEPLOY_SSH_KEY`: 서버 접속용 private key
- `DEPLOY_PATH`: 서버에서 이 repo가 위치한 절대 경로
- `DEPLOY_PORT`: SSH 포트, 생략 시 `22`

## 배포

1. Docker 이미지 빌드 및 실행
2. Nginx 설정 파일(`nginx.conf.example`) 참고하여 리버스 프록시 설정
3. 도메인 DNS 설정 (www.ddongmy.com → 서버 IP)

## 주요 기능

- 포트폴리오 섹션 (Hero, About, Projects, Skills, Contact)
- 반응형 디자인 (데스크톱/모바일)

## 주의사항

- 프로덕션 환경에서는 적절한 보안 설정이 필요합니다
