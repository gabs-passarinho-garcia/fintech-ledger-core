import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { Prisma } from 'prisma/client';
import { Profile, ProfileFactory } from '../../domain';
import { User, UserFactory } from '../../domain';

export interface ProfileWithUser {
  profile: Profile;
  user: User;
}

/**
 * Repository for listing all profiles in the system.
 * This is typically used by master users for administrative purposes.
 * Returns domain entities (Profile and User).
 */
export class ListAllProfilesRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Lists all profiles in the system, including their associated users.
   * Master users can see deleted profiles (deletedAt is included).
   *
   * @param args - Query parameters
   * @param args.includeDeleted - Whether to include deleted profiles (default: false)
   * @param args.skip - Optional pagination offset
   * @param args.take - Optional pagination limit
   * @returns Array of profiles with their users as domain entities
   */
  public async listAll(args?: {
    includeDeleted?: boolean;
    skip?: number;
    take?: number;
  }): Promise<ProfileWithUser[]> {
    const where: Prisma.ProfileWhereInput = {};

    if (!args?.includeDeleted) {
      where.deletedAt = null;
    }

    const profilesData = await this.prisma.profile.findMany({
      where,
      skip: args?.skip,
      take: args?.take,
      orderBy: {
        createdAt: 'desc',
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
        user: {
          select: {
            id: true,
            username: true,
            passwordHash: true,
            isMaster: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
          },
        },
      },
    });

    return profilesData.map((profileData) => ({
      profile: ProfileFactory.reconstruct({
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
      user: UserFactory.reconstruct({
        id: profileData.user.id,
        username: profileData.user.username,
        passwordHash: profileData.user.passwordHash,
        isMaster: profileData.user.isMaster,
        createdAt: profileData.user.createdAt,
        updatedAt: profileData.user.updatedAt,
        deletedAt: profileData.user.deletedAt,
      }),
    }));
  }
}
