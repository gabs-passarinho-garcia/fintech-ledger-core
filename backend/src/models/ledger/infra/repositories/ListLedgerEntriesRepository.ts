import { Prisma } from 'prisma/client';
import { Decimal } from 'decimal.js';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import {
  LedgerEntry,
  type TransactionType,
  type LedgerEntryStatus,
} from '../../domain/LedgerEntry.entity';

export interface ListLedgerEntriesFilters {
  tenantId: string;
  status?: LedgerEntryStatus;
  type?: TransactionType;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ListLedgerEntriesResult {
  entries: LedgerEntry[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Repository for listing ledger entries with filters and pagination.
 * Handles data access for ledger entry list queries.
 */
export class ListLedgerEntriesRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Lists ledger entries with filters and pagination.
   *
   * @param args - Query parameters
   * @param args.filters - Filter criteria
   * @param args.page - Page number (1-based)
   * @param args.limit - Number of entries per page
   * @param args.tx - Optional transaction context
   * @returns Paginated list of ledger entries
   */
  public async list(args: {
    filters: ListLedgerEntriesFilters;
    page: number;
    limit: number;
    tx?: Prisma.TransactionClient;
  }): Promise<ListLedgerEntriesResult> {
    const client = args.tx || this.prisma;
    const skip = (args.page - 1) * args.limit;

    const where: Prisma.LedgerEntryWhereInput = {
      tenantId: args.filters.tenantId,
      deletedAt: null,
    };

    if (args.filters.status) {
      where.status = args.filters.status;
    }

    if (args.filters.type) {
      where.type = args.filters.type;
    }

    if (args.filters.dateFrom || args.filters.dateTo) {
      where.createdAt = {};
      if (args.filters.dateFrom) {
        where.createdAt.gte = args.filters.dateFrom;
      }
      if (args.filters.dateTo) {
        where.createdAt.lte = args.filters.dateTo;
      }
    }

    const [entries, total] = await Promise.all([
      client.ledgerEntry.findMany({
        where,
        skip,
        take: args.limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      client.ledgerEntry.count({ where }),
    ]);

    return {
      entries: entries.map((entry) =>
        LedgerEntry.reconstruct({
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
        }),
      ),
      total,
      page: args.page,
      limit: args.limit,
    };
  }
}
