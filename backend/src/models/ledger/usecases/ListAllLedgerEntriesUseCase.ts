import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type {
  ListAllLedgerEntriesRepository,
  ListAllLedgerEntriesResult,
} from '../infra/repositories/ListAllLedgerEntriesRepository';
import type {
  ListAllLedgerEntriesQuery,
  ListAllLedgerEntriesResponse,
} from '../dtos/ListAllLedgerEntries.dto';
import { AuthorizationHelper } from '@/models/auth/usecases/helpers/AuthorizationHelper';
import type { GetUserRepository } from '@/models/auth/infra/repositories/GetUserRepository';
import type { GetProfileRepository } from '@/models/auth/infra/repositories/GetProfileRepository';
import { QueryParameterConverter } from './helpers/QueryParameterConverter';
import { LedgerEntryMapper } from './helpers/LedgerEntryMapper';

export interface ListAllLedgerEntriesInput {
  status?: ListAllLedgerEntriesQuery['status'];
  type?: ListAllLedgerEntriesQuery['type'];
  dateFrom?: ListAllLedgerEntriesQuery['dateFrom'];
  dateTo?: ListAllLedgerEntriesQuery['dateTo'];
  tenantId?: ListAllLedgerEntriesQuery['tenantId'];
  page?: ListAllLedgerEntriesQuery['page'];
  limit?: ListAllLedgerEntriesQuery['limit'];
  includeDeleted?: ListAllLedgerEntriesQuery['includeDeleted'];
}

export type ListAllLedgerEntriesOutput = ListAllLedgerEntriesResponse;

/**
 * Use case for listing all ledger entries in the system (admin only).
 * Only master users can execute this use case.
 * Does not enforce tenant isolation, allowing admins to see all entries.
 */
export class ListAllLedgerEntriesUseCase
  implements IService<ListAllLedgerEntriesInput, ListAllLedgerEntriesOutput>
{
  private readonly logger: ILogger;
  private readonly listAllLedgerEntriesRepository: ListAllLedgerEntriesRepository;
  private readonly authorizationHelper: AuthorizationHelper;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.listAllLedgerEntriesRepository]: ListAllLedgerEntriesRepository;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getUserRepository]: GetUserRepository;
    [AppProviders.getProfileRepository]: GetProfileRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.listAllLedgerEntriesRepository = opts[AppProviders.listAllLedgerEntriesRepository];
    this.authorizationHelper = new AuthorizationHelper({
      sessionHandler: opts[AppProviders.sessionHandler],
      getUserRepository: opts[AppProviders.getUserRepository],
      getProfileRepository: opts[AppProviders.getProfileRepository],
    });
  }

  /**
   * Executes the list all ledger entries use case.
   * Verifies master user privileges before listing entries.
   *
   * @param input - The input data for listing all ledger entries
   * @returns Paginated list of all ledger entries
   * @throws {ForbiddenError} If user is not a master user
   */
  public async execute(input: ListAllLedgerEntriesInput): Promise<ListAllLedgerEntriesOutput> {
    // Check master user privileges
    await this.authorizationHelper.requireMaster();

    const { page, limit } = QueryParameterConverter.normalizePagination(input.page, input.limit);

    // Build filters (without tenantId requirement)
    const filters = {
      status: input.status,
      type: input.type,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      tenantId: input.tenantId,
    };

    this.logStart(input, page, limit);

    const result = await this.listAllLedgerEntriesRepository.listAll({
      filters,
      page,
      limit,
      includeDeleted: input.includeDeleted,
    });

    this.logSuccess(result);

    return this.buildResponse(result);
  }

  /**
   * Logs the start of the operation.
   *
   * @param input - The input parameters
   * @param page - The page number
   * @param limit - The limit per page
   */
  private logStart(input: ListAllLedgerEntriesInput, page: number, limit: number): void {
    this.logger.info(
      {
        filters: {
          status: input.status,
          type: input.type,
          dateFrom: input.dateFrom,
          dateTo: input.dateTo,
          tenantId: input.tenantId,
        },
        includeDeleted: input.includeDeleted,
        page,
        limit,
      },
      'list_all_ledger_entries:start',
      ListAllLedgerEntriesUseCase.name,
    );
  }

  /**
   * Logs the success of the operation.
   *
   * @param result - The repository result
   */
  private logSuccess(result: ListAllLedgerEntriesResult): void {
    this.logger.info(
      {
        total: result.total,
        returned: result.entries.length,
      },
      'list_all_ledger_entries:success',
      ListAllLedgerEntriesUseCase.name,
    );
  }

  /**
   * Builds the response DTO from the repository result.
   *
   * @param result - The repository result
   * @returns The response DTO
   */
  private buildResponse(result: ListAllLedgerEntriesResult): ListAllLedgerEntriesOutput {
    return {
      entries: LedgerEntryMapper.toAdminDtoArray(result.entries),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }
}
