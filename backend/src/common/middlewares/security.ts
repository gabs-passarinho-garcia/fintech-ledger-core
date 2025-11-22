import { Elysia } from 'elysia';
import {
  CSP_VALUES,
  FRAME_OPTIONS,
  CROSS_ORIGIN_POLICIES,
  REFERRER_POLICIES,
  EXTERNAL_DOMAINS,
} from '../constants/security.constants';
import { Logger } from '@/common/providers/Logger';

/**
 * Security headers configuration interface
 */
export interface SecurityConfig {
  /** Content Security Policy configuration */
  contentSecurityPolicy?: {
    directives?: Record<string, string[]>;
    reportOnly?: boolean;
  };
  /** X-Frame-Options header */
  frameOptions?: 'DENY' | 'SAMEORIGIN' | false;
  /** X-Content-Type-Options header */
  contentTypeOptions?: boolean;
  /** X-DNS-Prefetch-Control header */
  dnsPrefetchControl?: boolean;
  /** Referrer-Policy header */
  referrerPolicy?:
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url'
    | false;
  /** Strict-Transport-Security header */
  hsts?:
    | {
        maxAge?: number;
        includeSubDomains?: boolean;
        preload?: boolean;
      }
    | false;
  /** X-XSS-Protection header */
  xssProtection?: boolean;
  /** Remove X-Powered-By header */
  hidePoweredBy?: boolean;
  /** Cross-Origin-Resource-Policy header */
  crossOriginResourcePolicy?: 'same-origin' | 'same-site' | 'cross-origin' | false;
  /** Cross-Origin-Opener-Policy header */
  crossOriginOpenerPolicy?: 'unsafe-none' | 'same-origin-allow-popups' | 'same-origin' | false;
  /** Permissions-Policy header */
  permissionsPolicy?: Record<string, string[]>;
  /** Custom headers to add */
  customHeaders?: Record<string, string>;
}

/**
 * Build CSP header value from directives
 */
