import { t, Static } from 'elysia';

/**
 * Request DTO for processing a payment refund.
 */
export const ProcessPaymentRefundRequestSchema = t.Object({
  tenantId: t.String({ minLength: 1 }),
  externalInvoiceId: t.String({ minLength: 1 }),
  fromAccountId: t.String({ minLength: 1 }),
  valueToRefund: t.Union([t.Number({ minimum: 0.01 }), t.String()]),
  reason: t.Optional(t.String()),
  createdBy: t.String({ minLength: 1 }),
});

export type ProcessPaymentRefundRequest = Static<typeof ProcessPaymentRefundRequestSchema>;

/**
 * Response DTO for processing a payment refund.
 */
export const ProcessPaymentRefundResponseSchema = t.Object({
  refund: t.Object({
    success: t.Boolean(),
    externalTransactionId: t.Optional(t.String()),
    refundedValue: t.String(),
  }),
  ledgerEntry: t.Object({
    id: t.String(),
    tenantId: t.String(),
    fromAccountId: t.String(),
    amount: t.String(),
    type: t.String(),
    status: t.String(),
    createdAt: t.Date(),
  }),
});

export type ProcessPaymentRefundResponse = Static<typeof ProcessPaymentRefundResponseSchema>;
