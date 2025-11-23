import { describe, it, expect, mock } from 'bun:test';
import { GetProfileUseCase } from '../GetProfileUseCase';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { GetProfileRepository } from '../../infra/repositories/GetProfileRepository';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { GetUserRepository } from '../../infra/repositories/GetUserRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { ForbiddenError, NotFoundError } from '@/common/errors';

describe('GetProfileUseCase', () => {
  const setup = () => {
    const mockLogger: ILogger = {
      log: mock(() => {}),
      debug: mock(),
      info: mock(),
      warn: mock(),
      error: mock(),
    };

    const mockGetProfileRepository: GetProfileRepository = {
      findById: mock(),
    } as unknown as GetProfileRepository;

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
    } as never;

    const mockGetUserRepository: GetUserRepository = {
      findById: mock(),
    } as unknown as GetUserRepository;

    const useCase = new GetProfileUseCase({
      [AppProviders.logger]: mockLogger,
      [AppProviders.getProfileRepository]: mockGetProfileRepository,
      [AppProviders.sessionHandler]: mockSessionHandler,
      [AppProviders.getUserRepository]: mockGetUserRepository,
    });

    return {
      useCase,
      mockLogger,
      mockGetProfileRepository,
      mockSessionHandler,
      mockGetUserRepository,
    };
  };

  describe('execute', () => {
    it('should return profile when user is owner', async () => {
      const { useCase, mockGetUserRepository, mockGetProfileRepository } = setup();

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

      const result = await useCase.execute({ profileId: 'profile-123' });

      expect(result.id).toBe('profile-123');
      expect(result.userId).toBe('user-123');
      expect(result.email).toBe('john@example.com');
    });

    it('should return profile when user is master', async () => {
      const { useCase, mockGetUserRepository, mockGetProfileRepository } = setup();

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

      const result = await useCase.execute({ profileId: 'profile-123' });

      expect(result.id).toBe('profile-123');
    });

    it('should throw ForbiddenError when user is not authorized', async () => {
      const { useCase, mockGetUserRepository, mockGetProfileRepository } = setup();

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
        await useCase.execute({ profileId: 'profile-123' });
      }).toThrow(ForbiddenError);
    });

    it('should throw NotFoundError when profile does not exist', async () => {
      const { useCase, mockGetUserRepository, mockGetProfileRepository } = setup();

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
        await useCase.execute({ profileId: 'profile-123' });
      }).toThrow(NotFoundError);
    });
  });
});

