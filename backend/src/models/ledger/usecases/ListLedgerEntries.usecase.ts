import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type {
  ListLedgerEntriesRepository,
  ListLedgerEntriesResult,
} from '../infra/repositories/ListLedgerEntriesRepository';
import type {
  ListLedgerEntriesQuery,
  ListLedgerEntriesResponse,
} from '../dtos/ListLedgerEntries.dto';
import type { GetProfileRepository } from '@/models/auth/infra/repositories/GetProfileRepository';
import type { ListAccountsByProfileIdRepository } from '@/models/accounts/infra/repositories/ListAccountsByProfileIdRepository';
import type { GetUserRepository } from '@/models/auth/infra/repositories/GetUserRepository';
import { DomainError } from '@/common/errors';
import { QueryParameterConverter } from './helpers/QueryParameterConverter';
import { ListLedgerEntriesFiltersBuilder } from './helpers/ListLedgerEntriesFiltersBuilder';
import { LedgerEntryMapper } from './helpers/LedgerEntryMapper';
import { SessionContextExtractor } from '@/models/auth/usecases/helpers/SessionContextExtractor';

export interface ListLedgerEntriesInput {
  tenantId: string;
  status?: ListLedgerEntriesQuery['status'];
  type?: ListLedgerEntriesQuery['type'];
  dateFrom?: ListLedgerEntriesQuery['dateFrom'];
  dateTo?: ListLedgerEntriesQuery['dateTo'];
  page?: ListLedgerEntriesQuery['page'];
  limit?: ListLedgerEntriesQuery['limit'];
}

export type ListLedgerEntriesOutput = ListLedgerEntriesResponse;

/**
 * Use case for listing ledger entries with filters and pagination.
 * Ensures multi-tenancy isolation by requiring tenantId.
 */
export class ListLedgerEntriesUseCase
  implements IService<ListLedgerEntriesInput, ListLedgerEntriesOutput>
{
  private readonly logger: ILogger;
  private readonly listLedgerEntriesRepository: ListLedgerEntriesRepository;
  private readonly sessionHandler: SessionHandler;
  private readonly getProfileRepository: GetProfileRepository;
  private readonly listAccountsByProfileIdRepository: ListAccountsByProfileIdRepository;
  private readonly getUserRepository: GetUserRepository;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.listLedgerEntriesRepository]: ListLedgerEntriesRepository;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getProfileRepository]: GetProfileRepository;
    [AppProviders.listAccountsByProfileIdRepository]: ListAccountsByProfileIdRepository;
    [AppProviders.getUserRepository]: GetUserRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.listLedgerEntriesRepository = opts[AppProviders.listLedgerEntriesRepository];
    this.sessionHandler = opts[AppProviders.sessionHandler];
    this.getProfileRepository = opts[AppProviders.getProfileRepository];
    this.listAccountsByProfileIdRepository = opts[AppProviders.listAccountsByProfileIdRepository];
    this.getUserRepository = opts[AppProviders.getUserRepository];
  }

  /**
   * Executes the list ledger entries use case.
   *
   * @param input - The input data for listing ledger entries
   * @returns Paginated list of ledger entries
   */
  public async execute(input: ListLedgerEntriesInput): Promise<ListLedgerEntriesOutput> {
    this.validateInput(input);

    const { page, limit } = QueryParameterConverter.normalizePagination(input.page, input.limit);

    // Check if user is master - if not, filter by profile accounts
    let accountIds: string[] | undefined;
    const session = this.sessionHandler.get();
    const userId = SessionContextExtractor.extractUserId(session);
    const user = await this.getUserRepository.findById({ userId });

    if (!user?.isMaster) {
      // For common users, filter by their profile's accounts
      const profile = await this.getProfileRepository.findByUserIdAndTenantId({
        userId,
        tenantId: input.tenantId,
      });

      if (profile) {
        const accounts = await this.listAccountsByProfileIdRepository.findByProfileId({
          profileId: profile.id,
          tenantId: input.tenantId,
        });
        accountIds = accounts.map((account) => account.id);
      } else {
        // If no profile found, return empty result
        accountIds = [];
      }
    }

    const filters = ListLedgerEntriesFiltersBuilder.build({
      ...input,
      accountIds,
    });

    this.logStart(input, page, limit, accountIds);

    const result = await this.listLedgerEntriesRepository.list({
      filters,
      page,
      limit,
    });

    this.logSuccess(input.tenantId, result);

    return this.buildResponse(result);
  }

  /**
   * Validates the input parameters.
   *
   * @param input - The input to validate
   * @throws {DomainError} If validation fails
   */
  private validateInput(input: ListLedgerEntriesInput): void {
    if (!input.tenantId) {
      throw new DomainError({
        message: 'Tenant ID is required',
      });
    }
  }

  /**
   * Logs the start of the operation.
   *
   * @param input - The input parameters
   * @param page - The page number
   * @param limit - The limit per page
   * @param accountIds - Optional account IDs for filtering
   */
  private logStart(
    input: ListLedgerEntriesInput,
    page: number,
    limit: number,
    accountIds?: string[],
  ): void {
    this.logger.info(
      {
        tenantId: input.tenantId,
        filters: {
          status: input.status,
          type: input.type,
          dateFrom: input.dateFrom,
          dateTo: input.dateTo,
          accountIds: accountIds?.length,
        },
        page,
        limit,
      },
      'list_ledger_entries:start',
      ListLedgerEntriesUseCase.name,
    );
  }

  /**
   * Logs the success of the operation.
   *
   * @param tenantId - The tenant ID
   * @param result - The repository result
   */
  private logSuccess(tenantId: string, result: ListLedgerEntriesResult): void {
    this.logger.info(
      {
        tenantId,
        total: result.total,
        returned: result.entries.length,
      },
      'list_ledger_entries:success',
      ListLedgerEntriesUseCase.name,
    );
  }

  /**
   * Builds the response DTO from the repository result.
   *
   * @param result - The repository result
   * @returns The response DTO
   */
  private buildResponse(result: ListLedgerEntriesResult): ListLedgerEntriesOutput {
    return {
      entries: LedgerEntryMapper.toDtoArray(result.entries),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }
}
