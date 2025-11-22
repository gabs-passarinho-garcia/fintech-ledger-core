import { t, Static } from 'elysia';

/**
 * Response DTO for deleting a profile.
 */
export const DeleteProfileResponseSchema = t.Object({
  success: t.Boolean(),
});

export type DeleteProfileResponse = Static<typeof DeleteProfileResponseSchema>;

/**
 * Input type for DeleteProfile use case.
 * Includes profileId from path param.
 */
export type DeleteProfileInput = {
  profileId: string;
};
