import { describe, it, expect, mock } from 'bun:test';
import { AuthorizationHelper } from '../AuthorizationHelper';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { GetUserRepository } from '../../../infra/repositories/GetUserRepository';
import type { GetProfileRepository } from '../../../infra/repositories/GetProfileRepository';
import { ForbiddenError, NotFoundError } from '@/common/errors';

describe('AuthorizationHelper', () => {
  const setup = () => {
    const mockSessionHandler: SessionHandler = {
      get: mock(() => ({
        userId: 'user-123',
        tenantId: 'tenant-123',
        accessType: 'AUTH_USER' as const,
      })),
      enrich: mock(),
      initialize: mock(),
      run: mock((fn) => fn()),
      getAgent: mock(() => 'user-123'),
      clear: mock(),
    };

    const mockGetUserRepository: GetUserRepository = {
      findById: mock(),
    } as unknown as GetUserRepository;

    const mockGetProfileRepository: GetProfileRepository = {
      findById: mock(),
    } as unknown as GetProfileRepository;

    const helper = new AuthorizationHelper({
      sessionHandler: mockSessionHandler,
      getUserRepository: mockGetUserRepository,
      getProfileRepository: mockGetProfileRepository,
    });

    return {
      helper,
      mockSessionHandler,
      mockGetUserRepository,
      mockGetProfileRepository,
    };
  };

  describe('requireMaster', () => {
    it('should not throw when user is master', async () => {
      const { helper, mockGetUserRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'admin',
        passwordHash: 'hash',
        isMaster: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await expect(async () => {
        await helper.requireMaster();
      }).not.toThrow();
    });

    it('should throw ForbiddenError when user is not master', async () => {
      const { helper, mockGetUserRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'user',
        passwordHash: 'hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await expect(async () => {
        await helper.requireMaster();
      }).toThrow(ForbiddenError);
    });

    it('should throw ForbiddenError when user is not authenticated', async () => {
      const { helper, mockSessionHandler } = setup();

      (mockSessionHandler.get as ReturnType<typeof mock>).mockReturnValue({
        accessType: 'NOT_AUTHENTICATED' as const,
      });

      await expect(async () => {
        await helper.requireMaster();
      }).toThrow(ForbiddenError);
    });
  });

  describe('checkProfileOwnership', () => {
    it('should not throw when user is master', async () => {
      const { helper, mockGetUserRepository, mockGetProfileRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'admin',
        passwordHash: 'hash',
        isMaster: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockGetProfileRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'profile-123',
        userId: 'user-456',
        tenantId: 'tenant-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await expect(async () => {
        await helper.checkProfileOwnership('profile-123');
      }).not.toThrow();
    });

    it('should not throw when user owns the profile', async () => {
      const { helper, mockGetUserRepository, mockGetProfileRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'user',
        passwordHash: 'hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockGetProfileRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'profile-123',
        userId: 'user-123',
        tenantId: 'tenant-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await expect(async () => {
        await helper.checkProfileOwnership('profile-123');
      }).not.toThrow();
    });

    it('should throw ForbiddenError when user does not own the profile', async () => {
      const { helper, mockGetUserRepository, mockGetProfileRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'user',
        passwordHash: 'hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockGetProfileRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'profile-123',
        userId: 'user-456',
        tenantId: 'tenant-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await expect(async () => {
        await helper.checkProfileOwnership('profile-123');
      }).toThrow(ForbiddenError);
    });

    it('should throw NotFoundError when profile does not exist', async () => {
      const { helper, mockGetUserRepository, mockGetProfileRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'user',
        passwordHash: 'hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockGetProfileRepository.findById as ReturnType<typeof mock>).mockResolvedValue(null);

      await expect(async () => {
        await helper.checkProfileOwnership('profile-123');
      }).toThrow(NotFoundError);
    });
  });

  describe('checkUserOwnership', () => {
    it('should not throw when user is master', async () => {
      const { helper, mockGetUserRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'admin',
        passwordHash: 'hash',
        isMaster: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await expect(async () => {
        await helper.checkUserOwnership('user-456');
      }).not.toThrow();
    });

    it('should not throw when user owns the account', async () => {
      const { helper, mockGetUserRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'user',
        passwordHash: 'hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await expect(async () => {
        await helper.checkUserOwnership('user-123');
      }).not.toThrow();
    });

    it('should throw ForbiddenError when user does not own the account', async () => {
      const { helper, mockGetUserRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'user',
        passwordHash: 'hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await expect(async () => {
        await helper.checkUserOwnership('user-456');
      }).toThrow(ForbiddenError);
    });
  });

  describe('getAuthenticatedUserId', () => {
    it('should return userId from session', () => {
      const { helper } = setup();

      const userId = helper.getAuthenticatedUserId();

      expect(userId).toBe('user-123');
    });

    it('should throw ForbiddenError when user is not authenticated', () => {
      const { helper, mockSessionHandler } = setup();

      (mockSessionHandler.get as ReturnType<typeof mock>).mockReturnValue({
        accessType: 'NOT_AUTHENTICATED' as const,
      });

      expect(() => {
        helper.getAuthenticatedUserId();
      }).toThrow(ForbiddenError);
    });
  });
});

