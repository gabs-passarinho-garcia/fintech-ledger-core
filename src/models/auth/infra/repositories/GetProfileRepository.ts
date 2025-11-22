import { Prisma } from 'prisma/client';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { NotFoundError } from '@/common/errors';
import { Profile, ProfileFactory } from '../../domain';

/**
 * Repository for retrieving profile entities.
 * Handles data access for profile queries and returns domain entities.
 */
export class GetProfileRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Finds a profile by ID.
   *
   * @param args - Query parameters
   * @param args.profileId - The profile ID
   * @param args.tx - Optional transaction context
   * @returns The profile entity or null if not found
   */
  public async findById(args: {
    profileId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<Profile | null> {
    const client = args.tx || this.prisma;

    const profileData = await client.profile.findFirst({
      where: {
        id: args.profileId,
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
    });

    if (!profileData) {
      return null;
    }

    return ProfileFactory.reconstruct({
      id: profileData.id,
      userId: profileData.userId,
      tenantId: profileData.tenantId,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      createdAt: profileData.createdAt,
      updatedAt: profileData.updatedAt,
      deletedAt: profileData.deletedAt,
    });
  }

  /**
   * Finds a profile by user ID and tenant ID.
   *
   * @param args - Query parameters
   * @param args.userId - The user ID
   * @param args.tenantId - The tenant ID
   * @param args.tx - Optional transaction context
   * @returns The profile entity or null if not found
   */
  public async findByUserIdAndTenantId(args: {
    userId: string;
    tenantId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<Profile | null> {
    const client = args.tx || this.prisma;

    const profileData = await client.profile.findFirst({
      where: {
        userId: args.userId,
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
    });

    if (!profileData) {
      return null;
    }

    return ProfileFactory.reconstruct({
      id: profileData.id,
      userId: profileData.userId,
      tenantId: profileData.tenantId,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      createdAt: profileData.createdAt,
      updatedAt: profileData.updatedAt,
      deletedAt: profileData.deletedAt,
    });
  }

  /**
   * Finds a profile by user ID and tenant ID, throwing an error if not found.
   *
   * @param args - Query parameters
   * @param args.userId - The user ID
   * @param args.tenantId - The tenant ID
   * @param args.tx - Optional transaction context
   * @returns The profile entity
   * @throws {NotFoundError} If the profile is not found
   */
  public async findByUserIdAndTenantIdOrThrow(args: {
    userId: string;
    tenantId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<Profile> {
    const profile = await this.findByUserIdAndTenantId(args);

    if (!profile) {
      throw new NotFoundError({
        message: `Profile not found for user ${args.userId} and tenant ${args.tenantId}`,
      });
    }

    return profile;
  }
}
