import { Elysia } from 'elysia';
import type { ContainerHandler } from '../container/ContainerHandler';
import { AppProviders } from '../interfaces/IAppContainer';

/**
 * Auth guard plugin for Elysia that validates Bearer tokens.
 * Uses the TokenAuthHandler to authenticate requests.
 */
export const AuthGuardPlugin = new Elysia<
  '',
  {
    store: Record<string, unknown>;
    decorator: Record<string, unknown>;
    derive: Record<string, unknown>;
    resolve: {
      scope: ContainerHandler;
    };
  }
>().macro({
  isSignIn(enable: boolean) {
    if (!enable) {
      return;
    }

    return {
      async beforeHandle({ headers, scope }): Promise<void> {
        const handler = scope.resolve(AppProviders.tokenAuthHandler);
        const logger = scope.resolve(AppProviders.logger);
        try {
          await handler.auth({ headers });
        } catch (authError) {
          logger?.error(authError, 'auth_guard_middleware');
          throw authError;
        }
      },
    };
  },
});
