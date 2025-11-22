import { t, Static } from 'elysia';

/**
 * Query DTO for listing all tenants.
 */
export const ListAllTenantsQuerySchema = t.Object({
  includeDeleted: t.Optional(t.Boolean()),
  skip: t.Optional(t.Number({ minimum: 0 })),
  take: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
});

export type ListAllTenantsQuery = Static<typeof ListAllTenantsQuerySchema>;

/**
 * Response DTO for listing all tenants.
 */
export const ListAllTenantsResponseSchema = t.Object({
  tenants: t.Array(
    t.Object({
      id: t.String(),
      name: t.String(),
      createdBy: t.String(),
      createdAt: t.Date(),
      updatedBy: t.Optional(t.Nullable(t.String())),
      updatedAt: t.Date(),
      deletedBy: t.Optional(t.Nullable(t.String())),
      deletedAt: t.Optional(t.Nullable(t.Date())),
    }),
  ),
});

export type ListAllTenantsResponse = Static<typeof ListAllTenantsResponseSchema>;
