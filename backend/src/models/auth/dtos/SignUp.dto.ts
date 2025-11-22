import { t, Static } from 'elysia';

/**
 * Request DTO for signing up.
 */
export const SignUpRequestSchema = t.Object({
  username: t.String({ minLength: 1 }),
  password: t.String({ minLength: 1 }),
  email: t.String({ format: 'email' }),
  firstName: t.String({ minLength: 1 }),
  lastName: t.String({ minLength: 1 }),
  tenantId: t.Optional(t.String({ minLength: 1 })),
});

export type SignUpRequest = Static<typeof SignUpRequestSchema>;

/**
 * Response DTO for signing up.
 */
export const SignUpResponseSchema = t.Object({
  user: t.Object({
    id: t.String(),
    username: t.String(),
    createdAt: t.Date(),
  }),
  profile: t.Optional(
    t.Object({
      id: t.String(),
      userId: t.String(),
      tenantId: t.String(),
      firstName: t.String(),
      lastName: t.String(),
      email: t.String(),
      createdAt: t.Date(),
    }),
  ),
});

export type SignUpResponse = Static<typeof SignUpResponseSchema>;
