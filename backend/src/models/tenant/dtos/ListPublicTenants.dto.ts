import { t, Static } from 'elysia';

/**
 * Response DTO for listing public tenants.
 * Contains only id and name for public consumption.
 */
export const ListPublicTenantsResponseSchema = t.Object({
  tenants: t.Array(
    t.Object({
      id: t.String(),
      name: t.String(),
    }),
  ),
});

export type ListPublicTenantsResponse = Static<typeof ListPublicTenantsResponseSchema>;
