import { Prisma } from 'prisma/client';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

/**
 * Repository for revoking refresh tokens.
 * Handles revocation of refresh tokens.
 */
export class DeleteRefreshTokenRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Revokes a refresh token by setting revokedAt timestamp.
   *
   * @param args - Revocation parameters
   * @param args.token - The refresh token string
   * @param args.tx - Optional transaction context
   */
  public async revoke(args: { token: string; tx?: Prisma.TransactionClient }): Promise<void> {
    const client = args.tx || this.prisma;

    await client.refreshToken.updateMany({
      where: {
        token: args.token,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
