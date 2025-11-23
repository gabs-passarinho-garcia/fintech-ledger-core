import { t, Static } from 'elysia';

/**
 * Query DTO for listing profiles by tenant.
 */
export const ListProfilesByTenantQuerySchema = t.Object({
  tenantId: t.String({ minLength: 1 }),
});

export type ListProfilesByTenantQuery = Static<typeof ListProfilesByTenantQuerySchema>;

/**
 * Response DTO for listing profiles by tenant.
 */
export const ListProfilesByTenantResponseSchema = t.Object({
  profiles: t.Array(
    t.Object({
      id: t.String(),
      userId: t.String(),
      tenantId: t.String(),
      firstName: t.String(),
      lastName: t.String(),
      email: t.String(),
      createdAt: t.Date(),
      updatedAt: t.Date(),
    }),
  ),
});

export type ListProfilesByTenantResponse = Static<typeof ListProfilesByTenantResponseSchema>;
