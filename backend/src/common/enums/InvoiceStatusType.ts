/**
 * Invoice status types for payment processing.
 */
export const InvoiceStatusType = {
  OPEN: 'OPEN',
  PAID: 'PAID',
  PARTIAL: 'PARTIAL',
  CANCELED: 'CANCELED',
  EXPIRED: 'EXPIRED',
} as const;

/**
 * Type representing an invoice status identifier.
 */
export type InvoiceStatusType = (typeof InvoiceStatusType)[keyof typeof InvoiceStatusType];
