# 1. 공통 베이스 이미지
FROM node:20-alpine AS base

# Alpine에서 필요한 기본 패키지 설치
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 2. 의존성 설치 단계
FROM base AS deps

# package-lock.json이 있으면 같이 복사
COPY package.json package-lock.json* ./

# lockfile 기준 설치 후, 보안 패치된 Next.js 버전으로 덮어쓴다.
# package-lock.json 정식 갱신 전까지 사용하는 긴급 패치이며 image에는 15.5.25가 설치된다.
RUN npm ci \
  && npm install --no-save --package-lock=false next@15.5.25

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

# Argo CD Web Terminal 테스트용 bash 설치
RUN apk add --no-cache bash

# 실행에 필요한 파일들만 복사하고 non-root node 사용자 소유로 설정
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/package-lock.json ./package-lock.json
COPY --chown=node:node --from=builder /app/.next ./.next
COPY --chown=node:node --from=deps /app/node_modules ./node_modules

USER node

EXPOSE 3000

# package.json 에 "start": "next start" 가 있다고 가정
CMD ["npm", "start"]
