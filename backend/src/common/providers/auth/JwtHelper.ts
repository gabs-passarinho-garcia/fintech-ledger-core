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
      // Validate private key format before attempting to sign
      this.validatePrivateKey();

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

      // Create a KeyObject from the private key to ensure proper formatting
      // This helps avoid BAD_BASE64_DECODE errors by validating the key format first
      const privateKeyObject = crypto.createPrivateKey({
        key: this.privateKey,
        format: 'pem',
      });

      const sign = crypto.createSign('SHA256');
      sign.update(signatureInput);

      const signature = sign.sign(
        {
          key: privateKeyObject,
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

      // Create a KeyObject from the public key to ensure proper formatting
      const publicKeyObject = crypto.createPublicKey({
        key: this.publicKey,
        format: 'pem',
      });

      const verify = crypto.createVerify('SHA256');
      verify.update(signatureInput);

      const isValid = verify.verify(
        {
          key: publicKeyObject,
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

  /**
   * Validates that the private key is in the correct PEM format.
   * This helps catch formatting issues before attempting to sign.
   *
   * @throws {DomainError} If the private key format is invalid
   */
  private validatePrivateKey(): void {
    const key = this.privateKey.trim();

    // Check for required PEM markers
    // Accept both "EC PRIVATE KEY" (traditional format) and "PRIVATE KEY" (PKCS8 format)
    const hasEcPrivateKey =
      key.includes('-----BEGIN EC PRIVATE KEY-----') &&
      key.includes('-----END EC PRIVATE KEY-----');
    const hasPrivateKey =
      key.includes('-----BEGIN PRIVATE KEY-----') && key.includes('-----END PRIVATE KEY-----');

    if (!hasEcPrivateKey && !hasPrivateKey) {
      throw new DomainError({
        message:
          'Invalid private key format: missing PEM markers. ' +
          'Expected either "-----BEGIN EC PRIVATE KEY-----" or "-----BEGIN PRIVATE KEY-----". ' +
          'Ensure the key is properly formatted PEM key.',
      });
    }

    // Try to create a key object to validate it's parseable
    try {
      crypto.createPrivateKey({
        key: this.privateKey,
        format: 'pem',
      });
    } catch (error) {
      throw new DomainError({
        message:
          `Invalid private key format: ${error instanceof Error ? error.message : String(error)}. ` +
          'The key must be a valid EC private key in PEM format.',
      });
    }
  }
}
