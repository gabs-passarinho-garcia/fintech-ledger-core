import { Prisma } from 'prisma/client';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { NotFoundError } from '@/common/errors';
import { User, UserFactory } from '../../domain';

/**
 * Repository for retrieving user entities.
 * Handles data access for user queries and returns domain entities.
 */
export class GetUserRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Finds a user by ID.
   *
   * @param args - Query parameters
   * @param args.userId - The user ID
   * @param args.tx - Optional transaction context
   * @returns The user entity or null if not found
   */
  public async findById(args: {
    userId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<User | null> {
    const client = args.tx || this.prisma;

    const userData = await client.user.findFirst({
      where: {
        id: args.userId,
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

  /**
   * Finds a user by ID, throwing an error if not found.
   *
   * @param args - Query parameters
   * @param args.userId - The user ID
   * @param args.tx - Optional transaction context
   * @returns The user entity
   * @throws {NotFoundError} If the user is not found
   */
  public async findByIdOrThrow(args: {
    userId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<User> {
    const user = await this.findById(args);

    if (!user) {
      throw new NotFoundError({
        message: `User with ID ${args.userId} not found`,
      });
    }

    return user;
  }
}
