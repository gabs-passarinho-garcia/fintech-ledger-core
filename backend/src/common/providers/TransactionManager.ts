import type { PrismaHandler } from './PrismaHandler';
import type { ITransactionManager, ITransactionContext } from '../adapters/ITransactionManager';
import { AppProviders } from '../interfaces/IAppContainer';

/**
 * PrismaTransactionManager implements transaction management using Prisma's transaction API.
 * Provides a clean interface for executing operations within database transactions.
 */
export class PrismaTransactionManager implements ITransactionManager {
  private readonly prisma: PrismaHandler;

  /**
   * Creates a new PrismaTransactionManager instance.
   *
   * @param opts - Dependency injection options
   * @param opts.prisma - The PrismaHandler instance to use for transactions
   */
  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts[AppProviders.prisma];
  }

  /**
   * Executes a function within a database transaction.
   * If an existing transaction context is provided, the function is executed within that context.
   * Otherwise, a new transaction is started.
   *
   * @template T The return type of the function
   * @param fn The function to execute within the transaction
   * @param options Optional configuration for the transaction
   * @param options.timeout Optional timeout in milliseconds
   * @param options.ctx Optional existing transaction context to reuse
   * @returns A promise that resolves to the result of the function
   */
  public async runInTransaction<T>(
    fn: (ctx: ITransactionContext) => Promise<T>,
    options?: {
      timeout?: number;
      ctx?: ITransactionContext;
    },
  ): Promise<T> {
    if (options?.ctx) {
      return await fn(options.ctx);
    }

    return this.prisma.$transaction(
      async (transactionClient) => {
        const context: ITransactionContext = { prisma: transactionClient };
        return await fn(context);
      },
      { timeout: options?.timeout },
    );
  }
}
