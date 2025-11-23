import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

/**
 * Repository for listing public tenants (non-deleted tenants).
 * This is used for public endpoints where anyone can see available tenants.
 * Returns only id and name for simplicity.
 */
export class ListPublicTenantsRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Lists all non-deleted tenants.
   * Returns only id and name for public consumption.
   *
   * @returns Array of tenant data with id and name only
   */
  public async listPublic(): Promise<
    Array<{
      id: string;
      name: string;
    }>
  > {
    return await this.prisma.tenant.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
