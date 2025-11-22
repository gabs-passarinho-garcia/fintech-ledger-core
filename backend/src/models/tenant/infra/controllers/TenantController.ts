import { Elysia, t } from 'elysia';
import {
  AppProviders,
  scopeResolver,
  AuthGuardPlugin,
  TokenAuthSchema,
} from '@/common/middlewares';
import { HTTPStatusCode } from '@/common/enums';
import { ErrorSchema } from '@/common/errors/ErrorSchema';
import {
  ListTenantsResponseSchema,
  ListAllTenantsQuerySchema,
  ListAllTenantsResponseSchema,
} from '../../dtos';

const TENANTS_PATH = '';
const ALL_PATH = '/all';

const TENANT_TAG = 'Tenants';

/**
 * Controller for tenant operations.
 * Handles HTTP requests and delegates to use cases via dependency injection.
 * Protected with Bearer token authentication.
 */
export const TenantController = new Elysia({ prefix: '/tenants' })
  .resolve(scopeResolver)
  .use(AuthGuardPlugin)
  .get(
    TENANTS_PATH,
    async function listTenants({ scope }) {
      const listTenantsByUserUseCase = scope.resolve(AppProviders.listTenantsByUserUseCase);
      const result = await listTenantsByUserUseCase.execute({});

      return {
        statusCode: HTTPStatusCode.OK,
        data: result,
      };
    },
    {
      headers: TokenAuthSchema,
      response: {
        [HTTPStatusCode.OK]: t.Object({
          statusCode: t.Literal(HTTPStatusCode.OK),
          data: ListTenantsResponseSchema,
        }),
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'List Tenants',
        description: 'Lists all tenants associated with the authenticated user',
        tags: [TENANT_TAG],
      },
      isSignIn: true,
    },
  )
  .get(
    ALL_PATH,
    async function listAllTenants({ query, scope }) {
      const listAllTenantsUseCase = scope.resolve(AppProviders.listAllTenantsUseCase);
      const result = await listAllTenantsUseCase.execute({
        includeDeleted: query.includeDeleted,
        skip: query.skip,
        take: query.take,
      });

      return {
        statusCode: HTTPStatusCode.OK,
        data: result,
      };
    },
    {
      query: ListAllTenantsQuerySchema,
      headers: TokenAuthSchema,
      response: {
        [HTTPStatusCode.OK]: t.Object({
          statusCode: t.Literal(HTTPStatusCode.OK),
          data: ListAllTenantsResponseSchema,
        }),
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.FORBIDDEN]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'List All Tenants',
        description: 'Lists all tenants in the system. Only master users can access.',
        tags: [TENANT_TAG],
      },
      isSignIn: true,
    },
  );
