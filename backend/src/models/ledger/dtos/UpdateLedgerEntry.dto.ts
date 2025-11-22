import { t, Static } from 'elysia';

/**
 * Request DTO for updating a ledger entry.
 */
export const UpdateLedgerEntryRequestSchema = t.Object({
  status: t.Union([t.Literal('PENDING'), t.Literal('COMPLETED'), t.Literal('FAILED')]),
});

export type UpdateLedgerEntryRequest = Static<typeof UpdateLedgerEntryRequestSchema>;

/**
 * Response DTO for updating a ledger entry.
 */
export const UpdateLedgerEntryResponseSchema = t.Object({
  id: t.String(),
  tenantId: t.String(),
  fromAccountId: t.Optional(t.Nullable(t.String())),
  toAccountId: t.Optional(t.Nullable(t.String())),
  amount: t.String(),
  type: t.String(),
  status: t.String(),
  createdBy: t.String(),
  createdAt: t.Date(),
  updatedBy: t.Optional(t.Nullable(t.String())),
  updatedAt: t.Date(),
});

export type UpdateLedgerEntryResponse = Static<typeof UpdateLedgerEntryResponseSchema>;
