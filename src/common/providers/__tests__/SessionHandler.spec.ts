import { describe, it, expect, beforeEach } from 'bun:test';
import { SessionHandler, type SessionData } from '../SessionHandler';
import { AccessType } from '@/common/enums/AccessType';

describe('SessionHandler', () => {
  const setup = () => {
    const sessionHandler = new SessionHandler();
    return { sessionHandler };
  };

  beforeEach(() => {
    // Clear context before each test to ensure isolation
    const handler = new SessionHandler();
    handler.clear();
  });

  describe('initialize', () => {
    it('should initialize CLS context with default data', () => {
      const { sessionHandler } = setup();
      sessionHandler.initialize();

      const data = sessionHandler.get();
      expect(data.accessType).toBe(AccessType.NOT_AUTHENTICATED);
      expect(data.userId).toBeUndefined();
      expect(data.tenantId).toBeUndefined();
    });

    it('should allow subsequent methods to access the context', () => {
      const { sessionHandler } = setup();
      sessionHandler.initialize();

      sessionHandler.enrich({ userId: 'user-123' });
      const data = sessionHandler.get();

      expect(data.userId).toBe('user-123');
      expect(data.accessType).toBe(AccessType.NOT_AUTHENTICATED);
    });
  });

  describe('run', () => {
    it('should execute callback within CLS context', () => {
      const { sessionHandler } = setup();
      let contextData: SessionData | null = null;

      const result = sessionHandler.run(() => {
        contextData = sessionHandler.get();
        return 'callback-result';
      });

      expect(result).toBe('callback-result');
      expect(contextData).not.toBeNull();
      expect((contextData as unknown as SessionData).accessType).toBe(AccessType.NOT_AUTHENTICATED);
    });

    it('should return result of callback', () => {
      const { sessionHandler } = setup();

      const result = sessionHandler.run(() => {
        return 42;
      });

      expect(result).toBe(42);
    });

    it('should isolate context within callback', () => {
      const { sessionHandler } = setup();
      let innerData: SessionData | null = null;

      sessionHandler.run(() => {
        sessionHandler.enrich({ userId: 'inner-user' });
        innerData = sessionHandler.get();
      });

      // After run() completes, context should be cleaned up
      const outerData = sessionHandler.get();
      expect((innerData as unknown as SessionData).userId).toBe('inner-user');
      // Context outside run() should not have the enriched data
      expect(outerData.userId).toBeUndefined();
    });

    it('should clean up context after callback completes', () => {
      const { sessionHandler } = setup();

      sessionHandler.run(() => {
        sessionHandler.enrich({ userId: 'temp-user' });
      });

      // After run() completes, context should return default data
      const data = sessionHandler.get();
      expect(data.userId).toBeUndefined();
      expect(data.accessType).toBe(AccessType.NOT_AUTHENTICATED);
    });
  });

  describe('enrich', () => {
    it('should enrich data when context is initialized', () => {
      const { sessionHandler } = setup();
      sessionHandler.initialize();

      sessionHandler.enrich({ userId: 'user-123', tenantId: 'tenant-456' });
      const data = sessionHandler.get();

      expect(data.userId).toBe('user-123');
      expect(data.tenantId).toBe('tenant-456');
      expect(data.accessType).toBe(AccessType.NOT_AUTHENTICATED);
    });

    it('should do partial merge of data', () => {
      const { sessionHandler } = setup();
      sessionHandler.initialize();

      sessionHandler.enrich({ userId: 'user-123' });
      sessionHandler.enrich({ tenantId: 'tenant-456' });
      const data = sessionHandler.get();

      expect(data.userId).toBe('user-123');
      expect(data.tenantId).toBe('tenant-456');
    });

    it('should be no-op when context is not initialized', () => {
      const { sessionHandler } = setup();
      // Don't initialize context

      sessionHandler.enrich({ userId: 'user-123' });
      const data = sessionHandler.get();

      // Should return default data, not enriched data
      expect(data.userId).toBeUndefined();
      expect(data.accessType).toBe(AccessType.NOT_AUTHENTICATED);
    });

    it('should preserve existing data when merging', () => {
      const { sessionHandler } = setup();
      sessionHandler.initialize();

      sessionHandler.enrich({ userId: 'user-123', tenantId: 'tenant-456' });
      sessionHandler.enrich({ correlationId: 'corr-789' });
      const data = sessionHandler.get();

      expect(data.userId).toBe('user-123');
      expect(data.tenantId).toBe('tenant-456');
      expect(data.correlationId).toBe('corr-789');
      expect(data.accessType).toBe(AccessType.NOT_AUTHENTICATED);
    });

    it('should overwrite existing values when enriching same keys', () => {
      const { sessionHandler } = setup();
      sessionHandler.initialize();

      sessionHandler.enrich({ userId: 'user-123' });
      sessionHandler.enrich({ userId: 'user-456' });
      const data = sessionHandler.get();

      expect(data.userId).toBe('user-456');
    });
  });

  describe('get', () => {
    it('should return copy of data when context is initialized', () => {
      const { sessionHandler } = setup();
      sessionHandler.initialize();

      sessionHandler.enrich({ userId: 'user-123' });
      const data1 = sessionHandler.get();
      const data2 = sessionHandler.get();

      expect(data1).toEqual(data2);
      expect(data1).not.toBe(data2); // Should be different objects (copies)
    });

    it('should return default data when context is not initialized', () => {
      const { sessionHandler } = setup();
      // Don't initialize context

      const data = sessionHandler.get();

      expect(data.accessType).toBe(AccessType.NOT_AUTHENTICATED);
      expect(data.userId).toBeUndefined();
      expect(data.tenantId).toBeUndefined();
    });

    it('should return copy (not reference) to prevent external mutation', () => {
      const { sessionHandler } = setup();
      sessionHandler.initialize();

      sessionHandler.enrich({ userId: 'user-123' });
      const data = sessionHandler.get();

      // Mutate the returned object
      data.userId = 'mutated-user';

      // Original context should not be affected
      const originalData = sessionHandler.get();
      expect(originalData.userId).toBe('user-123');
      expect(data.userId).toBe('mutated-user');
    });
  });

  describe('getAgent', () => {
    it('should return userId when available', () => {
      const { sessionHandler } = setup();
      sessionHandler.initialize();

      sessionHandler.enrich({ userId: 'user-123' });
      const agent = sessionHandler.getAgent();

      expect(agent).toBe('user-123');
    });

    it('should return composite identifier when userId is not available', () => {
      const { sessionHandler } = setup();
      sessionHandler.initialize();

      sessionHandler.enrich({
        accessType: AccessType.AUTH_USER,
        correlationId: 'corr-123',
        endpoint: '/api/test',
      });
      const agent = sessionHandler.getAgent();

      expect(agent).toBe(`${AccessType.AUTH_USER}:corr-123:/api/test`);
    });

    it('should use default values for correlationId and endpoint when absent', () => {
      const { sessionHandler } = setup();
      sessionHandler.initialize();

      sessionHandler.enrich({ accessType: AccessType.API_KEY });
      const agent = sessionHandler.getAgent();

      expect(agent).toBe(`${AccessType.API_KEY}:unknown:unknown`);
    });

    it('should prioritize userId over composite identifier', () => {
      const { sessionHandler } = setup();
      sessionHandler.initialize();

      sessionHandler.enrich({
        userId: 'user-123',
        accessType: AccessType.AUTH_USER,
        correlationId: 'corr-123',
        endpoint: '/api/test',
      });
      const agent = sessionHandler.getAgent();

      expect(agent).toBe('user-123');
    });
  });

  describe('clear', () => {
    it('should clear CLS context', () => {
      const { sessionHandler } = setup();
      sessionHandler.initialize();

      sessionHandler.enrich({ userId: 'user-123' });
      sessionHandler.clear();

      const data = sessionHandler.get();
      expect(data.userId).toBeUndefined();
      expect(data.accessType).toBe(AccessType.NOT_AUTHENTICATED);
    });

    it('should make get() return default data after clear()', () => {
      const { sessionHandler } = setup();
      sessionHandler.initialize();

      sessionHandler.enrich({
        userId: 'user-123',
        tenantId: 'tenant-456',
        correlationId: 'corr-789',
      });
      sessionHandler.clear();

      const data = sessionHandler.get();
      expect(data.userId).toBeUndefined();
      expect(data.tenantId).toBeUndefined();
      expect(data.correlationId).toBeUndefined();
      expect(data.accessType).toBe(AccessType.NOT_AUTHENTICATED);
    });
  });

  describe('Context Isolation', () => {
    it('should not interfere between different contexts', () => {
      const handler1 = new SessionHandler();
      const handler2 = new SessionHandler();

      handler1.run(() => {
        handler1.enrich({ userId: 'user-1' });
        const data1 = handler1.get();
        expect(data1.userId).toBe('user-1');

        handler2.run(() => {
          handler2.enrich({ userId: 'user-2' });
          const data2 = handler2.get();
          expect(data2.userId).toBe('user-2');
          // Data from handler1 should not leak into handler2 context
          expect(data2.userId).not.toBe('user-1');
        });

        // Data from handler2 should not leak into handler1 context
        const data1After = handler1.get();
        expect(data1After.userId).toBe('user-1');
      });
    });

    it('should share same CLS context across multiple instances (SINGLETON behavior)', () => {
      const handler1 = new SessionHandler();
      const handler2 = new SessionHandler();

      handler1.initialize();
      handler1.enrich({ userId: 'shared-user' });

      // Both instances should access the same CLS context
      const data1 = handler1.get();
      const data2 = handler2.get();

      expect(data1.userId).toBe('shared-user');
      expect(data2.userId).toBe('shared-user');
    });

    it('should maintain context isolation in async operations', async () => {
      const handler1 = new SessionHandler();
      const handler2 = new SessionHandler();

      await Promise.all([
        handler1.run(async () => {
          handler1.enrich({ userId: 'async-user-1' });
          await new Promise((resolve) => setTimeout(resolve, 10));
          const data = handler1.get();
          expect(data.userId).toBe('async-user-1');
          return 'result-1';
        }),
        handler2.run(async () => {
          handler2.enrich({ userId: 'async-user-2' });
          await new Promise((resolve) => setTimeout(resolve, 10));
          const data = handler2.get();
          expect(data.userId).toBe('async-user-2');
          return 'result-2';
        }),
      ]);

      // After async operations, contexts should be cleaned up
      const data1 = handler1.get();
      const data2 = handler2.get();
      expect(data1.userId).toBeUndefined();
      expect(data2.userId).toBeUndefined();
    });
  });

  describe('Method Integration', () => {
    it('should support full flow: initialize → enrich → get → getAgent', () => {
      const { sessionHandler } = setup();

      sessionHandler.initialize();
      sessionHandler.enrich({
        userId: 'user-123',
        tenantId: 'tenant-456',
        accessType: AccessType.AUTH_USER,
        correlationId: 'corr-789',
        endpoint: '/api/ledger',
      });

      const data = sessionHandler.get();
      expect(data.userId).toBe('user-123');
      expect(data.tenantId).toBe('tenant-456');
      expect(data.accessType).toBe(AccessType.AUTH_USER);
      expect(data.correlationId).toBe('corr-789');
      expect(data.endpoint).toBe('/api/ledger');

      const agent = sessionHandler.getAgent();
      expect(agent).toBe('user-123');
    });

    it('should accumulate data from multiple enriches', () => {
      const { sessionHandler } = setup();
      sessionHandler.initialize();

      sessionHandler.enrich({ userId: 'user-123' });
      sessionHandler.enrich({ tenantId: 'tenant-456' });
      sessionHandler.enrich({ correlationId: 'corr-789' });
      sessionHandler.enrich({ endpoint: '/api/test' });
      sessionHandler.enrich({ accessType: AccessType.API_KEY });

      const data = sessionHandler.get();
      expect(data.userId).toBe('user-123');
      expect(data.tenantId).toBe('tenant-456');
      expect(data.correlationId).toBe('corr-789');
      expect(data.endpoint).toBe('/api/test');
      expect(data.accessType).toBe(AccessType.API_KEY);
    });

    it('should reset to initial state after clear', () => {
      const { sessionHandler } = setup();
      sessionHandler.initialize();

      sessionHandler.enrich({
        userId: 'user-123',
        tenantId: 'tenant-456',
        correlationId: 'corr-789',
        endpoint: '/api/test',
        accessType: AccessType.AUTH_USER,
      });

      sessionHandler.clear();

      const data = sessionHandler.get();
      expect(data.userId).toBeUndefined();
      expect(data.tenantId).toBeUndefined();
      expect(data.correlationId).toBeUndefined();
      expect(data.endpoint).toBeUndefined();
      expect(data.accessType).toBe(AccessType.NOT_AUTHENTICATED);

      const agent = sessionHandler.getAgent();
      expect(agent).toBe(`${AccessType.NOT_AUTHENTICATED}:unknown:unknown`);
    });
  });
});

