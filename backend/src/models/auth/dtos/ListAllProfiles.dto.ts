import { t, Static } from 'elysia';

/**
 * Query DTO for listing all profiles.
 */
export const ListAllProfilesQuerySchema = t.Object({
  includeDeleted: t.Optional(t.Boolean()),
  skip: t.Optional(t.Number({ minimum: 0 })),
  take: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
});

export type ListAllProfilesQuery = Static<typeof ListAllProfilesQuerySchema>;

/**
 * Response DTO for listing all profiles.
 */
export const ListAllProfilesResponseSchema = t.Object({
  profiles: t.Array(
    t.Object({
      id: t.String(),
      userId: t.String(),
      tenantId: t.String(),
      firstName: t.String(),
      lastName: t.String(),
      email: t.String(),
      balance: t.String(),
      createdAt: t.Date(),
      updatedAt: t.Date(),
      deletedAt: t.Optional(t.Nullable(t.Date())),
      user: t.Object({
        id: t.String(),
        username: t.String(),
        isMaster: t.Boolean(),
        createdAt: t.Date(),
        updatedAt: t.Date(),
        deletedAt: t.Optional(t.Nullable(t.Date())),
      }),
    }),
  ),
});

export type ListAllProfilesResponse = Static<typeof ListAllProfilesResponseSchema>;
