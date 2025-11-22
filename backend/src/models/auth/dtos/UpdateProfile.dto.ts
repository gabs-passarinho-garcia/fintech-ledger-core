import { t, Static } from 'elysia';

/**
 * Request DTO for updating a profile (body only).
 */
export const UpdateProfileRequestSchema = t.Object({
  firstName: t.Optional(t.String({ minLength: 1 })),
  lastName: t.Optional(t.String({ minLength: 1 })),
  email: t.Optional(t.String({ format: 'email' })),
});

export type UpdateProfileRequest = Static<typeof UpdateProfileRequestSchema>;

/**
 * Combined input type for UpdateProfile use case.
 * Includes profileId from path param and fields from request body.
 */
export type UpdateProfileInput = UpdateProfileRequest & {
  profileId: string;
};

/**
 * Response DTO for updating a profile.
 */
export const UpdateProfileResponseSchema = t.Object({
  id: t.String(),
  userId: t.String(),
  tenantId: t.String(),
  firstName: t.String(),
  lastName: t.String(),
  email: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type UpdateProfileResponse = Static<typeof UpdateProfileResponseSchema>;
