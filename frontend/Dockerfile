# ── Stage 1: build CSS ────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run tw:build

# ── Stage 2: production image ─────────────────────────────────────────────────
FROM oven/bun:1-slim AS production
WORKDIR /app

COPY --from=builder /app .

EXPOSE 3000

ENV NODE_ENV=production

CMD ["bun", "src/index.ts"]
