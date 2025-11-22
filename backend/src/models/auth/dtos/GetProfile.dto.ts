import { t, Static } from 'elysia';

/**
 * Response DTO for getting a profile.
 */
export const GetProfileResponseSchema = t.Object({
  id: t.String(),
  userId: t.String(),
  tenantId: t.String(),
  firstName: t.String(),
  lastName: t.String(),
  email: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type GetProfileResponse = Static<typeof GetProfileResponseSchema>;

/**
 * Input type for GetProfile use case.
 * Includes profileId from path param.
 */
export type GetProfileInput = {
  profileId: string;
};
