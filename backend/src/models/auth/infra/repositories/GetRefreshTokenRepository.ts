import { Prisma } from 'prisma/client';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

export interface RefreshTokenData {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date | null;
}

/**
 * Repository for retrieving refresh token data.
 * Handles data access for refresh token queries.
 */
export class GetRefreshTokenRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Finds a refresh token by token string and user ID.
   *
   * @param args - Query parameters
   * @param args.token - The refresh token string
   * @param args.userId - The user ID
   * @param args.tx - Optional transaction context
   * @returns The refresh token data or null if not found
   */
  public async findByToken(args: {
    token: string;
    userId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<RefreshTokenData | null> {
    const client = args.tx || this.prisma;

    return await client.refreshToken.findFirst({
      where: {
        token: args.token,
        userId: args.userId,
      },
      select: {
        id: true,
        token: true,
        userId: true,
        expiresAt: true,
        createdAt: true,
        revokedAt: true,
      },
    });
  }
}
