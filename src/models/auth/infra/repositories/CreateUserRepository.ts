import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { ITransactionContext } from '@/common/adapters/ITransactionManager';
import { User, UserFactory } from '../../domain';

/**
 * Repository for creating user entities.
 * Handles persistence of User entities.
 */
export class CreateUserRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Creates a new user in the database.
   *
   * @param args - Creation parameters
   * @param args.user - The User entity to persist
   * @param args.tx - Optional transaction context
   * @returns The created user entity
   */
  public async create(args: { user: User; tx?: ITransactionContext }): Promise<User> {
    const client = args.tx?.prisma || this.prisma;

    const created = await client.user.create({
      data: {
        id: args.user.id,
        username: args.user.username,
        passwordHash: args.user.passwordHash,
        isMaster: args.user.isMaster,
        createdAt: args.user.createdAt,
        updatedAt: args.user.updatedAt,
        deletedAt: args.user.deletedAt,
      },
    });

    // Reconstruct entity from database data
    return UserFactory.reconstruct({
      id: created.id,
      username: created.username,
      passwordHash: created.passwordHash,
      isMaster: created.isMaster,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      deletedAt: created.deletedAt,
    });
  }
}
