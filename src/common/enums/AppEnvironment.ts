/**
 * Application environment constants
 * Defines the possible environments for the application
 */
export const AppEnvironment = {
  DEVELOPMENT: 'dev',
  PRODUCTION: 'prod',
  TEST: 'test',
  STAGING: 'stage',
  LOCAL: 'local',
} as const;

/**
 * Local development flag
 * Indicates if running in local development environment (with LocalStack)
 */
export const LOCAL_DEVELOPMENT = 'LOCAL_DEVELOPMENT';

/**
 * Type representing all possible application environment values
 */
export type AppEnvironmentType = (typeof AppEnvironment)[keyof typeof AppEnvironment];
