import { Prisma } from 'prisma/client';

/**
 * Interface for transaction management.
 * Provides methods to execute operations within database transactions.
 */
export interface ITransactionManager {
  /**
   * Executes a function within a database transaction.
   *
   * @template T The return type of the function
   * @param fn The function to execute within the transaction
   * @param options Optional configuration for the transaction
   * @param options.timeout Optional timeout in milliseconds
   * @param options.ctx Optional existing transaction context to reuse
   * @returns A promise that resolves to the result of the function
   */
  runInTransaction<T>(
    fn: (ctx: ITransactionContext) => Promise<T>,
    options?: {
      timeout?: number;
      ctx?: ITransactionContext;
    },
  ): Promise<T>;
}

/**
 * Transaction context containing the Prisma transaction client.
 */
export interface ITransactionContext {
  prisma: Prisma.TransactionClient;
}
