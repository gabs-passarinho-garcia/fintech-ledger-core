import { Elysia } from 'elysia';
import {
  AppProviders,
  scopeResolver,
  AuthGuardPlugin,
  TokenAuthSchema,
} from '@/common/middlewares';
import {
  CreateLedgerEntryRequestSchema,
  CreateLedgerEntryResponseSchema,
  type CreateLedgerEntryRequest,
} from '../../dtos/CreateLedgerEntry.dto';
import { HTTPStatusCode } from '@/common/enums';
import { ErrorSchema } from '@/common/errors/ErrorSchema';

const LEDGER_TAG = 'Ledger';

/**
 * Controller for ledger operations.
 * Handles HTTP requests and delegates to use cases via dependency injection.
 * Protected with Bearer token authentication.
 */
export const LedgerController = new Elysia({ prefix: '/ledger' })
  .resolve(scopeResolver)
  .use(AuthGuardPlugin)
  .post(
    '/entries',
    async function createLedgerEntry({ body, scope }) {
      const input: CreateLedgerEntryRequest = body as CreateLedgerEntryRequest;
      const createLedgerEntryUseCase = scope.resolve(AppProviders.createLedgerEntryUseCase);
      const result = await createLedgerEntryUseCase.execute(input);

      return {
        statusCode: HTTPStatusCode.CREATED,
        data: result,
      };
    },
    {
      body: CreateLedgerEntryRequestSchema,
      headers: TokenAuthSchema,
      response: {
        [HTTPStatusCode.CREATED]: CreateLedgerEntryResponseSchema,
        [HTTPStatusCode.BAD_REQUEST]: ErrorSchema,
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.NOT_FOUND]: ErrorSchema,
        [HTTPStatusCode.UNPROCESSABLE_ENTITY]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'Create Ledger Entry',
        description: 'Creates a new ledger entry with atomic balance updates',
        tags: [LEDGER_TAG],
      },
      isSignIn: true,
    },
  );
