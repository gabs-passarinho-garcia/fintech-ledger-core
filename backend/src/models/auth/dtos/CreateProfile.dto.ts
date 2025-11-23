import { t, Static } from 'elysia';

/**
 * Request DTO for creating a profile.
 */
export const CreateProfileRequestSchema = t.Object({
  firstName: t.String({ minLength: 1 }),
  lastName: t.String({ minLength: 1 }),
  email: t.String({ format: 'email' }),
  tenantId: t.String({ minLength: 1 }),
});

export type CreateProfileRequest = Static<typeof CreateProfileRequestSchema>;

/**
 * Response DTO for creating a profile.
 */
export const CreateProfileResponseSchema = t.Object({
  id: t.String(),
  userId: t.String(),
  tenantId: t.String(),
  firstName: t.String(),
  lastName: t.String(),
  email: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type CreateProfileResponse = Static<typeof CreateProfileResponseSchema>;
