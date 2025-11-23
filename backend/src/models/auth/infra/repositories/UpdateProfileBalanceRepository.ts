import { Decimal } from 'decimal.js';
import { Prisma } from 'prisma/client';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

/**
 * Repository for updating profile balance.
 * Handles persistence of profile balance updates.
 */
export class UpdateProfileBalanceRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Updates the balance of a profile.
   *
   * @param args - Update parameters
   * @param args.profileId - The profile ID
   * @param args.tenantId - The tenant ID for multi-tenancy isolation
   * @param args.balance - The new balance value
   * @param args.updatedBy - The user ID who is updating the balance
   * @param args.tx - Optional transaction context
   * @returns The updated profile data
   */
  public async updateBalance(args: {
    profileId: string;
    tenantId: string;
    balance: Decimal | string | number;
    updatedBy: string;
    tx?: Prisma.TransactionClient;
  }): Promise<void> {
    const client = args.tx || this.prisma;

    const balanceValue =
      args.balance instanceof Decimal ? args.balance : new Decimal(args.balance ?? 0);

    await client.profile.update({
      where: {
        id: args.profileId,
      },
      data: {
        balance: balanceValue.toFixed(2),
        updatedAt: new Date(),
      },
    });
  }
}
