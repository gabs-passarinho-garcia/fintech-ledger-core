import { Static, t } from 'elysia';

/**
 * Schema for Bearer token authentication headers.
 * Validates authorization header with Bearer token and required tenant ID.
 */
export const TokenAuthSchema = t.Object({
  authorization: t.String({
    pattern: 'Bearer\\s+[A-Za-z0-9_-]+',
    error: 'Invalid authorization header',
  }),
  'x-tenant-id': t.String({
    format: 'uuid',
    error: 'Invalid tenant id',
  }),
  'x-correlation-id': t.Optional(t.String()),
});

export type TokenAuthDto = Static<typeof TokenAuthSchema>;

/**
 * Schema for API key authentication headers.
 * Validates API key header with optional user and tenant IDs.
 */
export const KeyAuthSchema = t.Object({
  'x-api-key': t.String({
    error: 'Api key is required',
  }),
  'x-correlation-id': t.Optional(t.String()),
  'x-user-id': t.Optional(t.String({ format: 'uuid' })),
  'x-tenant-id': t.Optional(t.String({ format: 'uuid' })),
});

export type KeyAuthDto = Static<typeof KeyAuthSchema>;
