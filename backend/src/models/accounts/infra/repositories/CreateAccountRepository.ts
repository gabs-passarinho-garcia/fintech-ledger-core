import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { ITransactionContext } from '@/common/adapters/ITransactionManager';
import { Account, AccountFactory } from '../../domain';

/**
 * Repository for creating account entities.
 * Handles persistence of Account entities.
 */
export class CreateAccountRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Creates a new account in the database.
   *
   * @param args - Creation parameters
   * @param args.account - The Account entity to persist
   * @param args.tx - Optional transaction context
   * @returns The created account entity
   */
  public async create(args: { account: Account; tx?: ITransactionContext }): Promise<Account> {
    const client = args.tx?.prisma || this.prisma;

    const created = await client.account.create({
      data: {
        id: args.account.id,
        tenantId: args.account.tenantId,
        profileId: args.account.profileId,
        name: args.account.name,
        balance: args.account.balance.toFixed(2),
        createdBy: args.account.createdBy,
        createdAt: args.account.createdAt,
        updatedAt: args.account.updatedAt,
        deletedAt: args.account.deletedAt,
      },
    });

    // Reconstruct entity from database data
    return AccountFactory.reconstruct({
      id: created.id,
      tenantId: created.tenantId,
      profileId: created.profileId,
      name: created.name,
      balance: created.balance,
      createdBy: created.createdBy,
      createdAt: created.createdAt,
      updatedBy: created.updatedBy,
      updatedAt: created.updatedAt,
      deletedBy: created.deletedBy,
      deletedAt: created.deletedAt,
    });
  }
}
