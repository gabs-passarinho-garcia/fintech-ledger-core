import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { serverTiming } from '@elysiajs/server-timing';
import { ContainerHandler } from './common/container/ContainerHandler';
import { AppProviders } from './common/interfaces/IAppContainer';
import {
  createScopeMiddleware,
  scopeResolver,
  sessionContextMiddleware,
  correlationIdMiddleware,
} from './common/middlewares';
import { ErrorFactory, CustomError } from './common/errors';
import { security, securityPresets } from './common/middlewares/security';
import { swaggerPlugin } from './common/middlewares/swaggerPlugin';
import { rateLimit, rateLimitConfigs } from './common/middlewares/rateLimiting';
import { AppModule } from './AppModule';
import { LedgerController } from './models/ledger/infra/controllers/LedgerController';
import { AuthController } from './models/auth/infra/controllers/AuthController';
import { UserController } from './models/auth/infra/controllers/UserController';
import { TenantController } from './models/tenant/infra/controllers/TenantController';
import * as Sentry from '@sentry/bun';
import { instrumentation } from './instrumentation';
import { AppEnvironment, AppEnvironmentType } from '@/common';

/**
 * Creates and configures the Elysia application.
 * Initializes DI container, registers modules, and applies all middlewares.
 *
 * @returns The configured Elysia app instance
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function buildApp() {
  // Initialize DI container and register modules before middlewares use scope
  ContainerHandler.init();
  ContainerHandler.registerModule(AppModule);

  return new Elysia({
    serve: {
      idleTimeout: 120,
    },
  })
    .use(createScopeMiddleware)
    .use(sessionContextMiddleware)
    .use(correlationIdMiddleware)
    .resolve(scopeResolver)
    .onError(({ error, path, body, params, query, scope }) => {
      const logger = scope?.resolve(AppProviders.logger);

      const sessionHandler = scope?.resolve(AppProviders.sessionHandler);
      const correlationId = sessionHandler?.get()?.correlationId;

      const err = ErrorFactory.createError(error, path, correlationId, { params, query, body });

      // Log error details for debugging
      if (logger) {
        logger.error(
          {
            error: err,
            path,
            statusCode: err.statusCode,
            errorCode: err.errorCode,
            errorName: err.errorName,
            originalErrorType: error instanceof Error ? error.constructor.name : typeof error,
            isCustomError: error instanceof CustomError,
          },
          'global_error_handler',
        );
      } else {
        console.error('Error details:', {
          error: err,
          statusCode: err.statusCode,
          errorCode: err.errorCode,
          originalErrorType: error instanceof Error ? error.constructor.name : typeof error,
        });
      }

      Sentry.captureException(err);

      const statusCode = err.statusCode;
      const errorJson = err.toJSON();

      return new Response(JSON.stringify(errorJson), {
        headers: {
          'Content-Type': 'application/json',
        },
        status: statusCode,
      });
    })
    .onStart((app) => {
      const logger = ContainerHandler.resolve(AppProviders.logger);
      const message = `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`;

      if (logger) {
        logger.info(message, 'server_startup');
      } else {
        console.info(message);
      }
    })
    .use(instrumentation)
    .use(
      rateLimit(
        Bun.env['APP_ENV'] === AppEnvironment.PRODUCTION
          ? rateLimitConfigs.api
          : Bun.env['APP_ENV'] === AppEnvironment.DEVELOPMENT
            ? rateLimitConfigs.api
            : rateLimitConfigs.public,
      ),
    )
    .use(
      Bun.env['APP_ENV'] === AppEnvironment.PRODUCTION
        ? security(securityPresets.strict())
        : (
              [
                AppEnvironment.DEVELOPMENT,
                AppEnvironment.STAGING,
                AppEnvironment.LOCAL,
              ] as AppEnvironmentType[]
            ).includes(Bun.env['APP_ENV'] as AppEnvironmentType)
          ? security(securityPresets.moderate())
          : security(securityPresets.lenient()),
    )
    .use(
      cors({
        origin: (request) => {
          const origin = request.headers.get('origin');
          if (!origin) return false;

          const origins = Bun.env['CORS_ORIGIN'];

          if (origins === '*') return true;

          const allowedOrigins = origins?.split(',') || null;

          return allowedOrigins?.includes(origin) ?? false;
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'X-Requested-With',
          'Accept',
          'Origin',
          'X-Correlation-ID',
          'X-Server-Timing',
        ],
        maxAge: 86400,
      }),
    )
    .use(
      serverTiming({
        enabled: Bun.env['APP_ENV'] !== AppEnvironment.PRODUCTION,
      }),
    )
    .use(swaggerPlugin({ env: Bun.env['APP_ENV'] }))
    .get(
      '/',
      () => ({
        message: 'Fintech Ledger Core API',
        version: '0.1.0',
        documentation: '/docs',
      }),
      {
        detail: {
          summary: 'Root',
          description: 'API information',
          tags: ['Info'],
        },
      },
    )
    .get(
      '/health',
      () => ({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'fintech-ledger-core',
      }),
      {
        detail: {
          summary: 'Health Check',
          description: 'Returns the health status of the API',
          tags: ['Health'],
        },
      },
    )
    .use(AuthController)
    .use(UserController)
    .use(LedgerController)
    .use(TenantController);
}

/**
 * Elysia app instance for type inference
 * This is used by Eden Treaty for end-to-end type safety
 */
export const app = buildApp();

/**
 * App type for Eden Treaty client
 * Export the type directly from the app instance for better type inference
 */
export type App = typeof app;

/**
 * Creates and configures the Elysia application.
 * Initializes DI container, registers modules, and applies all middlewares.
 * This function is used at runtime to create a new app instance.
 *
 * @returns The configured Elysia app instance
 */
export function createApp(): ReturnType<typeof buildApp> {
  return buildApp();
}
