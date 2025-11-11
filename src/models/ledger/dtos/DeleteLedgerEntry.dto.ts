import { t, Static } from 'elysia';

/**
 * Response DTO for deleting a ledger entry.
 */
export const DeleteLedgerEntryResponseSchema = t.Object({
  id: t.String(),
  deletedAt: t.Date(),
  deletedBy: t.String(),
});

export type DeleteLedgerEntryResponse = Static<typeof DeleteLedgerEntryResponseSchema>;
