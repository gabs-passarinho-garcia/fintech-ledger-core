import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { GetLedgerEntryRepository } from '../infra/repositories/GetLedgerEntryRepository';
import type { GetLedgerEntryResponse } from '../dtos/GetLedgerEntry.dto';
import { DomainError } from '@/common/errors';

export interface GetLedgerEntryInput {
  ledgerEntryId: string;
  tenantId: string;
}

export type GetLedgerEntryOutput = GetLedgerEntryResponse;

/**
 * Use case for retrieving a ledger entry by ID.
 * Ensures multi-tenancy isolation by requiring tenantId.
 */
export class GetLedgerEntryUseCase implements IService<GetLedgerEntryInput, GetLedgerEntryOutput> {
  private readonly logger: ILogger;
  private readonly getLedgerEntryRepository: GetLedgerEntryRepository;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.getLedgerEntryRepository]: GetLedgerEntryRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.getLedgerEntryRepository = opts[AppProviders.getLedgerEntryRepository];
  }

  /**
   * Executes the get ledger entry use case.
   *
   * @param input - The input data for retrieving the ledger entry
   * @returns The ledger entry output
   * @throws {NotFoundError} If the ledger entry is not found
   */
  public async execute(input: GetLedgerEntryInput): Promise<GetLedgerEntryOutput> {
    if (!input.tenantId) {
      throw new DomainError({
        message: 'Tenant ID is required',
      });
    }

    this.logger.info(
      {
        ledgerEntryId: input.ledgerEntryId,
        tenantId: input.tenantId,
      },
      'get_ledger_entry:start',
      GetLedgerEntryUseCase.name,
    );

    const entry = await this.getLedgerEntryRepository.findByIdOrThrow({
      ledgerEntryId: input.ledgerEntryId,
      tenantId: input.tenantId,
    });

    this.logger.info(
      {
        ledgerEntryId: entry.id,
        tenantId: entry.tenantId,
        status: entry.status,
      },
      'get_ledger_entry:success',
      GetLedgerEntryUseCase.name,
    );

    return {
      id: entry.id,
      tenantId: entry.tenantId,
      fromAccountId: entry.fromAccountId,
      toAccountId: entry.toAccountId,
      amount: entry.amount.toString(),
      type: entry.type,
      status: entry.status,
      createdBy: entry.createdBy,
      createdAt: entry.createdAt,
      updatedBy: entry.updatedBy,
      updatedAt: entry.updatedAt,
    };
  }
}
