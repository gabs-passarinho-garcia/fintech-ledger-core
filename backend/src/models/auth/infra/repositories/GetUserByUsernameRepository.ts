import { Prisma } from 'prisma/client';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { User, UserFactory } from '../../domain';

/**
 * Repository for retrieving user entities by username.
 * Handles data access for user queries by username and returns domain entities.
 */
export class GetUserByUsernameRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Finds a user by username.
   *
   * @param args - Query parameters
   * @param args.username - The username
   * @param args.tx - Optional transaction context
   * @returns The user entity or null if not found
   */
  public async findByUsername(args: {
    username: string;
    tx?: Prisma.TransactionClient;
  }): Promise<User | null> {
    const client = args.tx || this.prisma;

    const userData = await client.user.findFirst({
      where: {
        username: args.username,
        deletedAt: null,
      },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        isMaster: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    if (!userData) {
      return null;
    }

    return UserFactory.reconstruct({
      id: userData.id,
      username: userData.username,
      passwordHash: userData.passwordHash,
      isMaster: userData.isMaster,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      deletedAt: userData.deletedAt,
    });
  }
}
