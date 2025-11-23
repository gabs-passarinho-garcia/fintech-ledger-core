import { Prisma } from 'prisma/client';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { Profile, ProfileFactory } from '../../domain';

/**
 * Repository for listing profiles by user ID.
 * Handles data access for listing user profiles and returns domain entities.
 */
export class ListProfilesByUserIdRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Lists all profiles for a user.
   *
   * @param args - Query parameters
   * @param args.userId - The user ID
   * @param args.tx - Optional transaction context
   * @returns Array of profile entities
   */
  public async listByUserId(args: {
    userId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<Profile[]> {
    const client = args.tx || this.prisma;

    const profilesData = await client.profile.findMany({
      where: {
        userId: args.userId,
        deletedAt: null,
      },
      select: {
        id: true,
        userId: true,
        tenantId: true,
        firstName: true,
        lastName: true,
        email: true,
        balance: true,
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
        balance: profileData.balance,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
        deletedAt: profileData.deletedAt,
      }),
    );
  }
}
