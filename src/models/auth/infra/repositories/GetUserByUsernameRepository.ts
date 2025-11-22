import { Prisma } from 'prisma/client';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

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
 * Repository for retrieving user data by username.
 * Handles data access for user queries by username.
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
   * @returns The user data or null if not found
   */
  public async findByUsername(args: {
    username: string;
    tx?: Prisma.TransactionClient;
  }): Promise<UserData | null> {
    const client = args.tx || this.prisma;

    return await client.user.findFirst({
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
  }
}
