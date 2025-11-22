import { Prisma } from 'prisma/client';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

/**
 * Repository for updating user passwords.
 * Handles password updates for user entities.
 */
export class UpdateUserPasswordRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Updates a user's password.
   *
   * @param args - Update parameters
   * @param args.userId - The user ID
   * @param args.passwordHash - The new password hash
   * @param args.tx - Optional transaction context
   */
  public async update(args: {
    userId: string;
    passwordHash: string;
    tx?: Prisma.TransactionClient;
  }): Promise<void> {
    const client = args.tx || this.prisma;

    await client.user.update({
      where: {
        id: args.userId,
      },
      data: {
        passwordHash: args.passwordHash,
        updatedAt: new Date(),
      },
    });
  }
}
