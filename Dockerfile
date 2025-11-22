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
RUN mkdir -p /temp/dev
COPY ./package.json bun.lock backend/package.json frontend/package.json /temp/dev/
COPY ./backend/tsconfig.json ./backend/eslint.config.mjs ./backend/.prettierrc /temp/dev/backend/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY ./package.json bun.lock backend/package.json /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
ARG DATABASE_URL=none
ENV DATABASE_URL=$DATABASE_URL
WORKDIR /usr/src/app/backend
RUN bun db:init
RUN bun run build:prod

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/backend/dist ./backend/dist
COPY --from=prerelease /usr/src/app/backend/prisma ./backend/prisma
COPY --from=prerelease /usr/src/app/backend/package.json ./backend/
COPY --from=prerelease /usr/src/app/package.json ./
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

