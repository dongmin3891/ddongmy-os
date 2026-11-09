# 1. 공통 베이스 이미지
FROM node:22.23.4-alpine AS base

# Alpine에서 필요한 기본 패키지 설치
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 2. 의존성 설치 단계
FROM base AS deps

# package-lock.json이 있으면 같이 복사
COPY package.json package-lock.json* ./

# lockfile 기준으로 의존성 설치
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

# 운영 이미지에서 tsx 없이 실행할 수 있도록 백필 스크립트를 단일 파일로 번들링
RUN npm run build:traffic-backfill

# 4. 실행 단계
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js가 추적한 운영 파일과 정적 자산만 복사한다.
# standalone에는 서버 실행에 필요한 최소 node_modules와 server.js가 포함된다.
COPY --chown=node:node --from=builder /app/.next/standalone ./
COPY --chown=node:node --from=builder /app/.next/static ./.next/static
COPY --chown=node:node --from=builder /app/public ./public

# 동일 이미지를 사용하는 일회성 백필 Job용 운영 artifact
COPY --chown=node:node --from=builder /app/dist/backfill-site-traffic.cjs ./scripts/backfill-site-traffic.cjs

USER node

EXPOSE 3000

CMD ["node", "server.js"]
