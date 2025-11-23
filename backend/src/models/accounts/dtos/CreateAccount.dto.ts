import { t, Static } from 'elysia';

export const CreateAccountRequestSchema = t.Object({
  tenantId: t.String({ minLength: 1 }),
  profileId: t.String({ minLength: 1 }),
  name: t.String({ minLength: 2, maxLength: 255 }),
  initialBalance: t.Optional(t.Union([t.String(), t.Number()])),
});

export type CreateAccountRequest = Static<typeof CreateAccountRequestSchema>;

export const CreateAccountResponseSchema = t.Object({
  id: t.String(),
  tenantId: t.String(),
  profileId: t.Nullable(t.String()),
  name: t.String(),
  balance: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type CreateAccountResponse = Static<typeof CreateAccountResponseSchema>;
