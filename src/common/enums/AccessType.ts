/**
 * Access type enum for session authentication.
 * Defines the different ways a user can access the system.
 */
export const AccessType = {
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
  API_KEY: 'API_KEY',
  AUTH_USER: 'AUTH_USER',
} as const;

export type AccessType = (typeof AccessType)[keyof typeof AccessType];
