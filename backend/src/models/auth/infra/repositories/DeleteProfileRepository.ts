import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { ITransactionContext } from '@/common/adapters/ITransactionManager';

/**
 * Repository for soft deleting profile entities.
 * Handles soft deletion of profiles by setting deletedAt.
 */
export class DeleteProfileRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Soft deletes a profile by setting deletedAt timestamp.
   *
   * @param args - Delete parameters
   * @param args.profileId - The profile ID to delete
   * @param args.tx - Optional transaction context
   */
  public async delete(args: { profileId: string; tx?: ITransactionContext }): Promise<void> {
    const client = args.tx?.prisma || this.prisma;

    await client.profile.updateMany({
      where: {
        id: args.profileId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
