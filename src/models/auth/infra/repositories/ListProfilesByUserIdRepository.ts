import { Prisma } from 'prisma/client';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

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
 * Repository for listing profiles by user ID.
 * Handles data access for listing user profiles.
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
   * @returns Array of profile data
   */
  public async listByUserId(args: {
    userId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<ProfileData[]> {
    const client = args.tx || this.prisma;

    return await client.profile.findMany({
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
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
