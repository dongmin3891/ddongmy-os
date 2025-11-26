# ddongmy-os

프론트엔드 개발자 천재동민의 개인 포트폴리오 웹사이트 + 홈서버 관제센터

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
│   ├── api/
│   │   ├── server-status/    # 서버 상태 API
│   │   └── docker-status/    # Docker 상태 API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── sections/             # 포트폴리오 섹션 컴포넌트
│   └── widgets/              # 서버 모니터 위젯
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

## 배포

1. Docker 이미지 빌드 및 실행
2. Nginx 설정 파일(`nginx.conf.example`) 참고하여 리버스 프록시 설정
3. 도메인 DNS 설정 (www.ddongmy.com → 서버 IP)

## 주요 기능

- 포트폴리오 섹션 (Hero, About, Projects, Skills, Contact)
- 실시간 서버 상태 모니터링 (CPU, RAM, Uptime)
- Docker 컨테이너 상태 표시
- 반응형 디자인 (데스크톱/모바일)

## 주의사항

- 서버 상태 API는 Linux `/proc` 파일 시스템을 사용합니다
- Docker 상태 API는 Docker 소켓(`/var/run/docker.sock`)에 접근해야 합니다
- 프로덕션 환경에서는 적절한 보안 설정이 필요합니다

