import { t, Static } from 'elysia';

/**
 * Query parameters DTO for listing ledger entries.
 */
export const ListLedgerEntriesQuerySchema = t.Object({
  status: t.Optional(t.Union([t.Literal('PENDING'), t.Literal('COMPLETED'), t.Literal('FAILED')])),
  type: t.Optional(t.Union([t.Literal('DEPOSIT'), t.Literal('WITHDRAWAL'), t.Literal('TRANSFER')])),
  dateFrom: t.Optional(t.Date()),
  dateTo: t.Optional(t.Date()),
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
});

export type ListLedgerEntriesQuery = Static<typeof ListLedgerEntriesQuerySchema>;

/**
 * Response DTO for listing ledger entries.
 */
export const ListLedgerEntriesResponseSchema = t.Object({
  entries: t.Array(
    t.Object({
      id: t.String(),
      tenantId: t.String(),
      tenantName: t.Optional(t.Nullable(t.String())),
      profileName: t.Optional(t.Nullable(t.String())),
      fromAccountId: t.Optional(t.Nullable(t.String())),
      toAccountId: t.Optional(t.Nullable(t.String())),
      amount: t.String(),
      type: t.String(),
      status: t.String(),
      createdBy: t.String(),
      createdAt: t.Date(),
      updatedBy: t.Optional(t.Nullable(t.String())),
      updatedAt: t.Date(),
    }),
  ),
  pagination: t.Object({
    total: t.Number(),
    page: t.Number(),
    limit: t.Number(),
    totalPages: t.Number(),
  }),
});

export type ListLedgerEntriesResponse = Static<typeof ListLedgerEntriesResponseSchema>;
