import { describe, it, expect } from 'bun:test';
import { decodeJWT, extractUserFromToken } from '../jwt';

describe('jwt utils', () => {
  describe('decodeJWT', () => {
    it('should decode a valid JWT token', () => {
      // Create a simple JWT token (header.payload.signature)
      const payload = { userId: 'user-123', username: 'testuser', isMaster: true };
      const encodedPayload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_');
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encodedPayload}.signature`;

      const decoded = decodeJWT(token);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe('user-123');
      expect(decoded?.username).toBe('testuser');
      expect(decoded?.isMaster).toBe(true);
    });

    it('should return null for invalid token format', () => {
      const decoded = decodeJWT('invalid-token');
      expect(decoded).toBeNull();
    });

    it('should return null for malformed token', () => {
      const decoded = decodeJWT('not.a.valid.jwt.token');
      expect(decoded).toBeNull();
    });
  });

  describe('extractUserFromToken', () => {
    it('should extract user information from token', () => {
      const payload = { userId: 'user-123', username: 'testuser', isMaster: true };
      const encodedPayload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_');
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encodedPayload}.signature`;

      const user = extractUserFromToken(token);

      expect(user).toBeDefined();
      expect(user?.userId).toBe('user-123');
      expect(user?.username).toBe('testuser');
      expect(user?.isMaster).toBe(true);
    });

    it('should return null for invalid token', () => {
      const user = extractUserFromToken('invalid-token');
      expect(user).toBeNull();
    });

    it('should handle missing fields gracefully', () => {
      const payload = { userId: 'user-123' };
      const encodedPayload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_');
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encodedPayload}.signature`;

      const user = extractUserFromToken(token);

      expect(user).toBeDefined();
      expect(user?.userId).toBe('user-123');
      expect(user?.username).toBeUndefined();
      expect(user?.isMaster).toBeUndefined();
    });
  });
});

