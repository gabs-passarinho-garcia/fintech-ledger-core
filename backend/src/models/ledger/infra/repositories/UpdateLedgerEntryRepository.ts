import { Prisma } from 'prisma/client';
import { Decimal } from 'decimal.js';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import {
  LedgerEntry,
  type TransactionType,
  type LedgerEntryStatus,
} from '../../domain/LedgerEntry.entity';

/**
 * Repository for updating ledger entries.
 * Handles persistence of LedgerEntry entity updates.
 */
export class UpdateLedgerEntryRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Updates a ledger entry's status and updatedBy fields.
   *
   * @param args - Update parameters
   * @param args.ledgerEntryId - The ledger entry ID
   * @param args.tenantId - The tenant ID for multi-tenancy isolation
   * @param args.status - The new status
   * @param args.updatedBy - The user who updated the entry
   * @param args.tx - Optional transaction context
   * @returns The updated ledger entry entity
   */
  public async update(args: {
    ledgerEntryId: string;
    tenantId: string;
    status: LedgerEntryStatus;
    updatedBy: string;
    tx?: Prisma.TransactionClient;
  }): Promise<LedgerEntry> {
    const client = args.tx || this.prisma;

    const updated = await client.ledgerEntry.update({
      where: {
        id: args.ledgerEntryId,
      },
      data: {
        status: args.status,
        updatedBy: args.updatedBy,
        updatedAt: new Date(),
      },
    });

    // Verify tenant isolation
    if (updated.tenantId !== args.tenantId) {
      throw new Error('Tenant mismatch in ledger entry update');
    }

    return LedgerEntry.reconstruct({
      id: updated.id,
      tenantId: updated.tenantId,
      fromAccountId: updated.fromAccountId,
      toAccountId: updated.toAccountId,
      amount: new Decimal(updated.amount.toString()),
      type: updated.type as TransactionType,
      status: updated.status as LedgerEntryStatus,
      createdBy: updated.createdBy,
      createdAt: updated.createdAt,
      updatedBy: updated.updatedBy,
      updatedAt: updated.updatedAt,
      deletedBy: updated.deletedBy,
      deletedAt: updated.deletedAt,
    });
  }
}
