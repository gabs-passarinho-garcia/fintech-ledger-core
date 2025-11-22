import { Prisma } from 'prisma/client';
import { Decimal } from 'decimal.js';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { NotFoundError } from '@/common/errors';
import {
  LedgerEntry,
  type TransactionType,
  type LedgerEntryStatus,
} from '../../domain/LedgerEntry.entity';

/**
 * Repository for retrieving ledger entry data.
 * Handles data access for ledger entry queries.
 */
export class GetLedgerEntryRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Finds a ledger entry by ID and tenant ID.
   *
   * @param args - Query parameters
   * @param args.ledgerEntryId - The ledger entry ID
   * @param args.tenantId - The tenant ID for multi-tenancy isolation
   * @param args.tx - Optional transaction context
   * @returns The ledger entry entity or null if not found
   */
  public async findById(args: {
    ledgerEntryId: string;
    tenantId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<LedgerEntry | null> {
    const client = args.tx || this.prisma;

    const entry = await client.ledgerEntry.findFirst({
      where: {
        id: args.ledgerEntryId,
        tenantId: args.tenantId,
        deletedAt: null,
      },
    });

    if (!entry) {
      return null;
    }

    return LedgerEntry.reconstruct({
      id: entry.id,
      tenantId: entry.tenantId,
      fromAccountId: entry.fromAccountId,
      toAccountId: entry.toAccountId,
      amount: new Decimal(entry.amount.toString()),
      type: entry.type as TransactionType,
      status: entry.status as LedgerEntryStatus,
      createdBy: entry.createdBy,
      createdAt: entry.createdAt,
      updatedBy: entry.updatedBy,
      updatedAt: entry.updatedAt,
      deletedBy: entry.deletedBy,
      deletedAt: entry.deletedAt,
    });
  }

  /**
   * Finds a ledger entry by ID and tenant ID, throwing an error if not found.
   *
   * @param args - Query parameters
   * @param args.ledgerEntryId - The ledger entry ID
   * @param args.tenantId - The tenant ID for multi-tenancy isolation
   * @param args.tx - Optional transaction context
   * @returns The ledger entry entity
   * @throws {NotFoundError} If the ledger entry is not found
   */
  public async findByIdOrThrow(args: {
    ledgerEntryId: string;
    tenantId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<LedgerEntry> {
    const entry = await this.findById(args);

    if (!entry) {
      throw new NotFoundError({
        message: `Ledger entry with ID ${args.ledgerEntryId} not found for tenant ${args.tenantId}`,
      });
    }

    return entry;
  }
}
