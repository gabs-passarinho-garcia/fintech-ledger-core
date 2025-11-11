import { Prisma } from 'prisma/client';
import { Decimal } from 'decimal.js';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { DomainError } from '@/common/errors';

/**
 * Repository for updating account balances.
 * Handles balance updates within transactions for atomic operations.
 */
export class UpdateAccountBalanceRepository {
  // PrismaHandler is kept for consistency but not used directly
  // All operations use the transaction client passed as parameter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public constructor(_opts: { [AppProviders.prisma]: PrismaHandler }) {
    // Constructor intentionally empty - all operations use transaction client
  }

  /**
   * Debits an amount from an account balance.
   *
   * @param args - Update parameters
   * @param args.accountId - The account ID
   * @param args.tenantId - The tenant ID for multi-tenancy isolation
   * @param args.amount - The amount to debit
   * @param args.tx - Transaction context (required for atomic operations)
   * @returns The updated balance
   * @throws {DomainError} If the account has insufficient balance
   */
  public async debit(args: {
    accountId: string;
    tenantId: string;
    amount: Decimal;
    tx: Prisma.TransactionClient;
  }): Promise<Decimal> {
    const account = await args.tx.account.findFirst({
      where: {
        id: args.accountId,
        tenantId: args.tenantId,
        deletedAt: null,
      },
    });

    if (!account) {
      throw new DomainError({
        message: `Account with ID ${args.accountId} not found`,
      });
    }

    const currentBalance = new Decimal(account.balance.toString());
    const newBalance = currentBalance.minus(args.amount);

    if (newBalance.lessThan(0)) {
      throw new DomainError({
        message: `Insufficient balance. Current: ${currentBalance.toString()}, Required: ${args.amount.toString()}`,
      });
    }

    await args.tx.account.update({
      where: { id: args.accountId },
      data: {
        balance: newBalance.toNumber(),
        updatedAt: new Date(),
      },
    });

    return newBalance;
  }

  /**
   * Credits an amount to an account balance.
   *
   * @param args - Update parameters
   * @param args.accountId - The account ID
   * @param args.tenantId - The tenant ID for multi-tenancy isolation
   * @param args.amount - The amount to credit
   * @param args.tx - Transaction context (required for atomic operations)
   * @returns The updated balance
   */
  public async credit(args: {
    accountId: string;
    tenantId: string;
    amount: Decimal;
    tx: Prisma.TransactionClient;
  }): Promise<Decimal> {
    const account = await args.tx.account.findFirst({
      where: {
        id: args.accountId,
        tenantId: args.tenantId,
        deletedAt: null,
      },
    });

    if (!account) {
      throw new DomainError({
        message: `Account with ID ${args.accountId} not found`,
      });
    }

    const currentBalance = new Decimal(account.balance.toString());
    const newBalance = currentBalance.plus(args.amount);

    await args.tx.account.update({
      where: { id: args.accountId },
      data: {
        balance: newBalance.toNumber(),
        updatedAt: new Date(),
      },
    });

    return newBalance;
  }
}
