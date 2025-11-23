import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

/**
 * Repository for retrieving tenant data.
 * Handles data access for tenant queries.
 */
export class GetTenantRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Finds a tenant by ID.
   *
   * @param args - Query parameters
   * @param args.tenantId - The tenant ID
   * @returns The tenant data or null if not found
   */
  public async findById(args: { tenantId: string }): Promise<{
    id: string;
    name: string;
    deletedAt: Date | null;
  } | null> {
    return await this.prisma.tenant.findFirst({
      where: {
        id: args.tenantId,
      },
      select: {
        id: true,
        name: true,
        deletedAt: true,
      },
    });
  }
}
