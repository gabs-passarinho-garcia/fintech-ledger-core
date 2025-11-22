/**
 * Payment provider types available in the system.
 * Each provider represents a different payment gateway implementation.
 */
export const Providers = {
  MOCK: 'MOCK',
  STRIPE: 'STRIPE',
  SAFE_2_PAY: 'SAFE_2_PAY',
  STONE: 'STONE',
} as const;

/**
 * Type representing a payment provider identifier.
 */
export type Providers = (typeof Providers)[keyof typeof Providers];
