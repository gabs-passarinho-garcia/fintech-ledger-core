import { Prisma } from 'prisma/client';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

/**
 * Repository for listing tenants by user ID.
 * Lists all unique tenants associated with the user's profiles.
 */
export class ListTenantsByUserRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Lists all unique tenants for a user based on their profiles.
   *
   * @param args - Query parameters
   * @param args.userId - The user ID
   * @param args.tx - Optional transaction context
   * @returns Array of tenant data
   */
  public async listByUserId(args: { userId: string; tx?: Prisma.TransactionClient }): Promise<
    Array<{
      id: string;
      name: string;
      createdBy: string;
      createdAt: Date;
      updatedBy: string | null;
      updatedAt: Date;
      deletedBy: string | null;
      deletedAt: Date | null;
    }>
  > {
    const client = args.tx || this.prisma;

    // Get unique tenant IDs from user's profiles
    const profiles = await client.profile.findMany({
      where: {
        userId: args.userId,
        deletedAt: null,
      },
      select: {
        tenantId: true,
      },
      distinct: ['tenantId'],
    });

    const tenantIds = profiles.map((profile) => profile.tenantId);

    if (tenantIds.length === 0) {
      return [];
    }

    // Get tenant details
    return await client.tenant.findMany({
      where: {
        id: {
          in: tenantIds,
        },
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        createdBy: true,
        createdAt: true,
        updatedBy: true,
        updatedAt: true,
        deletedBy: true,
        deletedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
