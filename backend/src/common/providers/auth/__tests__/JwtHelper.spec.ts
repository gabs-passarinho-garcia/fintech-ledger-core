import { describe, it, expect, beforeEach } from 'bun:test';
import { generateKeyPairSync } from 'node:crypto';
import { JwtHelper } from '../JwtHelper';
import { DomainError, NotSignedError } from '@/common/errors';

describe('JwtHelper', () => {
  let privateKey: string;
  let publicKey: string;
  let jwtHelper: JwtHelper;

  beforeEach(() => {
    // Generate ECDSA P-256 keys for each test
    const { privateKey: privKey, publicKey: pubKey } = generateKeyPairSync('ec', {
      namedCurve: 'prime256v1',
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    privateKey = privKey;
    publicKey = pubKey;
    jwtHelper = new JwtHelper({ privateKey, publicKey });
  });

  describe('sign', () => {
    it('should sign a valid payload', () => {
      const payload = {
        userId: 'user-123',
        username: 'testuser',
        isMaster: false,
      };

      const token = jwtHelper.sign(payload, 3600);

      expect(token).toBeDefined();
      expect(token).toBeString();
      // JWT format: header.payload.signature
      const parts = token.split('.');
      expect(parts.length).toBe(3);
    });

    it('should include iat and exp in signed token', () => {
      const payload = {
        userId: 'user-123',
        username: 'testuser',
        isMaster: false,
      };

      const token = jwtHelper.sign(payload, 3600);
      const decoded = jwtHelper.verify(token);

      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it('should set correct expiration time', () => {
      const payload = {
        userId: 'user-123',
        username: 'testuser',
        isMaster: false,
      };

      const expiresIn = 1800; // 30 minutes
      const token = jwtHelper.sign(payload, expiresIn);
      const decoded = jwtHelper.verify(token);

      const expectedExp = decoded.iat + expiresIn;
      expect(decoded.exp).toBe(expectedExp);
    });

    it('should generate different tokens for same payload (different iat)', () => {
      const payload = {
        userId: 'user-123',
        username: 'testuser',
        isMaster: false,
      };

      const token1 = jwtHelper.sign(payload, 3600);
      // Wait a bit to ensure different iat
      Bun.sleepSync(1000);
      const token2 = jwtHelper.sign(payload, 3600);

      expect(token1).not.toBe(token2);
    });

    it('should include all payload fields in token', () => {
      const payload = {
        userId: 'user-123',
        username: 'testuser',
        tenantId: 'tenant-123',
        isMaster: true,
      };

      const token = jwtHelper.sign(payload, 3600);
      const decoded = jwtHelper.verify(token);

      expect(decoded.userId).toBe('user-123');
      expect(decoded.username).toBe('testuser');
      expect(decoded.tenantId).toBe('tenant-123');
      expect(decoded.isMaster).toBe(true);
    });

    it('should handle payload without optional fields', () => {
      const payload = {
        userId: 'user-123',
        username: 'testuser',
        isMaster: false,
      };

      const token = jwtHelper.sign(payload, 3600);
      const decoded = jwtHelper.verify(token);

      expect(decoded.userId).toBe('user-123');
      expect(decoded.username).toBe('testuser');
      expect(decoded.isMaster).toBe(false);
      expect(decoded.tenantId).toBeUndefined();
    });
  });

  describe('verify', () => {
    it('should verify a valid token', () => {
      const payload = {
        userId: 'user-123',
        username: 'testuser',
        isMaster: false,
      };

      const token = jwtHelper.sign(payload, 3600);
      const decoded = jwtHelper.verify(token);

      expect(decoded.userId).toBe('user-123');
      expect(decoded.username).toBe('testuser');
      expect(decoded.isMaster).toBe(false);
    });

    it('should throw NotSignedError for expired token', () => {
      const payload = {
        userId: 'user-123',
        username: 'testuser',
        isMaster: false,
      };

      // Sign token with 1 second expiration
      const token = jwtHelper.sign(payload, 1);
      
      // Decode token to check expiration (using base64url decode)
      const parts = token.split('.');
      let base64 = parts[1]!.replace(/-/g, '+').replace(/_/g, '/');
      const paddingNeeded = base64.length % 4;
      if (paddingNeeded > 0) {
        base64 += '='.repeat(4 - paddingNeeded);
      }
      const payloadJson = Buffer.from(base64, 'base64').toString('utf-8');
      const decoded = JSON.parse(payloadJson) as { exp: number; iat: number };
      
      // Calculate wait time to ensure token is expired
      const now = Math.floor(Date.now() / 1000);
      const waitTime = Math.max(0, (decoded.exp - now + 1) * 1000 + 100); // Add 1 second buffer
      
      if (waitTime > 0) {
        Bun.sleepSync(waitTime);
      }

      expect(() => {
        jwtHelper.verify(token);
      }).toThrow(NotSignedError);
    });

    it('should throw DomainError for invalid token format', () => {
      expect(() => {
        jwtHelper.verify('invalid-token');
      }).toThrow(DomainError);

      expect(() => {
        jwtHelper.verify('header.payload');
      }).toThrow(DomainError);

      expect(() => {
        jwtHelper.verify('header.payload.signature.extra');
      }).toThrow(DomainError);
    });

    it('should throw NotSignedError for token with invalid signature', () => {
      const payload = {
        userId: 'user-123',
        username: 'testuser',
        isMaster: false,
      };

      const token = jwtHelper.sign(payload, 3600);
      const parts = token.split('.');
      // Corrupt the signature
      const corruptedToken = `${parts[0]}.${parts[1]}.invalid_signature`;

      expect(() => {
        jwtHelper.verify(corruptedToken);
      }).toThrow(NotSignedError);
    });

    it('should throw NotSignedError for token signed with different key', () => {
      // Generate different key pair
      const { privateKey: otherPrivateKey, publicKey: otherPublicKey } = generateKeyPairSync('ec', {
        namedCurve: 'prime256v1',
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      });

      const otherJwtHelper = new JwtHelper({
        privateKey: otherPrivateKey,
        publicKey: otherPublicKey,
      });

      const payload = {
        userId: 'user-123',
        username: 'testuser',
        isMaster: false,
      };

      // Sign with different key
      const token = otherJwtHelper.sign(payload, 3600);

      // Try to verify with original key (should fail)
      expect(() => {
        jwtHelper.verify(token);
      }).toThrow(NotSignedError);
    });

    it('should throw NotSignedError for corrupted payload', () => {
      const payload = {
        userId: 'user-123',
        username: 'testuser',
        isMaster: false,
      };

      const token = jwtHelper.sign(payload, 3600);
      const parts = token.split('.');
      // Corrupt the payload
      const corruptedToken = `${parts[0]}.corrupted_payload.${parts[2]}`;

      expect(() => {
        jwtHelper.verify(corruptedToken);
      }).toThrow(NotSignedError);
    });
  });

  describe('JWT format', () => {
    it('should produce valid JWT format (header.payload.signature)', () => {
      const payload = {
        userId: 'user-123',
        username: 'testuser',
        isMaster: false,
      };

      const token = jwtHelper.sign(payload, 3600);
      const parts = token.split('.');

      expect(parts.length).toBe(3);
      expect(parts[0].length).toBeGreaterThan(0); // header
      expect(parts[1].length).toBeGreaterThan(0); // payload
      expect(parts[2].length).toBeGreaterThan(0); // signature
    });

    it('should use base64url encoding (no padding, no + or /)', () => {
      const payload = {
        userId: 'user-123',
        username: 'testuser',
        isMaster: false,
      };

      const token = jwtHelper.sign(payload, 3600);
      const parts = token.split('.');

      // Base64url should not contain +, /, or = padding
      parts.forEach((part) => {
        expect(part).not.toContain('+');
        expect(part).not.toContain('/');
        expect(part).not.toContain('=');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle very short expiration time', () => {
      const payload = {
        userId: 'user-123',
        username: 'testuser',
        isMaster: false,
      };

      const token = jwtHelper.sign(payload, 1);
      const decoded = jwtHelper.verify(token);

      expect(decoded.exp).toBe(decoded.iat + 1);
    });

    it('should handle very long expiration time', () => {
      const payload = {
        userId: 'user-123',
        username: 'testuser',
        isMaster: false,
      };

      const expiresIn = 365 * 24 * 60 * 60; // 1 year
      const token = jwtHelper.sign(payload, expiresIn);
      const decoded = jwtHelper.verify(token);

      expect(decoded.exp).toBe(decoded.iat + expiresIn);
    });

    it('should handle special characters in username', () => {
      const payload = {
        userId: 'user-123',
        username: 'user_name-123',
        isMaster: false,
      };

      const token = jwtHelper.sign(payload, 3600);
      const decoded = jwtHelper.verify(token);

      expect(decoded.username).toBe('user_name-123');
    });
  });
});

