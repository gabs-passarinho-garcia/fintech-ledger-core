import { Prisma } from 'prisma/client';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

/**
 * Repository for creating refresh token entities.
 * Handles persistence of refresh tokens.
 */
export class CreateRefreshTokenRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Creates a new refresh token in the database.
   *
   * @param args - Creation parameters
   * @param args.token - The refresh token string
   * @param args.userId - The user ID
   * @param args.expiresAt - The expiration date
   * @param args.tx - Optional transaction context
   */
  public async create(args: {
    token: string;
    userId: string;
    expiresAt: Date;
    tx?: Prisma.TransactionClient;
  }): Promise<void> {
    const client = args.tx || this.prisma;

    await client.refreshToken.create({
      data: {
        token: args.token,
        userId: args.userId,
        expiresAt: args.expiresAt,
      },
    });
  }
}
