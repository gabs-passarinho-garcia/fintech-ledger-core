import { Prisma } from 'prisma/client';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

/**
 * Repository for listing all tenants in the system.
 * This is typically used by master users for administrative purposes.
 * Master users can see deleted tenants (deletedAt is included).
 */
export class ListAllTenantsRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Lists all tenants in the system.
   * Master users can see deleted tenants (deletedAt is included).
   *
   * @param args - Query parameters
   * @param args.includeDeleted - Whether to include deleted tenants (default: false)
   * @param args.skip - Optional pagination offset
   * @param args.take - Optional pagination limit
   * @returns Array of tenant data
   */
  public async listAll(args?: { includeDeleted?: boolean; skip?: number; take?: number }): Promise<
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
    const where: Prisma.TenantWhereInput = {};

    if (!args?.includeDeleted) {
      where.deletedAt = null;
    }

    return await this.prisma.tenant.findMany({
      where,
      skip: args?.skip,
      take: args?.take,
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
      orderBy: [
        {
          name: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }
}
