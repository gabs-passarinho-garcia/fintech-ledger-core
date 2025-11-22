import { Elysia, t } from 'elysia';
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
import { GetLedgerEntryResponseSchema } from '../../dtos/GetLedgerEntry.dto';
import {
  ListLedgerEntriesQuerySchema,
  ListLedgerEntriesResponseSchema,
} from '../../dtos/ListLedgerEntries.dto';
import {
  UpdateLedgerEntryRequestSchema,
  UpdateLedgerEntryResponseSchema,
  type UpdateLedgerEntryRequest,
} from '../../dtos/UpdateLedgerEntry.dto';
import { DeleteLedgerEntryResponseSchema } from '../../dtos/DeleteLedgerEntry.dto';
import { HTTPStatusCode } from '@/common/enums';
import { ErrorSchema } from '@/common/errors/ErrorSchema';
import { SessionContextExtractor } from '../../usecases/helpers/SessionContextExtractor';

const LEDGER_TAG = 'Ledger';
const ENTRIES_PATH = '/entries';
const ENTRIES_ID_PATH = '/entries/:id';

/**
 * Controller for ledger operations.
 * Handles HTTP requests and delegates to use cases via dependency injection.
 * Protected with Bearer token authentication.
 */
export const LedgerController = new Elysia({ prefix: '/ledger' })
  .resolve(scopeResolver)
  .use(AuthGuardPlugin)
  .post(
    ENTRIES_PATH,
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
        [HTTPStatusCode.CREATED]: t.Object({
          statusCode: t.Literal(HTTPStatusCode.CREATED),
          data: CreateLedgerEntryResponseSchema,
        }),
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
  )
  .get(
    ENTRIES_PATH,
    async function listLedgerEntries({ query, scope }) {
      const sessionHandler = scope.resolve(AppProviders.sessionHandler);
      const session = sessionHandler.get();
      const tenantId = SessionContextExtractor.extractTenantId(session);
      const listLedgerEntriesUseCase = scope.resolve(AppProviders.listLedgerEntriesUseCase);

      const result = await listLedgerEntriesUseCase.execute({
        tenantId,
        status: query.status,
        type: query.type,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        page: query.page,
        limit: query.limit,
      });

      return {
        statusCode: HTTPStatusCode.OK,
        data: result,
      };
    },
    {
      query: ListLedgerEntriesQuerySchema,
      headers: TokenAuthSchema,
      response: {
        [HTTPStatusCode.OK]: t.Object({
          statusCode: t.Literal(HTTPStatusCode.OK),
          data: ListLedgerEntriesResponseSchema,
        }),
        [HTTPStatusCode.BAD_REQUEST]: ErrorSchema,
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'List Ledger Entries',
        description: 'Lists ledger entries with filters and pagination',
        tags: [LEDGER_TAG],
      },
      isSignIn: true,
    },
  )
  .get(
    ENTRIES_ID_PATH,
    async function getLedgerEntry({ params, scope }) {
      const sessionHandler = scope.resolve(AppProviders.sessionHandler);
      const session = sessionHandler.get();
      const tenantId = SessionContextExtractor.extractTenantId(session);
      const getLedgerEntryUseCase = scope.resolve(AppProviders.getLedgerEntryUseCase);

      const result = await getLedgerEntryUseCase.execute({
        ledgerEntryId: params.id,
        tenantId,
      });

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
          data: GetLedgerEntryResponseSchema,
        }),
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.NOT_FOUND]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'Get Ledger Entry',
        description: 'Retrieves a ledger entry by ID',
        tags: [LEDGER_TAG],
      },
      isSignIn: true,
    },
  )
  .put(
    ENTRIES_ID_PATH,
    async function updateLedgerEntry({ params, body, scope }) {
      const sessionHandler = scope.resolve(AppProviders.sessionHandler);
      const session = sessionHandler.get();
      const tenantId = SessionContextExtractor.extractTenantId(session);
      const userId = SessionContextExtractor.extractUserId(session);
      const input: UpdateLedgerEntryRequest = body as UpdateLedgerEntryRequest;
      const updateLedgerEntryUseCase = scope.resolve(AppProviders.updateLedgerEntryUseCase);

      const result = await updateLedgerEntryUseCase.execute({
        ledgerEntryId: params.id,
        tenantId,
        status: input.status,
        updatedBy: userId,
      });

      return {
        statusCode: HTTPStatusCode.OK,
        data: result,
      };
    },
    {
      body: UpdateLedgerEntryRequestSchema,
      headers: TokenAuthSchema,
      response: {
        [HTTPStatusCode.OK]: t.Object({
          statusCode: t.Literal(HTTPStatusCode.OK),
          data: UpdateLedgerEntryResponseSchema,
        }),
        [HTTPStatusCode.BAD_REQUEST]: ErrorSchema,
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.NOT_FOUND]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'Update Ledger Entry',
        description: 'Updates a ledger entry status',
        tags: [LEDGER_TAG],
      },
      isSignIn: true,
    },
  )
  .delete(
    ENTRIES_ID_PATH,
    async function deleteLedgerEntry({ params, scope }) {
      const sessionHandler = scope.resolve(AppProviders.sessionHandler);
      const session = sessionHandler.get();
      const tenantId = SessionContextExtractor.extractTenantId(session);
      const userId = SessionContextExtractor.extractUserId(session);
      const deleteLedgerEntryUseCase = scope.resolve(AppProviders.deleteLedgerEntryUseCase);

      const result = await deleteLedgerEntryUseCase.execute({
        ledgerEntryId: params.id,
        tenantId,
        deletedBy: userId,
      });

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
          data: DeleteLedgerEntryResponseSchema,
        }),
        [HTTPStatusCode.UNAUTHORIZED]: ErrorSchema,
        [HTTPStatusCode.NOT_FOUND]: ErrorSchema,
        [HTTPStatusCode.INTERNAL_SERVER_ERROR]: ErrorSchema,
      },
      detail: {
        summary: 'Delete Ledger Entry',
        description: 'Soft deletes a ledger entry',
        tags: [LEDGER_TAG],
      },
      isSignIn: true,
    },
  );
