FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./tsconfig.json
COPY services/status-exporter ./services/status-exporter

RUN ./node_modules/.bin/tsc --project services/status-exporter/tsconfig.json

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --chown=node:node --from=builder /app/services/status-exporter/dist ./dist
COPY --chown=node:node --from=builder /app/services/status-exporter/package.json ./package.json

USER node

EXPOSE 8080

CMD ["node", "dist/server.js"]
