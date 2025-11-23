import { t, Static } from 'elysia';

/**
 * Request DTO for signing in.
 */
export const SignInRequestSchema = t.Object({
  username: t.String({ minLength: 1 }),
  password: t.String({ minLength: 1 }),
});

export type SignInRequest = Static<typeof SignInRequestSchema>;

/**
 * Response DTO for signing in.
 */
export const SignInResponseSchema = t.Object({
  accessToken: t.Optional(t.String()),
  refreshToken: t.Optional(t.String()),
  expiresIn: t.Optional(t.Number()),
  tokenType: t.Optional(t.String()),
  userEmail: t.Optional(t.String()),
  username: t.String(),
  status: t.String(),
});

export type SignInResponse = Static<typeof SignInResponseSchema>;
