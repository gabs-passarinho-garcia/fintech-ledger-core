import { t, Static } from 'elysia';
import { PaymentMethodType } from '@/common/enums/PaymentMethodType';

/**
 * Request DTO for processing a payment.
 */
export const ProcessPaymentRequestSchema = t.Object({
  tenantId: t.String({ minLength: 1 }),
  toAccountId: t.String({ minLength: 1 }),
  amount: t.Union([t.Number({ minimum: 0.01 }), t.String()]),
  paymentMethodType: t.Enum(PaymentMethodType),
  description: t.Optional(t.String()),
  metadata: t.Optional(t.Record(t.String(), t.Any())),
  createdBy: t.String({ minLength: 1 }),
});

export type ProcessPaymentRequest = Static<typeof ProcessPaymentRequestSchema>;

/**
 * Response DTO for processing a payment.
 */
export const ProcessPaymentResponseSchema = t.Object({
  payment: t.Object({
    externalInvoiceId: t.String(),
    status: t.String(),
    provider: t.String(),
    tax: t.Optional(t.String()),
    providerMessage: t.Optional(t.String()),
    pix: t.Optional(
      t.Object({
        token: t.String(),
        expiresAt: t.String(),
        qrCodeUrl: t.String(),
        copyAndPaste: t.Optional(t.String()),
      }),
    ),
  }),
  ledgerEntry: t.Object({
    id: t.String(),
    tenantId: t.String(),
    toAccountId: t.String(),
    amount: t.String(),
    type: t.String(),
    status: t.String(),
    createdAt: t.Date(),
  }),
});

export type ProcessPaymentResponse = Static<typeof ProcessPaymentResponseSchema>;
