import { Elysia } from 'elysia';
import type { ContainerHandler } from '../container/ContainerHandler';
import { AppProviders } from '../interfaces/IAppContainer';

/**
 * @function sessionContextMiddleware
 * @description Middleware that initializes AsyncLocalStorage context for each request.
 * This ensures that SessionHandler can access request-scoped session data throughout
 * the entire request lifecycle without explicit dependency injection.
 *
 * Uses derive to initialize context early in the request lifecycle, after scope is available
 * but before onBeforeHandle, ensuring it's available for all subsequent middleware and handlers.
 * The context is automatically cleaned up when the request completes via onAfterHandle.
 *
 * IMPORTANT: This middleware MUST be registered AFTER createScopeMiddleware in the app chain,
 * as it depends on the scope being available in the context. The derive hook executes in the
 * order middlewares are registered, so createScopeMiddleware.derive() must run first.
 *
 * NOTE ON enterWith() vs run():
 * While run() is generally preferred for AsyncLocalStorage, we use enterWith() here because:
 * 1. The derive hook is synchronous and returns immediately
 * 2. We need the context to persist through the entire async request lifecycle
 * 3. run() would clean up the context as soon as derive returns, which is too early
 * 4. enterWith() is the correct choice when you need context to persist beyond a callback scope
 * 5. We ensure proper cleanup via onAfterHandle to prevent context leakage
 *
 * This is a valid use case for enterWith() as documented in Node.js AsyncLocalStorage API.
 * The key is ensuring proper cleanup, which we do in onAfterHandle.
 */
export const sessionContextMiddleware = new Elysia<
  '',
  {
    store: Record<string, unknown>;
    decorator: Record<string, unknown>;
    derive: Record<string, unknown>;
    resolve: {
      scope: ContainerHandler;
    };
  }
>({ name: 'session-context' })
  .derive({ as: 'scoped' }, ({ scope }) => {
    // Resolve SessionHandler from container (now SINGLETON)
    // derive executes in registration order, so this runs after createScopeMiddleware.derive()
    // which ensures scope is available. This executes before onBeforeHandle,
    // ensuring context is initialized early for all subsequent middleware
    const sessionHandler = scope.resolve(AppProviders.sessionHandler);

    // Initialize CLS context for this request using enterWith()
    // enterWith() is appropriate here because we need the context to persist
    // through the entire async request lifecycle, not just within a callback scope.
    // The context will remain active throughout the entire request lifecycle.
    sessionHandler.initialize();

    // Return empty object since we're just initializing context, not adding to context
    return {};
  })
  .onAfterHandle({ as: 'scoped' }, ({ scope }) => {
    // Resolve SessionHandler from container to clear context after request completes
    const sessionHandler = scope.resolve(AppProviders.sessionHandler);

    // Clear CLS context to prevent context leakage between requests
    // This is CRITICAL when using enterWith() to ensure proper cleanup
    // Without this, context could leak between requests causing data corruption
    sessionHandler.clear();
  });
