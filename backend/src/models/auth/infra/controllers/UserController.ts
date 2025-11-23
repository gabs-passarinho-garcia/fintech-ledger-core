import { Elysia, t } from 'elysia';
import {
  AppProviders,
  scopeResolver,
  AuthGuardPlugin,
  TokenAuthSchema,
} from '@/common/middlewares';
import {
  SignUpRequestSchema,
  SignUpResponseSchema,
  type SignUpRequest,
} from '../../dtos/SignUp.dto';
import {
  CreateProfileRequestSchema,
  CreateProfileResponseSchema,
  type CreateProfileRequest,
} from '../../dtos/CreateProfile.dto';
import { GetProfileResponseSchema, type GetProfileInput } from '../../dtos/GetProfile.dto';
import {
  UpdateProfileRequestSchema,
  UpdateProfileResponseSchema,
  type UpdateProfileInput,
} from '../../dtos/UpdateProfile.dto';
import { ListProfilesResponseSchema } from '../../dtos/ListProfiles.dto';
import {
  ListProfilesByTenantQuerySchema,
  ListProfilesByTenantResponseSchema,
} from '../../dtos/ListProfilesByTenant.dto';
import { ListAllUsersQuerySchema, ListAllUsersResponseSchema } from '../../dtos/ListAllUsers.dto';
import {
  ListAllProfilesQuerySchema,
  ListAllProfilesResponseSchema,
} from '../../dtos/ListAllProfiles.dto';
import { DeleteProfileResponseSchema, type DeleteProfileInput } from '../../dtos/DeleteProfile.dto';
import { DeleteUserResponseSchema, type DeleteUserInput } from '../../dtos/DeleteUser.dto';
import { HTTPStatusCode } from '@/common/enums';
import { ErrorSchema } from '@/common/errors/ErrorSchema';
import { SessionContextExtractor } from '../../usecases/helpers/SessionContextExtractor';

const USER_TAG = 'Users';
const SIGNUP_PATH = '/signup';
const PROFILES_PATH = '/profiles';
const PROFILES_ID_PATH = '/profiles/:profileId';
const ALL_PATH = '/all';
const ME_PATH = '/me';

/**
 * Controller for user and profile operations.
 * Handles HTTP requests and delegates to use cases via dependency injection.
 * Most endpoints are protected with Bearer token authentication.
 */
