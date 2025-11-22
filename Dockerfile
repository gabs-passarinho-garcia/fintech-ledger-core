ARG BUN_VERSION=1.3.0
FROM oven/bun:${BUN_VERSION}-alpine AS base

RUN apk update --no-cache && \
    apk add --no-cache ca-certificates curl postgresql-client nodejs npm && \
    rm -rf /var/cache/apk/* && \
    echo "Node.js version: $(node -v)" && \
    echo "npm version: $(npm -v)"

WORKDIR /usr/src/app

# Variáveis de ambiente para desenvolvimento
ARG APP_ENV=dev
ENV APP_ENV=$APP_ENV

FROM base AS install
# Copy workspace configuration files
COPY ./package.json bun.lock ./
COPY ./backend/package.json ./backend/
COPY ./frontend/package.json ./frontend/
# Install all dependencies (workspace will handle deduplication)
RUN bun install --frozen-lockfile

FROM base AS prerelease
# Copy node_modules from install stage
COPY --from=install /usr/src/app/node_modules ./node_modules
# Copy all source files
COPY ./backend ./backend
COPY ./package.json bun.lock ./
# Copy .env to backend if it exists (optional, can be overridden by docker-compose)
COPY ./.env* ./
# Copy .env to backend directory for easier access
RUN if [ -f .env ]; then cp .env backend/.env; fi
ARG DATABASE_URL=none
ENV DATABASE_URL=$DATABASE_URL
WORKDIR /usr/src/app/backend
# Generate Prisma client and build
RUN bun db:init || true
RUN bun run build:prod

FROM base AS release
# Copy production node_modules
COPY --from=install /usr/src/app/node_modules ./node_modules
# Copy built application
COPY --from=prerelease /usr/src/app/backend/dist ./backend/dist
COPY --from=prerelease /usr/src/app/backend/prisma ./backend/prisma
COPY --from=prerelease /usr/src/app/backend/package.json ./backend/
COPY --from=prerelease /usr/src/app/package.json ./
# Copy .env if it exists
COPY --from=prerelease /usr/src/app/.env* ./
# Copy .env to backend directory for easier access
RUN if [ -f .env ]; then cp .env backend/.env; fi
WORKDIR /usr/src/app/backend

USER bun

ARG DATABASE_URL=none
ENV DATABASE_URL=$DATABASE_URL
ARG CORS_ORIGIN=*
ENV CORS_ORIGIN=$CORS_ORIGIN
ARG SENTRY_DSN=none
ENV SENTRY_DSN=$SENTRY_DSN
ARG SENTRY_ENVIRONMENT=dev
ENV SENTRY_ENVIRONMENT=$SENTRY_ENVIRONMENT

ARG SERVER_PORT=3000
ENV SERVER_PORT=$SERVER_PORT
EXPOSE $SERVER_PORT/tcp

# Healthcheck para verificar se a aplicação está rodando
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:$SERVER_PORT/health || exit 1

CMD ["bun", "run", "prod"]

