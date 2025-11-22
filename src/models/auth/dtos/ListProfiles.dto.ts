import { t, Static } from 'elysia';

/**
 * Response DTO for listing profiles.
 */
export const ListProfilesResponseSchema = t.Object({
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

export type ListProfilesResponse = Static<typeof ListProfilesResponseSchema>;
