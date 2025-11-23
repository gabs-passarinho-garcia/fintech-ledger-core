import { describe, it, expect, mock } from 'bun:test';
import { ListProfilesByTenantUseCase } from '../ListProfilesByTenantUseCase';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { ListProfilesByTenantRepository } from '../../infra/repositories/ListProfilesByTenantRepository';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { GetUserRepository } from '../../infra/repositories/GetUserRepository';
import type { GetProfileRepository } from '../../infra/repositories/GetProfileRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { ForbiddenError } from '@/common/errors';
import { ProfileFactory } from '../../domain';

describe('ListProfilesByTenantUseCase', () => {
  const setup = () => {
    const mockLogger: ILogger = {
      log: mock(() => {}),
      debug: mock(),
      info: mock(),
      warn: mock(),
      error: mock(),
    };

    const mockListProfilesByTenantRepository: ListProfilesByTenantRepository = {
      listByTenantId: mock(),
    } as unknown as ListProfilesByTenantRepository;

    const mockSessionHandler: SessionHandler = {
      get: mock(() => ({
        userId: 'user-123',
        tenantId: 'tenant-1',
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

    const mockGetProfileRepository: GetProfileRepository = {
      findById: mock(),
    } as unknown as GetProfileRepository;

    const useCase = new ListProfilesByTenantUseCase({
      [AppProviders.logger]: mockLogger,
      [AppProviders.listProfilesByTenantRepository]: mockListProfilesByTenantRepository,
      [AppProviders.sessionHandler]: mockSessionHandler,
      [AppProviders.getUserRepository]: mockGetUserRepository,
      [AppProviders.getProfileRepository]: mockGetProfileRepository,
    });

    return {
      useCase,
      mockLogger,
      mockListProfilesByTenantRepository,
      mockSessionHandler,
      mockGetUserRepository,
      mockGetProfileRepository,
    };
  };

  describe('execute', () => {
    it('should return list of profiles for tenant when user has access', async () => {
      const { useCase, mockListProfilesByTenantRepository, mockSessionHandler } = setup();

      const mockProfiles = [
        ProfileFactory.reconstruct({
          id: 'profile-1',
          userId: 'user-123',
          tenantId: 'tenant-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@tenant1.com',
          balance: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        }),
        ProfileFactory.reconstruct({
          id: 'profile-2',
          userId: 'user-456',
          tenantId: 'tenant-1',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@tenant1.com',
          balance: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        }),
      ];

      (mockListProfilesByTenantRepository.listByTenantId as ReturnType<typeof mock>).mockResolvedValue(
        mockProfiles,
      );

      (mockSessionHandler.get as ReturnType<typeof mock>).mockReturnValue({
        userId: 'user-123',
        tenantId: 'tenant-1',
        accessType: 'AUTH_USER' as const,
      });

      const result = await useCase.execute({ tenantId: 'tenant-1' });

      expect(result).toBeDefined();
      expect(result.profiles).toBeDefined();
      expect(result.profiles.length).toBe(2);
      expect(result.profiles[0]?.tenantId).toBe('tenant-1');
      expect(result.profiles[1]?.tenantId).toBe('tenant-1');
      expect(mockListProfilesByTenantRepository.listByTenantId).toHaveBeenCalledWith({
        tenantId: 'tenant-1',
      });
    });

    it('should allow access when user is master user', async () => {
      const { useCase, mockListProfilesByTenantRepository, mockSessionHandler, mockGetUserRepository } =
        setup();

      const mockProfiles = [
        ProfileFactory.reconstruct({
          id: 'profile-1',
          userId: 'user-123',
          tenantId: 'tenant-2',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@tenant2.com',
          balance: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        }),
      ];

      (mockListProfilesByTenantRepository.listByTenantId as ReturnType<typeof mock>).mockResolvedValue(
        mockProfiles,
      );

      (mockSessionHandler.get as ReturnType<typeof mock>).mockReturnValue({
        userId: 'user-123',
        tenantId: 'tenant-1',
        accessType: 'AUTH_USER' as const,
      });

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'admin',
        passwordHash: 'hash',
        isMaster: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const result = await useCase.execute({ tenantId: 'tenant-2' });

      expect(result).toBeDefined();
      expect(result.profiles.length).toBe(1);
      expect(result.profiles[0]?.tenantId).toBe('tenant-2');
    });

    it('should throw ForbiddenError when user does not have access to tenant', async () => {
      const { useCase, mockSessionHandler, mockGetUserRepository } = setup();

      (mockSessionHandler.get as ReturnType<typeof mock>).mockReturnValue({
        userId: 'user-123',
        tenantId: 'tenant-1',
        accessType: 'AUTH_USER' as const,
      });

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'user',
        passwordHash: 'hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await expect(useCase.execute({ tenantId: 'tenant-2' })).rejects.toThrow(ForbiddenError);
    });

    it('should return empty array when no profiles found', async () => {
      const { useCase, mockListProfilesByTenantRepository, mockSessionHandler } = setup();

      (mockListProfilesByTenantRepository.listByTenantId as ReturnType<typeof mock>).mockResolvedValue(
        [],
      );

      (mockSessionHandler.get as ReturnType<typeof mock>).mockReturnValue({
        userId: 'user-123',
        tenantId: 'tenant-1',
        accessType: 'AUTH_USER' as const,
      });

      const result = await useCase.execute({ tenantId: 'tenant-1' });

      expect(result.profiles).toEqual([]);
    });

    it('should exclude deleted profiles from results', async () => {
      const { useCase, mockListProfilesByTenantRepository, mockSessionHandler } = setup();

      const mockProfiles = [
        ProfileFactory.reconstruct({
          id: 'profile-1',
          userId: 'user-123',
          tenantId: 'tenant-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@tenant1.com',
          balance: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        }),
      ];

      (mockListProfilesByTenantRepository.listByTenantId as ReturnType<typeof mock>).mockResolvedValue(
        mockProfiles,
      );

      (mockSessionHandler.get as ReturnType<typeof mock>).mockReturnValue({
        userId: 'user-123',
        tenantId: 'tenant-1',
        accessType: 'AUTH_USER' as const,
      });

      const result = await useCase.execute({ tenantId: 'tenant-1' });

      expect(result.profiles.length).toBe(1);
      expect(result.profiles[0]?.id).toBe('profile-1');
      expect(result.profiles[0]?.email).toBe('john@tenant1.com');
      expect(mockListProfilesByTenantRepository.listByTenantId).toHaveBeenCalledWith({
        tenantId: 'tenant-1',
      });
    });
  });
});

