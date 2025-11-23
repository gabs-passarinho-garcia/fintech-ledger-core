import { t, Static } from 'elysia';

/**
 * Query parameters DTO for listing all ledger entries (admin).
 */
export const ListAllLedgerEntriesQuerySchema = t.Object({
  status: t.Optional(t.Union([t.Literal('PENDING'), t.Literal('COMPLETED'), t.Literal('FAILED')])),
  type: t.Optional(t.Union([t.Literal('DEPOSIT'), t.Literal('WITHDRAWAL'), t.Literal('TRANSFER')])),
  dateFrom: t.Optional(t.Date()),
  dateTo: t.Optional(t.Date()),
  tenantId: t.Optional(t.String()),
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
  includeDeleted: t.Optional(t.Boolean()),
});

export type ListAllLedgerEntriesQuery = Static<typeof ListAllLedgerEntriesQuerySchema>;

/**
 * Response DTO for listing all ledger entries (admin).
 */
export const ListAllLedgerEntriesResponseSchema = t.Object({
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
      deletedBy: t.Optional(t.Nullable(t.String())),
      deletedAt: t.Optional(t.Nullable(t.Date())),
    }),
  ),
  pagination: t.Object({
    total: t.Number(),
    page: t.Number(),
    limit: t.Number(),
    totalPages: t.Number(),
  }),
});

export type ListAllLedgerEntriesResponse = Static<typeof ListAllLedgerEntriesResponseSchema>;
