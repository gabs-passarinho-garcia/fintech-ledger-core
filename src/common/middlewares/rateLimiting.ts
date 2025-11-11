import { Elysia } from 'elysia';

/**
 * Server interface for rate limiting key generation
 */
type ServerContext = {
  requestIP?: (request: Request) => { address?: string } | null;
} | null;

/**
 * Rate limiting configuration interface compatible with elysia-rate-limit
 */
interface RateLimitConfig {
  /** Maximum number of requests per window */
  max: number;
  /** Time window in milliseconds */
  duration: number;
  /** Custom message for rate limit exceeded */
  message?: string;
  /** Skip rate limiting for certain conditions */
  skip?: (request: Request) => boolean;
  /** Custom key generator for rate limiting */
  keyGenerator?: (request: Request) => string;
}

/**
 * Default key generator using IP address with proxy support
 * @param request - The incoming request
 * @param server - The server instance
 * @returns Rate limiting key
 */
const defaultKeyGenerator = (request: Request, server: ServerContext): string => {
  // Try to get real IP from common proxy headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  // Use the first available IP, fallback to server IP or 'unknown'
  return (
    forwarded?.split(',')[0]?.trim() ||
    realIp ||
    cfConnectingIp ||
    (server && typeof server === 'object' && 'requestIP' in server
      ? server.requestIP?.(request)?.address
      : null) ||
    'unknown'
  );
};

/**
 * Create a rate limiting middleware for Elysia using elysia-rate-limit
 * @param config - Rate limiting configuration
 * @returns Elysia plugin
 */
export async function rateLimit(config: RateLimitConfig): Promise<Elysia> {
  const {
    max,
    duration,
    message = 'Too many requests, please try again later.',
    skip,
    keyGenerator,
  } = config;

  const { rateLimit: elysiaRateLimit } = await import('elysia-rate-limit');

  return new Elysia({ name: 'rate-limit' }).use(
    elysiaRateLimit({
      max,
      duration,
      errorResponse: message,
      generator: keyGenerator || ((request: Request): string => defaultKeyGenerator(request, null)),
      skip: skip ? (request: Request): boolean => skip(request) : undefined,
    }) as never,
  ) as never;
}

/**
 * Predefined rate limiting configurations
 */
export const rateLimitConfigs = {
  /** Strict rate limiting for authentication endpoints */
  auth: {
    max: 5,
    duration: 15 * 60 * 1000, // 15 minutes
    message: 'Too many authentication attempts, please try again in 15 minutes.',
  },
  /** Standard rate limiting for API endpoints */
  api: {
    max: 100,
    duration: 15 * 60 * 1000, // 15 minutes
    message: 'Too many API requests, please try again later.',
  },
  /** Lenient rate limiting for public endpoints */
  public: {
    max: 1000,
    duration: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests, please try again later.',
  },
} as const;

/**
 * Convenience functions for common rate limiting scenarios
 */

/**
 * Apply strict rate limiting (for auth endpoints)
 * @returns Elysia plugin with auth rate limiting
 */
export async function rateLimitAuth(): Promise<Elysia> {
  return rateLimit(rateLimitConfigs.auth);
}

/**
 * Apply standard rate limiting (for API endpoints)
 * @returns Elysia plugin with API rate limiting
 */
export async function rateLimitApi(): Promise<Elysia> {
  return rateLimit(rateLimitConfigs.api);
}

/**
 * Apply lenient rate limiting (for public endpoints)
 * @returns Elysia plugin with public rate limiting
 */
export async function rateLimitPublic(): Promise<Elysia> {
  return rateLimit(rateLimitConfigs.public);
}
