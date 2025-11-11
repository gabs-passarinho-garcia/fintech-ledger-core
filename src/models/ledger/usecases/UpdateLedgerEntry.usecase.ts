import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { UpdateLedgerEntryRepository } from '../infra/repositories/UpdateLedgerEntryRepository';
import type {
  UpdateLedgerEntryRequest,
  UpdateLedgerEntryResponse,
} from '../dtos/UpdateLedgerEntry.dto';
import { DomainError } from '@/common/errors';

export interface UpdateLedgerEntryInput {
  ledgerEntryId: string;
  tenantId: string;
  status: UpdateLedgerEntryRequest['status'];
  updatedBy: string;
}

export type UpdateLedgerEntryOutput = UpdateLedgerEntryResponse;

/**
 * Use case for updating a ledger entry's status.
 * Ensures multi-tenancy isolation by requiring tenantId.
 */
export class UpdateLedgerEntryUseCase
  implements IService<UpdateLedgerEntryInput, UpdateLedgerEntryOutput>
{
  private readonly logger: ILogger;
  private readonly updateLedgerEntryRepository: UpdateLedgerEntryRepository;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.updateLedgerEntryRepository]: UpdateLedgerEntryRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.updateLedgerEntryRepository = opts[AppProviders.updateLedgerEntryRepository];
  }

  /**
   * Executes the update ledger entry use case.
   *
   * @param input - The input data for updating the ledger entry
   * @returns The updated ledger entry output
   * @throws {NotFoundError} If the ledger entry is not found
   */
  public async execute(input: UpdateLedgerEntryInput): Promise<UpdateLedgerEntryOutput> {
    if (!input.tenantId) {
      throw new DomainError({
        message: 'Tenant ID is required',
      });
    }

    if (!input.updatedBy) {
      throw new DomainError({
        message: 'User ID is required',
      });
    }

    this.logger.info(
      {
        ledgerEntryId: input.ledgerEntryId,
        tenantId: input.tenantId,
        newStatus: input.status,
        updatedBy: input.updatedBy,
      },
      'update_ledger_entry:start',
      UpdateLedgerEntryUseCase.name,
    );

    const entry = await this.updateLedgerEntryRepository.update({
      ledgerEntryId: input.ledgerEntryId,
      tenantId: input.tenantId,
      status: input.status,
      updatedBy: input.updatedBy,
    });

    this.logger.info(
      {
        ledgerEntryId: entry.id,
        tenantId: entry.tenantId,
        status: entry.status,
      },
      'update_ledger_entry:success',
      UpdateLedgerEntryUseCase.name,
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
