import { Elysia, t } from 'elysia';
import {
  AppProviders,
  scopeResolver,
  AuthGuardPlugin,
  TokenAuthSchema,
} from '@/common/middlewares';
import { HTTPStatusCode } from '@/common/enums';
import { ErrorSchema } from '@/common/errors/ErrorSchema';
import { GetMyAccountsResponseSchema } from '../../dtos/GetMyAccounts.dto';
import {
  ListAccountsByProfileParamsSchema,
  ListAccountsByProfileResponseSchema,
} from '../../dtos/ListAccountsByProfile.dto';
import { ListProfilesWithAccountsResponseSchema } from '../../dtos/ListProfilesWithAccounts.dto';

const ACCOUNT_TAG = 'Accounts';
const MY_PATH = '/my';
const PROFILE_PATH = '/profile/:profileId';
const PROFILES_PATH = '/profiles';

/**
 * Controller for account operations.
 * Handles HTTP requests and delegates to use cases via dependency injection.
 * Protected with Bearer token authentication.
 */
export const AccountController = new Elysia({ prefix: '/accounts' })
  .resolve(scopeResolver)
  .use(AuthGuardPlugin)
  .get(
    MY_PATH,
    async function getMyAccounts({ scope }) {
      const getMyAccountsUseCase = scope.resolve(AppProviders.getMyAccountsUseCase);
      const result = await getMyAccountsUseCase.execute({});

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
          data: GetMyAccountsResponseSchema,
        }),
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.NOT_FOUND]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'Get My Accounts',
        description: "Gets all accounts for the authenticated user's profile",
        tags: [ACCOUNT_TAG],
      },
      isSignIn: true,
    },
  )
  .get(
    PROFILE_PATH,
    async function listAccountsByProfile({ params, scope }) {
      const listAccountsByProfileUseCase = scope.resolve(AppProviders.listAccountsByProfileUseCase);
      const result = await listAccountsByProfileUseCase.execute({
        profileId: params.profileId,
      });

      return {
        statusCode: HTTPStatusCode.OK,
        data: result,
      };
    },
    {
      params: ListAccountsByProfileParamsSchema,
      headers: TokenAuthSchema,
      response: {
        [HTTPStatusCode.OK]: t.Object({
          statusCode: t.Literal(HTTPStatusCode.OK),
          data: ListAccountsByProfileResponseSchema,
        }),
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.FORBIDDEN]: ErrorSchema,
        [HTTPStatusCode.NOT_FOUND]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'List Accounts by Profile',
        description: 'Lists all accounts for a specific profile. Master users only.',
        tags: [ACCOUNT_TAG],
      },
      isSignIn: true,
    },
  )
  .get(
    PROFILES_PATH,
    async function listProfilesWithAccounts({ scope }) {
      const listProfilesWithAccountsUseCase = scope.resolve(
        AppProviders.listProfilesWithAccountsUseCase,
      );
      const result = await listProfilesWithAccountsUseCase.execute({});

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
          data: ListProfilesWithAccountsResponseSchema,
        }),
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.FORBIDDEN]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'List Profiles with Accounts',
        description: 'Lists all profiles with their accounts. Master users only.',
        tags: [ACCOUNT_TAG],
      },
      isSignIn: true,
    },
  );
