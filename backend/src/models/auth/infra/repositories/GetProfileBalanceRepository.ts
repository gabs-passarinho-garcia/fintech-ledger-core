import { Decimal } from 'decimal.js';
import { Prisma } from 'prisma/client';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

/**
 * Repository for calculating profile balance from accounts.
 * Handles the aggregation of account balances for a profile.
 */
export class GetProfileBalanceRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Calculates the total balance of all accounts for a specific profile.
   *
   * @param args - Query parameters
   * @param args.profileId - The profile ID
   * @param args.tenantId - The tenant ID for multi-tenancy isolation
   * @param args.tx - Optional transaction context
   * @returns The calculated balance as a Decimal
   */
  public async calculateBalance(args: {
    profileId: string;
    tenantId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<Decimal> {
    const client = args.tx || this.prisma;

    const result = await client.account.aggregate({
      where: {
        profileId: args.profileId,
        tenantId: args.tenantId,
        deletedAt: null,
      },
      _sum: {
        balance: true,
      },
    });

    const sum = result._sum.balance;
    return sum ? new Decimal(sum) : new Decimal(0);
  }
}
