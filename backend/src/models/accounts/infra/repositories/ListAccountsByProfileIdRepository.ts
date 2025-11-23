import { Prisma } from 'prisma/client';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

export interface AccountData {
  id: string;
  tenantId: string;
  profileId: string | null;
  name: string;
  balance: Prisma.Decimal;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Repository for listing accounts by profile ID.
 * Handles data access for account queries filtered by profile.
 */
export class ListAccountsByProfileIdRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Lists all accounts for a specific profile.
   *
   * @param args - Query parameters
   * @param args.profileId - The profile ID
   * @param args.tenantId - The tenant ID for multi-tenancy isolation
   * @param args.tx - Optional transaction context
   * @returns Array of account data
   */
  public async findByProfileId(args: {
    profileId: string;
    tenantId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<AccountData[]> {
    const client = args.tx || this.prisma;

    return await client.account.findMany({
      where: {
        profileId: args.profileId,
        tenantId: args.tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        tenantId: true,
        profileId: true,
        name: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
