# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────
# API (NestJS 11 + Prisma 7). Контекст сборки — корень монорепо.
#   docker build -f apps/api/Dockerfile -t gigant-api .
# ─────────────────────────────────────────────────────────────

FROM node:22-slim AS build
RUN corepack enable
WORKDIR /repo

# Ставим зависимости всей рабочей области (нужны все package.json для lockfile).
COPY . .
RUN pnpm install --frozen-lockfile

# Генерируем Prisma-клиент (moduleFormat=cjs) и собираем Nest.
RUN pnpm --filter api exec prisma generate \
  && pnpm --filter api build

# Собираем самодостаточный prod-пакет (только prod-зависимости).
RUN pnpm deploy --filter=api --prod /prod/api

# ─── Runtime ───
FROM node:22-slim AS runtime
# openssl нужен Prisma schema-engine для `migrate deploy`.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /prod/api ./
# `pnpm deploy` исключает dist (он в .gitignore) — копируем сборку явно.
COPY --from=build /repo/apps/api/dist ./dist
EXPOSE 3000

# Применяем миграции, затем стартуем API.
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/src/main.js"]
