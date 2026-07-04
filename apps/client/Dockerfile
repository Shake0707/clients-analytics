# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────
# Client (Vite + React 19) → статика в nginx. Контекст — корень монорепо.
#   docker build -f apps/client/Dockerfile -t gigant-client .
# ─────────────────────────────────────────────────────────────

FROM node:22-slim AS build
RUN corepack enable
WORKDIR /repo

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter client build

# ─── Runtime (nginx отдаёт SPA и проксирует /api на сервис api) ───
FROM nginx:alpine AS runtime
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/client/dist /usr/share/nginx/html
EXPOSE 80
