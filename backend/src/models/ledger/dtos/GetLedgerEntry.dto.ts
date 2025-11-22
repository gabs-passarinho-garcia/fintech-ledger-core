import { t, Static } from 'elysia';

/**
 * Request DTO for getting a ledger entry by ID.
 */
export const GetLedgerEntryRequestSchema = t.Object({
  id: t.String({ minLength: 1 }),
});

export type GetLedgerEntryRequest = Static<typeof GetLedgerEntryRequestSchema>;

/**
 * Response DTO for getting a ledger entry.
 */
export const GetLedgerEntryResponseSchema = t.Object({
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

export type GetLedgerEntryResponse = Static<typeof GetLedgerEntryResponseSchema>;
