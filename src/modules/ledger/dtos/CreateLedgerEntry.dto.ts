import { t, Static } from 'elysia';

/**
 * Request DTO for creating a ledger entry.
 */
export const CreateLedgerEntryRequestSchema = t.Object({
  tenantId: t.String({ minLength: 1 }),
  fromAccountId: t.Optional(t.Nullable(t.String())),
  toAccountId: t.Optional(t.Nullable(t.String())),
  amount: t.Union([t.Number({ minimum: 0.01 }), t.String()]),
  type: t.Union([t.Literal('DEPOSIT'), t.Literal('WITHDRAWAL'), t.Literal('TRANSFER')]),
  createdBy: t.String({ minLength: 1 }),
});

export type CreateLedgerEntryRequest = Static<typeof CreateLedgerEntryRequestSchema>;

/**
 * Response DTO for creating a ledger entry.
 */
export const CreateLedgerEntryResponseSchema = t.Object({
  id: t.String(),
  tenantId: t.String(),
  fromAccountId: t.Optional(t.Nullable(t.String())),
  toAccountId: t.Optional(t.Nullable(t.String())),
  amount: t.String(),
  type: t.String(),
  status: t.String(),
  createdAt: t.Date(),
});

export type CreateLedgerEntryResponse = Static<typeof CreateLedgerEntryResponseSchema>;
