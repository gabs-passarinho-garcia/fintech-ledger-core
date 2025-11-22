import { Elysia } from 'elysia';
import type { ContainerHandler } from '../container/ContainerHandler';
import { AppProviders } from '../interfaces/IAppContainer';

/**
 * Key guard plugin for Elysia that validates API keys.
 * Uses the KeyAuthHandler to authenticate requests.
 */
export const KeyGuardPlugin = new Elysia<
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
  isApiKeyAuth(enable: boolean) {
    if (!enable) {
      return;
    }

    return {
      async beforeHandle({ headers, scope }): Promise<void> {
        const handler = scope.resolve(AppProviders.keyAuthHandler);

        await handler.auth({ headers });
      },
    };
  },
});
