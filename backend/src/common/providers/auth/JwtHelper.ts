import crypto from 'node:crypto';
import { InternalError, DomainError, NotSignedError } from '@/common/errors';

export interface JwtPayload {
  userId: string;
  username: string;
  tenantId?: string;
  isMaster: boolean;
  iat: number;
  exp: number;
}

/**
 * Helper class for JWT operations using ES256 (ECDSA with P-256 and SHA-256).
 * Uses Node.js crypto module for signing and verification.
 */
export class JwtHelper {
  private readonly privateKey: string;
  private readonly publicKey: string;
  private readonly algorithm = 'ES256';

  /**
   * Creates a new JwtHelper instance.
   *
   * @param opts - Configuration options
   * @param opts.privateKey - ECDSA private key in PEM format
   * @param opts.publicKey - ECDSA public key in PEM format
   */
  public constructor(opts: { privateKey: string; publicKey: string }) {
    this.privateKey = opts.privateKey;
    this.publicKey = opts.publicKey;
  }

  /**
   * Signs a JWT payload and returns the token.
   *
   * @param payload - The JWT payload to sign
   * @param expiresInSeconds - Token expiration time in seconds
   * @returns The signed JWT token
   * @throws {InternalError} If signing fails
   */
  public sign(payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresInSeconds: number): string {
    try {
      const now = Math.floor(Date.now() / 1000);
      const exp = now + expiresInSeconds;

      const jwtPayload: JwtPayload = {
        ...payload,
        iat: now,
        exp,
      };

      // Encode header
      const header = {
        alg: this.algorithm,
        typ: 'JWT',
      };

      const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
      const encodedPayload = this.base64UrlEncode(JSON.stringify(jwtPayload));

      // Create signature
      const signatureInput = `${encodedHeader}.${encodedPayload}`;
      const signature = crypto.createSign('SHA256').update(signatureInput).sign(
        {
          key: this.privateKey,
          dsaEncoding: 'ieee-p1363',
        },
        'base64url',
      );

      return `${signatureInput}.${signature}`;
    } catch (error) {
      throw new InternalError({
        originalError: error,
        additionalMessage: `Failed to sign JWT: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  /**
   * Verifies a JWT token and returns the payload.
   *
   * @param token - The JWT token to verify
   * @returns The decoded JWT payload
   * @throws {NotSignedError} If token is invalid or expired
   * @throws {InvalidInputError} If token format is invalid
   */
  public verify(token: string): JwtPayload {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new DomainError({
          message: 'Invalid JWT format. Expected format: header.payload.signature',
        });
      }

      const [encodedHeader, encodedPayload, signature] = parts;

      // Verify signature
      const signatureInput = `${encodedHeader}.${encodedPayload}`;
      const isValid = crypto.createVerify('SHA256').update(signatureInput).verify(
        {
          key: this.publicKey,
          dsaEncoding: 'ieee-p1363',
        },
        signature,
        'base64url',
      );

      if (!isValid) {
        throw new NotSignedError({
          additionalMessage: 'Invalid JWT signature',
        });
      }

      // Decode payload
      const payloadJson = this.base64UrlDecode(encodedPayload);
      const payload = JSON.parse(payloadJson) as JwtPayload;

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        throw new NotSignedError({
          additionalMessage: 'JWT token has expired',
        });
      }

      return payload;
    } catch (error) {
      if (error instanceof NotSignedError || error instanceof DomainError) {
        throw error;
      }

      throw new NotSignedError({
        originalError: error,
        additionalMessage: `Failed to verify JWT: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  /**
   * Base64 URL encodes a string.
   *
   * @param str - The string to encode
   * @returns The base64 URL encoded string
   */
  private base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Base64 URL decodes a string.
   *
   * @param str - The base64 URL encoded string
   * @returns The decoded string
   */
  private base64UrlDecode(str: string): string {
    // Add padding if needed
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const paddingNeeded = base64.length % 4;
    if (paddingNeeded > 0) {
      base64 += '='.repeat(4 - paddingNeeded);
    }

    return Buffer.from(base64, 'base64').toString('utf-8');
  }
}
