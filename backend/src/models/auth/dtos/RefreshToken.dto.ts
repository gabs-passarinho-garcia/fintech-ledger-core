import { t, Static } from 'elysia';

/**
 * Request DTO for refreshing a token.
 */
export const RefreshTokenRequestSchema = t.Object({
  refreshToken: t.String({ minLength: 1 }),
  username: t.String({ minLength: 1 }),
});

export type RefreshTokenRequest = Static<typeof RefreshTokenRequestSchema>;

/**
 * Response DTO for refreshing a token.
 */
export const RefreshTokenResponseSchema = t.Object({
  accessToken: t.Optional(t.String()),
  refreshToken: t.Optional(t.String()),
  expiresIn: t.Optional(t.Number()),
  tokenType: t.Optional(t.String()),
  userEmail: t.Optional(t.String()),
  username: t.String(),
  status: t.String(),
});

export type RefreshTokenResponse = Static<typeof RefreshTokenResponseSchema>;
