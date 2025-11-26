# 1. 공통 베이스 이미지
FROM node:20-alpine AS base

# Alpine에서 필요한 기본 패키지 설치
# - libc6-compat : 일부 Node/native 모듈 호환성
# - docker-cli   : 컨테이너 안에서 `docker ps` 실행용
RUN apk add --no-cache libc6-compat docker-cli

WORKDIR /app

# 2. 의존성 설치 단계
FROM base AS deps

# package-lock.json이 있으면 같이 복사
COPY package.json package-lock.json* ./

# devDependencies까지 포함해서 설치 (Next.js 빌드에 필요)
RUN npm ci

# 3. 빌드 단계
FROM base AS builder

WORKDIR /app

# node_modules 복사
COPY --from=deps /app/node_modules ./node_modules

# 나머지 소스 전체 복사
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js 프로덕션 빌드
RUN npm run build

# 4. 실행 단계
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# 실행에 필요한 파일들만 복사
COPY --from=builder /app/package.json package-lock.json* ./
COPY --from=builder /app/.next ./.next
COPY --from=deps    /app/node_modules ./node_modules

# (선택) non-root 유저로 실행하고 싶으면 여기에 추가
# RUN addgroup -g 1001 nodejs && adduser -S -u 1001 nextjs
# USER nextjs

EXPOSE 3000

# package.json 에 "start": "next start" 가 있다고 가정
CMD ["npm", "start"]
