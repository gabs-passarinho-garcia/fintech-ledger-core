import { t, Static } from 'elysia';

/**
 * Response DTO for deleting a user.
 */
export const DeleteUserResponseSchema = t.Object({
  success: t.Boolean(),
});

export type DeleteUserResponse = Static<typeof DeleteUserResponseSchema>;

/**
 * Input type for DeleteUser use case.
 * The userId comes from the authenticated session (DELETE /users/me).
 */
export type DeleteUserInput = {
  userId: string;
};