export const UserController = new Elysia({ prefix: '/users' })
  .resolve(scopeResolver)
  // Public endpoint - no authentication required
  .post(
    SIGNUP_PATH,
    async function signUp({ body, scope }) {
      const input: SignUpRequest = body as SignUpRequest;
      const signUpUseCase = scope.resolve(AppProviders.signUpUseCase);
      const result = await signUpUseCase.execute(input);

      return {
        statusCode: HTTPStatusCode.CREATED,
        data: result,
      };
    },
    {
      body: SignUpRequestSchema,
      response: {
        [HTTPStatusCode.CREATED]: t.Object({
          statusCode: t.Literal(HTTPStatusCode.CREATED),
          data: SignUpResponseSchema,
        }),
        [HTTPStatusCode.BAD_REQUEST]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'Sign Up',
        description: 'Creates a new user account and optionally an initial profile',
        tags: [USER_TAG],
      },
    },
  )
  // Protected endpoints - authentication required
  .use(AuthGuardPlugin)
  .get(
    `${PROFILES_PATH}${ME_PATH}`,
    async function getMyProfile({ scope }) {
      const getMyProfileUseCase = scope.resolve(AppProviders.getMyProfileUseCase);
      const result = await getMyProfileUseCase.execute({});

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
          data: GetProfileResponseSchema,
        }),
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.NOT_FOUND]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'Get My Profile',
        description: "Retrieves the authenticated user's profile for the current tenant.",
        tags: [USER_TAG],
      },
      isSignIn: true,
    },
  )
  .get(
    PROFILES_ID_PATH,
    async function getProfile({ params, scope }) {
      const getProfileUseCase = scope.resolve(AppProviders.getProfileUseCase);
      const input: GetProfileInput = {
        profileId: params.profileId,
      };
      const result = await getProfileUseCase.execute(input);

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
          data: GetProfileResponseSchema,
        }),
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.FORBIDDEN]: ErrorSchema,
        [HTTPStatusCode.NOT_FOUND]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'Get Profile',
        description: 'Retrieves a profile by ID. Only the profile owner or master user can access.',
        tags: [USER_TAG],
      },
      isSignIn: true,
    },
  )
  .put(
    PROFILES_ID_PATH,
    async function updateProfile({ params, body, scope }) {
      const updateProfileUseCase = scope.resolve(AppProviders.updateProfileUseCase);
      const input: UpdateProfileInput = {
        profileId: params.profileId,
        ...(body as Omit<UpdateProfileInput, 'profileId'>),
      };
      const result = await updateProfileUseCase.execute(input);

      return {
        statusCode: HTTPStatusCode.OK,
        data: result,
      };
    },
    {
      body: UpdateProfileRequestSchema,
      headers: TokenAuthSchema,
      response: {
        [HTTPStatusCode.OK]: t.Object({
          statusCode: t.Literal(HTTPStatusCode.OK),
          data: UpdateProfileResponseSchema,
        }),
        [HTTPStatusCode.BAD_REQUEST]: ErrorSchema,
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.FORBIDDEN]: ErrorSchema,
        [HTTPStatusCode.NOT_FOUND]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'Update Profile',
        description: 'Updates a profile. Only the profile owner or master user can update.',
        tags: [USER_TAG],
      },
      isSignIn: true,
    },
  )
  .get(
    PROFILES_PATH,
    async function listProfiles({ scope }) {
      const listProfilesByUserUseCase = scope.resolve(AppProviders.listProfilesByUserUseCase);
      const result = await listProfilesByUserUseCase.execute({});

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
          data: ListProfilesResponseSchema,
        }),
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'List Profiles',
        description: 'Lists all profiles for the authenticated user',
        tags: [USER_TAG],
      },
      isSignIn: true,
    },
  )
  .get(
    `${PROFILES_PATH}/by-tenant`,
    async function listProfilesByTenant({ query, scope }) {
      const listProfilesByTenantUseCase = scope.resolve(AppProviders.listProfilesByTenantUseCase);
      const result = await listProfilesByTenantUseCase.execute({
        tenantId: query.tenantId,
      });

      return {
        statusCode: HTTPStatusCode.OK,
        data: result,
      };
    },
    {
      query: ListProfilesByTenantQuerySchema,
      headers: TokenAuthSchema,
      response: {
        [HTTPStatusCode.OK]: t.Object({
          statusCode: t.Literal(HTTPStatusCode.OK),
          data: ListProfilesByTenantResponseSchema,
        }),
        [HTTPStatusCode.BAD_REQUEST]: ErrorSchema,
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.FORBIDDEN]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'List Profiles by Tenant',
        description:
          'Lists all profiles for a specific tenant. Users can only access profiles for tenants they belong to.',
        tags: [USER_TAG],
      },
      isSignIn: true,
    },
  )
  .post(
    PROFILES_PATH,
    async function createProfile({ body, scope }) {
      const input: CreateProfileRequest = body as CreateProfileRequest;
      const createProfileUseCase = scope.resolve(AppProviders.createProfileUseCase);
      const result = await createProfileUseCase.execute(input);

      return {
        statusCode: HTTPStatusCode.CREATED,
        data: result,
      };
    },
    {
      body: CreateProfileRequestSchema,
      headers: TokenAuthSchema,
      response: {
        [HTTPStatusCode.CREATED]: t.Object({
          statusCode: t.Literal(HTTPStatusCode.CREATED),
          data: CreateProfileResponseSchema,
        }),
        [HTTPStatusCode.BAD_REQUEST]: ErrorSchema,
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.NOT_FOUND]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'Create Profile',
        description: 'Creates a new profile for the authenticated user',
        tags: [USER_TAG],
      },
      isSignIn: true,
    },
  )
  .get(
    ALL_PATH,
    async function listAllUsers({ query, scope }) {
      const listAllUsersUseCase = scope.resolve(AppProviders.listAllUsersUseCase);
      const result = await listAllUsersUseCase.execute({
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
      query: ListAllUsersQuerySchema,
      headers: TokenAuthSchema,
      response: {
        [HTTPStatusCode.OK]: t.Object({
          statusCode: t.Literal(HTTPStatusCode.OK),
          data: ListAllUsersResponseSchema,
        }),
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.FORBIDDEN]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'List All Users',
        description:
          'Lists all users in the system with their profiles. Only master users can access.',
        tags: [USER_TAG],
      },
      isSignIn: true,
    },
  )
  .get(
    `${ALL_PATH}/profiles`,
    async function listAllProfiles({ query, scope }) {
      const listAllProfilesUseCase = scope.resolve(AppProviders.listAllProfilesUseCase);
      const result = await listAllProfilesUseCase.execute({
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
      query: ListAllProfilesQuerySchema,
      headers: TokenAuthSchema,
      response: {
        [HTTPStatusCode.OK]: t.Object({
          statusCode: t.Literal(HTTPStatusCode.OK),
          data: ListAllProfilesResponseSchema,
        }),
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.FORBIDDEN]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'List All Profiles',
        description: 'Lists all profiles in the system. Only master users can access.',
        tags: [USER_TAG],
      },
      isSignIn: true,
    },
  )
  .delete(
    PROFILES_ID_PATH,
    async function deleteProfile({ params, scope }) {
      const deleteProfileUseCase = scope.resolve(AppProviders.deleteProfileUseCase);
      const input: DeleteProfileInput = {
        profileId: params.profileId,
      };
      const result = await deleteProfileUseCase.execute(input);

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
          data: DeleteProfileResponseSchema,
        }),
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.FORBIDDEN]: ErrorSchema,
        [HTTPStatusCode.NOT_FOUND]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'Delete Profile',
        description: 'Soft deletes a profile. Only the profile owner or master user can delete.',
        tags: [USER_TAG],
      },
      isSignIn: true,
    },
  )
  .delete(
    ME_PATH,
    async function deleteUser({ scope }) {
      const sessionHandler = scope.resolve(AppProviders.sessionHandler);
      const session = sessionHandler.get();
      const userId = SessionContextExtractor.extractUserId(session);
      const deleteUserUseCase = scope.resolve(AppProviders.deleteUserUseCase);
      const input: DeleteUserInput = {
        userId,
      };
      const result = await deleteUserUseCase.execute(input);

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
          data: DeleteUserResponseSchema,
        }),
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.FORBIDDEN]: ErrorSchema,
        [HTTPStatusCode.NOT_FOUND]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'Delete User (Unregister)',
        description: 'Soft deletes the authenticated user and all their profiles',
        tags: [USER_TAG],
      },
      isSignIn: true,
    },
  );
