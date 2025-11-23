import { Prisma } from 'prisma/client';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { NotFoundError } from '@/common/errors';

export interface AccountData {
  id: string;
  tenantId: string;
  profileId: string | null;
  name: string;
  balance: Prisma.Decimal;
}

/**
 * Repository for retrieving account data.
 * Handles data access for account queries.
 */
export class GetAccountRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Finds an account by ID and tenant ID.
   *
   * @param args - Query parameters
   * @param args.accountId - The account ID
   * @param args.tenantId - The tenant ID for multi-tenancy isolation
   * @param args.tx - Optional transaction context
   * @returns The account data or null if not found
   */
  public async findById(args: {
    accountId: string;
    tenantId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<AccountData | null> {
    const client = args.tx || this.prisma;

    return await client.account.findFirst({
      where: {
        id: args.accountId,
        tenantId: args.tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        tenantId: true,
        profileId: true,
        name: true,
        balance: true,
      },
    });
  }

  /**
   * Finds an account by ID and tenant ID, throwing an error if not found.
   *
   * @param args - Query parameters
   * @param args.accountId - The account ID
   * @param args.tenantId - The tenant ID for multi-tenancy isolation
   * @param args.tx - Optional transaction context
   * @returns The account data
   * @throws {NotFoundError} If the account is not found
   */
  public async findByIdOrThrow(args: {
    accountId: string;
    tenantId: string;
    tx?: Prisma.TransactionClient;
  }): Promise<AccountData> {
    const account = await this.findById(args);

    if (!account) {
      throw new NotFoundError({
        message: `Account with ID ${args.accountId} not found for tenant ${args.tenantId}`,
      });
    }

    return account;
  }
}
