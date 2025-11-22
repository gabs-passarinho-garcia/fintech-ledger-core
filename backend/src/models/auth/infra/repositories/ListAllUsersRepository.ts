import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { Prisma } from 'prisma/client';
import { User, UserFactory } from '../../domain';
import { Profile, ProfileFactory } from '../../domain';

export interface UserWithProfiles {
  user: User;
  profiles: Profile[];
}

/**
 * Repository for listing all users in the system.
 * This is typically used by master users for administrative purposes.
 * Returns domain entities (User and Profile).
 */
export class ListAllUsersRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Lists all users in the system, including their profiles.
   * Master users can see deleted users (deletedAt is included).
   *
   * @param args - Query parameters
   * @param args.includeDeleted - Whether to include deleted users (default: false)
   * @param args.skip - Optional pagination offset
   * @param args.take - Optional pagination limit
   * @returns Array of users with their profiles as domain entities
   */
  public async listAll(args?: {
    includeDeleted?: boolean;
    skip?: number;
    take?: number;
  }): Promise<UserWithProfiles[]> {
    const where: Prisma.UserWhereInput = {};

    if (!args?.includeDeleted) {
      where.deletedAt = null;
    }

    const usersData = await this.prisma.user.findMany({
      where,
      skip: args?.skip,
      take: args?.take,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        isMaster: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        profiles: {
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
        },
      },
    });

    return usersData.map((userData) => ({
      user: UserFactory.reconstruct({
        id: userData.id,
        username: userData.username,
        passwordHash: userData.passwordHash,
        isMaster: userData.isMaster,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        deletedAt: userData.deletedAt,
      }),
      profiles: userData.profiles.map((profileData) =>
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
      ),
    }));
  }
}
