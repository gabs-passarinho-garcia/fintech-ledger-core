import { Prisma } from 'prisma/client';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { NotFoundError } from '@/common/errors';

export interface UserData {
  id: string;
  username: string;
  passwordHash: string;
  isMaster: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * Repository for retrieving user data.
 * Handles data access for user queries.
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
   * @returns The user data or null if not found
   */
  public async findById(args: {
    userId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<UserData | null> {
    const client = args.tx || this.prisma;

    return await client.user.findFirst({
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
  }

  /**
   * Finds a user by ID, throwing an error if not found.
   *
   * @param args - Query parameters
   * @param args.userId - The user ID
   * @param args.tx - Optional transaction context
   * @returns The user data
   * @throws {NotFoundError} If the user is not found
   */
  public async findByIdOrThrow(args: {
    userId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<UserData> {
    const user = await this.findById(args);

    if (!user) {
      throw new NotFoundError({
        message: `User with ID ${args.userId} not found`,
      });
    }

    return user;
  }
}
