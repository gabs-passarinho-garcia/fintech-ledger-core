/**
 * Transaction types for payment operations.
 */
export const TransactionType = {
  /**
   * PAYMENT — payment executed
   */
  PAYMENT: 'PAYMENT',

  /**
   * REFUND — payment refund
   */
  REFUND: 'REFUND',
} as const;

/**
 * Type representing a transaction type identifier.
 */
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];
