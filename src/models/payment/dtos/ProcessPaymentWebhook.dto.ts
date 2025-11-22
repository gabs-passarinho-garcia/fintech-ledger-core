import { t, Static } from 'elysia';

/**
 * Request DTO for processing a payment webhook.
 */
export const ProcessPaymentWebhookRequestSchema = t.Object({
  tenantId: t.String({ minLength: 1 }),
  event: t.Unknown(),
  toAccountId: t.Optional(t.String()),
  updatedBy: t.String({ minLength: 1 }),
});

export type ProcessPaymentWebhookRequest = Static<typeof ProcessPaymentWebhookRequestSchema>;

/**
 * Response DTO for processing a payment webhook.
 */
export const ProcessPaymentWebhookResponseSchema = t.Object({
  webhook: t.Object({
    externalInvoiceId: t.String(),
    transactionType: t.Union([t.String(), t.Null()]),
    status: t.String(),
    amount: t.Number(),
  }),
  ledgerEntry: t.Optional(
    t.Object({
      id: t.String(),
      tenantId: t.String(),
      toAccountId: t.String(),
      amount: t.String(),
      type: t.String(),
      status: t.String(),
      createdAt: t.Date(),
    }),
  ),
});

export type ProcessPaymentWebhookResponse = Static<typeof ProcessPaymentWebhookResponseSchema>;
