import { Prisma } from 'prisma/client';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { NotFoundError } from '@/common/errors';

export interface ProfileData {
  id: string;
  userId: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * Repository for retrieving profile data.
 * Handles data access for profile queries.
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
   * @returns The profile data or null if not found
   */
  public async findById(args: {
    profileId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<ProfileData | null> {
    const client = args.tx || this.prisma;

    return await client.profile.findFirst({
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
  }

  /**
   * Finds a profile by user ID and tenant ID.
   *
   * @param args - Query parameters
   * @param args.userId - The user ID
   * @param args.tenantId - The tenant ID
   * @param args.tx - Optional transaction context
   * @returns The profile data or null if not found
   */
  public async findByUserIdAndTenantId(args: {
    userId: string;
    tenantId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<ProfileData | null> {
    const client = args.tx || this.prisma;

    return await client.profile.findFirst({
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
  }

  /**
   * Finds a profile by user ID and tenant ID, throwing an error if not found.
   *
   * @param args - Query parameters
   * @param args.userId - The user ID
   * @param args.tenantId - The tenant ID
   * @param args.tx - Optional transaction context
   * @returns The profile data
   * @throws {NotFoundError} If the profile is not found
   */
  public async findByUserIdAndTenantIdOrThrow(args: {
    userId: string;
    tenantId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<ProfileData> {
    const profile = await this.findByUserIdAndTenantId(args);

    if (!profile) {
      throw new NotFoundError({
        message: `Profile not found for user ${args.userId} and tenant ${args.tenantId}`,
      });
    }

    return profile;
  }
}
