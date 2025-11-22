import { t, Static } from 'elysia';

/**
 * Response DTO for listing tenants by user.
 */
export const ListTenantsResponseSchema = t.Object({
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

export type ListTenantsResponse = Static<typeof ListTenantsResponseSchema>;
