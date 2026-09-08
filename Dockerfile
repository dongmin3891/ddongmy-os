# 1. 공통 베이스 이미지
FROM node:20-alpine AS base

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

# 4. 실행 단계
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# 실행에 필요한 파일들만 복사하고 non-root node 사용자 소유로 설정
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/package-lock.json ./package-lock.json
COPY --chown=node:node --from=builder /app/.next ./.next
COPY --chown=node:node --from=deps /app/node_modules ./node_modules

USER node

EXPOSE 3000

CMD ["npm", "start"]
