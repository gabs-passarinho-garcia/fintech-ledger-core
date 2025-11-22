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
      async beforeHandle({ headers, scope, error }): Promise<void> {
        try {
          const handler = scope.resolve(AppProviders.tokenAuthHandler);
          await handler.auth({ headers });
        } catch (authError) {
          // Re-throw the error to ensure it's properly caught by onError handler
          // This ensures the error maintains its original type and status code
          throw authError;
        }
      },
    };
  },
});
