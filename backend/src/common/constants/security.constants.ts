/**
 * Constants for security middleware
 * Centralizes CSP and security-related string literals
 */

/**
 * Content Security Policy directive values
 */
export const CSP_VALUES = {
  SELF: "'self'",
  NONE: "'none'",
  UNSAFE_INLINE: "'unsafe-inline'",
  UNSAFE_EVAL: "'unsafe-eval'",
  DATA: 'data:',
  BLOB: 'blob:',
  HTTPS: 'https:',
  WS: 'ws:',
  WSS: 'wss:',
  WASM_UNSAFE_EVAL: "'wasm-unsafe-eval'",
} as const;

/**
 * Frame options values
 */
export const FRAME_OPTIONS = {
  DENY: 'DENY',
  SAMEORIGIN: 'SAMEORIGIN',
} as const;

/**
 * Cross-origin policy values
 */
export const CROSS_ORIGIN_POLICIES = {
  SAME_ORIGIN: 'same-origin',
  SAME_ORIGIN_ALLOW_POPUPS: 'same-origin-allow-popups',
  CROSS_ORIGIN: 'cross-origin',
  UNSAFE_NONE: 'unsafe-none',
} as const;

/**
 * Referrer policy values
 */
export const REFERRER_POLICIES = {
  NO_REFERRER: 'no-referrer',
  STRICT_ORIGIN_WHEN_CROSS_ORIGIN: 'strict-origin-when-cross-origin',
  ORIGIN_WHEN_CROSS_ORIGIN: 'origin-when-cross-origin',
} as const;

/**
 * Common external domains
 */
export const EXTERNAL_DOMAINS = {
  JSDELIVR_CDN: 'https://cdn.jsdelivr.net',
  ISTOCK_MEDIA: 'https://media.istockphoto.com',
} as const;
