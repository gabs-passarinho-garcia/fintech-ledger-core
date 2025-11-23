import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { ITransactionContext } from '@/common/adapters/ITransactionManager';
import { Profile, ProfileFactory } from '../../domain';

/**
 * Repository for creating profile entities.
 * Handles persistence of Profile entities.
 */
export class CreateProfileRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Creates a new profile in the database.
   *
   * @param args - Creation parameters
   * @param args.profile - The Profile entity to persist
   * @param args.tx - Optional transaction context
   * @returns The created profile entity
   */
  public async create(args: { profile: Profile; tx?: ITransactionContext }): Promise<Profile> {
    const client = args.tx?.prisma || this.prisma;

    const created = await client.profile.create({
      data: {
        id: args.profile.id,
        userId: args.profile.userId,
        tenantId: args.profile.tenantId,
        firstName: args.profile.firstName,
        lastName: args.profile.lastName,
        email: args.profile.email,
        balance: args.profile.balance.toFixed(2),
        createdAt: args.profile.createdAt,
        updatedAt: args.profile.updatedAt,
        deletedAt: args.profile.deletedAt,
      },
    });

    // Reconstruct entity from database data
    return ProfileFactory.reconstruct({
      id: created.id,
      userId: created.userId,
      tenantId: created.tenantId,
      firstName: created.firstName,
      lastName: created.lastName,
      email: created.email,
      balance: created.balance,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      deletedAt: created.deletedAt,
    });
  }
}