function buildCSPHeader(directives: Record<string, string[]>): string {
  return Object.entries(directives)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Build HSTS header value
 */
function buildHSTSHeader(config: {
  maxAge?: number;
  includeSubDomains?: boolean;
  preload?: boolean;
}): string {
  let header = `max-age=${config.maxAge || 31536000}`;

  if (config.includeSubDomains) {
    header += '; includeSubDomains';
  }

  if (config.preload) {
    header += '; preload';
  }

  return header;
}

/**
 * Custom security middleware for Elysia that doesn't interfere with CORS
 * This middleware is designed to work alongside @elysiajs/cors without conflicts
 */
export function security(userConfig: SecurityConfig = {}): Elysia {
  Logger.logStatic(
    'info',
    {
      userConfig,
    },
    'Security',
    'Security',
  );
  return new Elysia({ name: 'security' }).onAfterHandle({ as: 'global' }, ({ set }) => {
    // Content Security Policy
    if (userConfig.contentSecurityPolicy?.directives) {
      const cspHeader = buildCSPHeader(userConfig.contentSecurityPolicy.directives);
      const headerName = userConfig.contentSecurityPolicy.reportOnly
        ? 'Content-Security-Policy-Report-Only'
        : 'Content-Security-Policy';
      set.headers[headerName] = cspHeader;
    }

    // X-Frame-Options
    if (userConfig.frameOptions) {
      set.headers['X-Frame-Options'] = userConfig.frameOptions;
    }

    // X-Content-Type-Options
    if (userConfig.contentTypeOptions !== false) {
      set.headers['X-Content-Type-Options'] = 'nosniff';
    }

    // X-DNS-Prefetch-Control
    if (userConfig.dnsPrefetchControl !== false) {
      set.headers['X-DNS-Prefetch-Control'] = 'off';
    }

    // Referrer-Policy
    if (userConfig.referrerPolicy) {
      set.headers['Referrer-Policy'] = userConfig.referrerPolicy;
    }

    // Strict-Transport-Security
    if (userConfig.hsts) {
      set.headers['Strict-Transport-Security'] = buildHSTSHeader(userConfig.hsts);
    }

    // X-XSS-Protection (explicitly disabled by default)
    if (userConfig.xssProtection) {
      set.headers['X-XSS-Protection'] = '1; mode=block';
    } else {
      set.headers['X-XSS-Protection'] = '0';
    }

    // Cross-Origin-Resource-Policy
    if (userConfig.crossOriginResourcePolicy) {
      set.headers['Cross-Origin-Resource-Policy'] = userConfig.crossOriginResourcePolicy;
    }

    // Cross-Origin-Opener-Policy
    if (userConfig.crossOriginOpenerPolicy) {
      set.headers['Cross-Origin-Opener-Policy'] = userConfig.crossOriginOpenerPolicy;
    }

    // Permissions-Policy
    if (userConfig.permissionsPolicy) {
      const permissionsHeader = Object.entries(userConfig.permissionsPolicy)
        .map(([directive, allowlist]) => {
          if (allowlist.length === 0) {
            return `${directive}=()`;
          }
          return `${directive}=(${allowlist.join(' ')})`;
        })
        .join(', ');
      set.headers['Permissions-Policy'] = permissionsHeader;
    }

    // Custom headers
    if (userConfig.customHeaders) {
      Object.entries(userConfig.customHeaders).forEach(([key, value]) => {
        set.headers[key] = value;
      });
    }

    // Remove X-Powered-By header
    if (userConfig.hidePoweredBy !== false) {
      delete set.headers['X-Powered-By'];
    }
  });
}

/**
 * Predefined security configurations
 */
export const securityPresets = {
  /**
   * Strict security configuration for production environments
   */
  strict: (): SecurityConfig => ({
    contentSecurityPolicy: {
      directives: {
        'default-src': [CSP_VALUES.SELF],
        'script-src': [CSP_VALUES.SELF],
        'style-src': [CSP_VALUES.SELF],
        'img-src': [CSP_VALUES.SELF, CSP_VALUES.DATA, EXTERNAL_DOMAINS.ISTOCK_MEDIA],
        'font-src': [CSP_VALUES.SELF],
        'connect-src': [CSP_VALUES.SELF],
        'frame-src': [CSP_VALUES.NONE],
        'object-src': [CSP_VALUES.NONE],
        'base-uri': [CSP_VALUES.SELF],
      },
    },
    frameOptions: FRAME_OPTIONS.DENY,
    xssProtection: true,
    contentTypeOptions: true,
    dnsPrefetchControl: false,
    referrerPolicy: REFERRER_POLICIES.NO_REFERRER,
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
      'interest-cohort': [],
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    crossOriginResourcePolicy: CROSS_ORIGIN_POLICIES.CROSS_ORIGIN,
    crossOriginOpenerPolicy: CROSS_ORIGIN_POLICIES.SAME_ORIGIN,
    hidePoweredBy: true,
  }),

  /**
   * Moderate security configuration for development/staging
   * Balanced security with some flexibility for development tools
   */
  moderate: (): SecurityConfig => ({
    contentSecurityPolicy: {
      directives: {
        'default-src': [CSP_VALUES.SELF],
        'script-src': [
          CSP_VALUES.SELF,
          CSP_VALUES.UNSAFE_INLINE,
          EXTERNAL_DOMAINS.JSDELIVR_CDN,
          CSP_VALUES.WASM_UNSAFE_EVAL,
        ],
        'style-src': [CSP_VALUES.SELF, CSP_VALUES.UNSAFE_INLINE],
        'img-src': [
          CSP_VALUES.SELF,
          CSP_VALUES.DATA,
          CSP_VALUES.BLOB,
          EXTERNAL_DOMAINS.ISTOCK_MEDIA,
        ],
        'font-src': [CSP_VALUES.SELF, CSP_VALUES.HTTPS],
        'connect-src': [CSP_VALUES.SELF, EXTERNAL_DOMAINS.JSDELIVR_CDN],
        'frame-src': [CSP_VALUES.SELF],
        'object-src': [CSP_VALUES.NONE],
        'base-uri': [CSP_VALUES.SELF],
      },
    },
    frameOptions: FRAME_OPTIONS.SAMEORIGIN,
    xssProtection: true,
    contentTypeOptions: true,
    dnsPrefetchControl: false,
    referrerPolicy: REFERRER_POLICIES.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
    },
    hsts: {
      maxAge: 15552000, // 6 months
      includeSubDomains: true,
      preload: false,
    },
    crossOriginResourcePolicy: CROSS_ORIGIN_POLICIES.CROSS_ORIGIN,
    crossOriginOpenerPolicy: CROSS_ORIGIN_POLICIES.SAME_ORIGIN_ALLOW_POPUPS,
    hidePoweredBy: true,
  }),

  /**
   * Lenient security configuration for local development
   * Minimal restrictions to allow development tools and hot reloading
   */
  lenient: (): SecurityConfig => ({
    contentSecurityPolicy: {
      directives: {
        'default-src': [CSP_VALUES.SELF, CSP_VALUES.UNSAFE_INLINE],
        'script-src': [CSP_VALUES.SELF, CSP_VALUES.UNSAFE_INLINE, CSP_VALUES.UNSAFE_EVAL],
        'style-src': [CSP_VALUES.SELF, CSP_VALUES.UNSAFE_INLINE],
        'img-src': [CSP_VALUES.SELF, CSP_VALUES.DATA, CSP_VALUES.BLOB, CSP_VALUES.HTTPS],
        'font-src': [CSP_VALUES.SELF, CSP_VALUES.DATA, CSP_VALUES.HTTPS],
        'connect-src': [CSP_VALUES.SELF, CSP_VALUES.WS, CSP_VALUES.WSS],
        'frame-src': [CSP_VALUES.SELF],
        'object-src': [CSP_VALUES.NONE],
        'base-uri': [CSP_VALUES.SELF],
      },
    },
    frameOptions: FRAME_OPTIONS.SAMEORIGIN,
    xssProtection: false,
    contentTypeOptions: false,
    dnsPrefetchControl: true,
    referrerPolicy: REFERRER_POLICIES.ORIGIN_WHEN_CROSS_ORIGIN,
    permissionsPolicy: {},
    // hsts is omitted (undefined) to disable it
    crossOriginResourcePolicy: CROSS_ORIGIN_POLICIES.CROSS_ORIGIN,
    crossOriginOpenerPolicy: CROSS_ORIGIN_POLICIES.UNSAFE_NONE,
    hidePoweredBy: true,
  }),
};
