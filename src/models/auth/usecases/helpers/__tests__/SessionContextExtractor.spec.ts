import { describe, it, expect } from 'bun:test';
import { SessionContextExtractor } from '../SessionContextExtractor';
import { DomainError } from '@/common/errors';
import type { SessionData } from '@/common/providers/SessionHandler';
import { AccessType } from '@/common/enums';

describe('SessionContextExtractor', () => {
  describe('extractTenantId', () => {
    it('should extract tenantId from session when present', () => {
      const session: SessionData = {
        tenantId: 'tenant-123',
        userId: 'user-456',
        accessType: AccessType.AUTH_USER,
      };

      const result = SessionContextExtractor.extractTenantId(session);

      expect(result).toBe('tenant-123');
    });

    it('should throw DomainError when tenantId is missing', () => {
      const session: SessionData = {
        userId: 'user-456',
        accessType: AccessType.AUTH_USER,
      };

      expect(() => SessionContextExtractor.extractTenantId(session)).toThrow(DomainError);
      expect(() => SessionContextExtractor.extractTenantId(session)).toThrow(
        'Tenant ID not found in session',
      );
    });

    it('should throw DomainError when tenantId is undefined', () => {
      const session: SessionData = {
        tenantId: undefined,
        accessType: AccessType.AUTH_USER,
      };

      expect(() => SessionContextExtractor.extractTenantId(session)).toThrow(DomainError);
    });

    it('should throw DomainError when tenantId is empty string', () => {
      const session: SessionData = {
        tenantId: '',
        userId: 'user-456',
        accessType: AccessType.AUTH_USER,
      };

      expect(() => SessionContextExtractor.extractTenantId(session)).toThrow(DomainError);
    });
  });

  describe('extractUserId', () => {
    it('should extract userId from session when present', () => {
      const session: SessionData = {
        tenantId: 'tenant-123',
        userId: 'user-456',
        accessType: AccessType.AUTH_USER,
      };

      const result = SessionContextExtractor.extractUserId(session);

      expect(result).toBe('user-456');
    });

    it('should throw DomainError when userId is missing', () => {
      const session: SessionData = {
        tenantId: 'tenant-123',
        accessType: AccessType.AUTH_USER,
      };

      expect(() => SessionContextExtractor.extractUserId(session)).toThrow(DomainError);
      expect(() => SessionContextExtractor.extractUserId(session)).toThrow(
        'User ID not found in session',
      );
    });

    it('should throw DomainError when userId is undefined', () => {
      const session: SessionData = {
        tenantId: 'tenant-123',
        userId: undefined,
        accessType: AccessType.AUTH_USER,
      };

      expect(() => SessionContextExtractor.extractUserId(session)).toThrow(DomainError);
    });

    it('should throw DomainError when userId is empty string', () => {
      const session: SessionData = {
        tenantId: 'tenant-123',
        userId: '',
        accessType: AccessType.AUTH_USER,
      };

      expect(() => SessionContextExtractor.extractUserId(session)).toThrow(DomainError);
    });
  });
});

