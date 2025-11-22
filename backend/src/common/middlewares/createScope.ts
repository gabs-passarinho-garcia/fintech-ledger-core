import Elysia from 'elysia';
import { ContainerHandler } from '../container/ContainerHandler';

export const createScopeMiddleware = new Elysia<
  '',
  {
    store: Record<string, unknown>;
    decorator: Record<string, unknown>;
    derive: Record<string, unknown>;
    resolve: {
      scope: ContainerHandler;
    } & Record<string, unknown>;
  }
>().derive({ as: 'scoped' }, (ctx) => {
  ctx.scope = ContainerHandler.createScope();
});

export const scopeResolver = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  ctx: any,
): {
  scope: ContainerHandler;
} => ({
  scope: ctx['scope'] as ContainerHandler,
});
