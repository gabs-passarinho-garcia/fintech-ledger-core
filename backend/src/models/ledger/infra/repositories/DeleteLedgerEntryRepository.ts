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
 * Repository for soft deleting ledger entries.
 * Handles soft deletion by marking deletedAt and deletedBy fields.
 */
export class DeleteLedgerEntryRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Soft deletes a ledger entry by marking deletedAt and deletedBy.
   *
   * @param args - Delete parameters
   * @param args.ledgerEntryId - The ledger entry ID
   * @param args.tenantId - The tenant ID for multi-tenancy isolation
   * @param args.deletedBy - The user who deleted the entry
   * @param args.tx - Optional transaction context
   * @returns The soft-deleted ledger entry entity
   */
  public async softDelete(args: {
    ledgerEntryId: string;
    tenantId: string;
    deletedBy: string;
    tx?: Prisma.TransactionClient;
  }): Promise<LedgerEntry> {
    const client = args.tx || this.prisma;

    const deleted = await client.ledgerEntry.update({
      where: {
        id: args.ledgerEntryId,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: args.deletedBy,
        updatedAt: new Date(),
      },
    });

    // Verify tenant isolation
    if (deleted.tenantId !== args.tenantId) {
      throw new Error('Tenant mismatch in ledger entry deletion');
    }

    return LedgerEntry.reconstruct({
      id: deleted.id,
      tenantId: deleted.tenantId,
      fromAccountId: deleted.fromAccountId,
      toAccountId: deleted.toAccountId,
      amount: new Decimal(deleted.amount.toString()),
      type: deleted.type as TransactionType,
      status: deleted.status as LedgerEntryStatus,
      createdBy: deleted.createdBy,
      createdAt: deleted.createdAt,
      updatedBy: deleted.updatedBy,
      updatedAt: deleted.updatedAt,
      deletedBy: deleted.deletedBy,
      deletedAt: deleted.deletedAt,
    });
  }
}
