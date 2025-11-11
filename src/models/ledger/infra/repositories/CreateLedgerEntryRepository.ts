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
 * Repository for creating ledger entries.
 * Handles persistence of LedgerEntry entities.
 */
export class CreateLedgerEntryRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Creates a new ledger entry in the database.
   *
   * @param args - Creation parameters
   * @param args.ledgerEntry - The LedgerEntry entity to persist
   * @param args.tx - Optional transaction context
   * @returns The created ledger entry entity
   */
  public async create(args: {
    ledgerEntry: LedgerEntry;
    tx?: Prisma.TransactionClient;
  }): Promise<LedgerEntry> {
    const client = args.tx || this.prisma;

    const created = await client.ledgerEntry.create({
      data: {
        id: args.ledgerEntry.id,
        tenantId: args.ledgerEntry.tenantId,
        fromAccountId: args.ledgerEntry.fromAccountId,
        toAccountId: args.ledgerEntry.toAccountId,
        amount: args.ledgerEntry.amount.toNumber(),
        type: args.ledgerEntry.type,
        status: args.ledgerEntry.status,
        createdBy: args.ledgerEntry.createdBy,
        createdAt: args.ledgerEntry.createdAt,
        updatedBy: args.ledgerEntry.updatedBy,
        updatedAt: args.ledgerEntry.updatedAt,
      },
    });

    // Reconstruct entity from database data
    return LedgerEntry.reconstruct({
      id: created.id,
      tenantId: created.tenantId,
      fromAccountId: created.fromAccountId,
      toAccountId: created.toAccountId,
      amount: new Decimal(created.amount.toString()),
      type: created.type as TransactionType,
      status: created.status as LedgerEntryStatus,
      createdBy: created.createdBy,
      createdAt: created.createdAt,
      updatedBy: created.updatedBy,
      updatedAt: created.updatedAt,
      deletedBy: created.deletedBy,
      deletedAt: created.deletedAt,
    });
  }
}
