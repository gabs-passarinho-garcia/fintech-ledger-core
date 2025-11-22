import { Elysia } from 'elysia';
import { randomUUID } from 'crypto';
import type { ContainerHandler } from '../container/ContainerHandler';
import { AppProviders } from '../interfaces/IAppContainer';

/**
 * Middleware that generates or extracts correlation ID from requests
 * and injects it into the session data for request tracing.
 *
 * The correlation ID can come from:
 * 1. X-Correlation-ID header (if provided by client)
 * 2. Generated UUID (if not provided)
 *
 * The correlation ID is then:
 * 1. Stored in SessionData for use by Logger
 * 2. Returned in response headers for client tracking
 */
export const correlationIdMiddleware = new Elysia<
  '',
  {
    store: Record<string, unknown>;
    decorator: Record<string, unknown>;
    derive: Record<string, unknown>;
    resolve: {
      scope: ContainerHandler;
    };
  }
>({ name: 'correlation-id' }).onBeforeHandle(
  { as: 'scoped' },
  ({ headers, scope, set, request }) => {
    // Extract correlation ID from header or generate a new one
    const correlationId = headers['x-correlation-id'] || randomUUID();

    // Extract endpoint path from request URL
    const endpoint = new URL(request.url).pathname;

    // Get session handler using dependency injection
    const sessionHandler = scope.resolve(AppProviders.sessionHandler);

    // Get current session data
    const currentSessionData = sessionHandler.get();

    // Enrich session data with correlation ID and endpoint
    sessionHandler.enrich({
      ...currentSessionData,
      correlationId,
      endpoint,
    });

    // Add correlation ID to response headers
    set.headers['X-Correlation-ID'] = correlationId;
  },
);
