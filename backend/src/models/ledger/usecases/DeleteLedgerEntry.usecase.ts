import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { DeleteLedgerEntryRepository } from '../infra/repositories/DeleteLedgerEntryRepository';
import type { DeleteLedgerEntryResponse } from '../dtos/DeleteLedgerEntry.dto';
import { DomainError } from '@/common/errors';

export interface DeleteLedgerEntryInput {
  ledgerEntryId: string;
  tenantId: string;
  deletedBy: string;
}

export type DeleteLedgerEntryOutput = DeleteLedgerEntryResponse;

/**
 * Use case for soft deleting a ledger entry.
 * Ensures multi-tenancy isolation by requiring tenantId.
 */
export class DeleteLedgerEntryUseCase
  implements IService<DeleteLedgerEntryInput, DeleteLedgerEntryOutput>
{
  private readonly logger: ILogger;
  private readonly deleteLedgerEntryRepository: DeleteLedgerEntryRepository;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.deleteLedgerEntryRepository]: DeleteLedgerEntryRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.deleteLedgerEntryRepository = opts[AppProviders.deleteLedgerEntryRepository];
  }

  /**
   * Executes the delete ledger entry use case (soft delete).
   *
   * @param input - The input data for deleting the ledger entry
   * @returns The deletion confirmation
   * @throws {NotFoundError} If the ledger entry is not found
   */
  public async execute(input: DeleteLedgerEntryInput): Promise<DeleteLedgerEntryOutput> {
    if (!input.tenantId) {
      throw new DomainError({
        message: 'Tenant ID is required',
      });
    }

    if (!input.deletedBy) {
      throw new DomainError({
        message: 'User ID is required',
      });
    }

    this.logger.info(
      {
        ledgerEntryId: input.ledgerEntryId,
        tenantId: input.tenantId,
        deletedBy: input.deletedBy,
      },
      'delete_ledger_entry:start',
      DeleteLedgerEntryUseCase.name,
    );

    const entry = await this.deleteLedgerEntryRepository.softDelete({
      ledgerEntryId: input.ledgerEntryId,
      tenantId: input.tenantId,
      deletedBy: input.deletedBy,
    });

    this.logger.info(
      {
        ledgerEntryId: entry.id,
        tenantId: entry.tenantId,
        deletedAt: entry.deletedAt,
      },
      'delete_ledger_entry:success',
      DeleteLedgerEntryUseCase.name,
    );

    if (!entry.deletedAt || !entry.deletedBy) {
      throw new DomainError({
        message: 'Failed to soft delete ledger entry',
      });
    }

    return {
      id: entry.id,
      deletedAt: entry.deletedAt,
      deletedBy: entry.deletedBy,
    };
  }
}
