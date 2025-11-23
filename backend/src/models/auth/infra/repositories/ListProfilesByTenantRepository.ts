import { Prisma } from 'prisma/client';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { Profile, ProfileFactory } from '../../domain';

/**
 * Repository for listing profiles by tenant ID.
 * Handles data access for listing profiles within a tenant and returns domain entities.
 */
export class ListProfilesByTenantRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Lists all profiles for a tenant.
   *
   * @param args - Query parameters
   * @param args.tenantId - The tenant ID
   * @param args.tx - Optional transaction context
   * @returns Array of profile entities
   */
  public async listByTenantId(args: {
    tenantId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<Profile[]> {
    const client = args.tx || this.prisma;

    const profilesData = await client.profile.findMany({
      where: {
        tenantId: args.tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        userId: true,
        tenantId: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return profilesData.map((profileData) =>
      ProfileFactory.reconstruct({
        id: profileData.id,
        userId: profileData.userId,
        tenantId: profileData.tenantId,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
        deletedAt: profileData.deletedAt,
      }),
    );
  }
}
