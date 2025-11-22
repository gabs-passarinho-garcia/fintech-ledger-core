import { Prisma } from 'prisma/client';
import { Decimal } from 'decimal.js';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import {
  LedgerEntry,
  type TransactionType,
  type LedgerEntryStatus,
} from '../../domain/LedgerEntry.entity';

export interface ListAllLedgerEntriesFilters {
  status?: LedgerEntryStatus;
  type?: TransactionType;
  dateFrom?: Date;
  dateTo?: Date;
  tenantId?: string;
}

export interface ListAllLedgerEntriesResult {
  entries: LedgerEntry[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Repository for listing all ledger entries in the system (admin only).
 * Does not filter by tenantId, allowing master users to see all entries.
 */
export class ListAllLedgerEntriesRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Lists all ledger entries with filters and pagination (no tenant filter).
   *
   * @param args - Query parameters
   * @param args.filters - Filter criteria (optional tenantId for convenience)
   * @param args.page - Page number (1-based)
   * @param args.limit - Number of entries per page
   * @param args.includeDeleted - Whether to include deleted entries
   * @param args.tx - Optional transaction context
   * @returns Paginated list of ledger entries
   */
  public async listAll(args: {
    filters?: ListAllLedgerEntriesFilters;
    page: number;
    limit: number;
    includeDeleted?: boolean;
    tx?: Prisma.TransactionClient;
  }): Promise<ListAllLedgerEntriesResult> {
    const client = args.tx || this.prisma;
    const skip = (args.page - 1) * args.limit;

    const where: Prisma.LedgerEntryWhereInput = {};

    if (!args.includeDeleted) {
      where.deletedAt = null;
    }

    if (args.filters?.tenantId) {
      where.tenantId = args.filters.tenantId;
    }

    if (args.filters?.status) {
      where.status = args.filters.status;
    }

    if (args.filters?.type) {
      where.type = args.filters.type;
    }

    if (args.filters?.dateFrom || args.filters?.dateTo) {
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
