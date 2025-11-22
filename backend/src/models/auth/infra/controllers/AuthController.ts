import { Elysia, t } from 'elysia';
import { AppProviders, scopeResolver } from '@/common/middlewares';
import {
  SignInRequestSchema,
  SignInResponseSchema,
  type SignInRequest,
} from '../../dtos/SignIn.dto';
import {
  RefreshTokenRequestSchema,
  RefreshTokenResponseSchema,
  type RefreshTokenRequest,
} from '../../dtos/RefreshToken.dto';
import { HTTPStatusCode } from '@/common/enums';
import { ErrorSchema } from '@/common/errors/ErrorSchema';

const AUTH_TAG = 'Authentication';
const LOGIN_PATH = '/login';
const REFRESH_PATH = '/refresh';

/**
 * Controller for authentication operations.
 * Handles HTTP requests for login and token refresh.
 * Public endpoints (no authentication required).
 */
export const AuthController = new Elysia({ prefix: '/auth' })
  .resolve(scopeResolver)
  .post(
    LOGIN_PATH,
    async function signIn({ body, scope }) {
      const input: SignInRequest = body as SignInRequest;
      const signInUseCase = scope.resolve(AppProviders.signInUseCase);
      const result = await signInUseCase.execute(input);

      return {
        statusCode: HTTPStatusCode.OK,
        data: result,
      };
    },
    {
      body: SignInRequestSchema,
      response: {
        [HTTPStatusCode.OK]: t.Object({
          statusCode: t.Literal(HTTPStatusCode.OK),
          data: SignInResponseSchema,
        }),
        [HTTPStatusCode.BAD_REQUEST]: ErrorSchema,
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.NOT_FOUND]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'Sign In',
        description:
          'Authenticates a user with username and password, returns access and refresh tokens',
        tags: [AUTH_TAG],
      },
    },
  )
  .post(
    REFRESH_PATH,
    async function refreshToken({ body, scope }) {
      const input: RefreshTokenRequest = body as RefreshTokenRequest;
      const refreshTokenUseCase = scope.resolve(AppProviders.refreshTokenUseCase);
      const result = await refreshTokenUseCase.execute(input);

      return {
        statusCode: HTTPStatusCode.OK,
        data: result,
      };
    },
    {
      body: RefreshTokenRequestSchema,
      response: {
        [HTTPStatusCode.OK]: t.Object({
          statusCode: t.Literal(HTTPStatusCode.OK),
          data: RefreshTokenResponseSchema,
        }),
        [HTTPStatusCode.BAD_REQUEST]: ErrorSchema,
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.NOT_FOUND]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'Refresh Token',
        description: 'Refreshes an access token using a refresh token',
        tags: [AUTH_TAG],
      },
    },
  );
