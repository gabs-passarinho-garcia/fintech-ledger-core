import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { ITransactionContext } from '@/common/adapters/ITransactionManager';

/**
 * Repository for soft deleting user entities.
 * Handles soft deletion of users and all their associated profiles.
 */
export class DeleteUserRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Soft deletes a user and all their profiles by setting deletedAt timestamp.
   * This operation should be executed within a transaction to ensure atomicity.
   *
   * @param args - Delete parameters
   * @param args.userId - The user ID to delete
   * @param args.tx - Optional transaction context (recommended for atomicity)
   */
  public async delete(args: { userId: string; tx?: ITransactionContext }): Promise<void> {
    const client = args.tx?.prisma || this.prisma;
    const now = new Date();

    // Soft delete all profiles first
    await client.profile.updateMany({
      where: {
        userId: args.userId,
        deletedAt: null,
      },
      data: {
        deletedAt: now,
      },
    });

    // Soft delete the user
    await client.user.updateMany({
      where: {
        id: args.userId,
        deletedAt: null,
      },
      data: {
        deletedAt: now,
      },
    });
  }
}
