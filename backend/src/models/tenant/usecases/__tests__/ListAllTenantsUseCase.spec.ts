import { describe, it, expect, mock } from 'bun:test';
import { ListAllTenantsUseCase } from '../ListAllTenantsUseCase';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { ListAllTenantsRepository } from '../../infra/repositories/ListAllTenantsRepository';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { GetUserRepository } from '@/models/auth/infra/repositories/GetUserRepository';
import type { GetProfileRepository } from '@/models/auth/infra/repositories/GetProfileRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { ForbiddenError } from '@/common/errors';

describe('ListAllTenantsUseCase', () => {
  const setup = () => {
    const mockLogger: ILogger = {
      debug: mock(),
      info: mock(),
      warn: mock(),
      error: mock(),
      log: mock(),
    };

    const mockListAllTenantsRepository: ListAllTenantsRepository = {
      listAll: mock(),
    } as unknown as ListAllTenantsRepository;

    const mockSessionHandler = {
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
    } as unknown as SessionHandler;

    const mockGetUserRepository: GetUserRepository = {
      findById: mock(),
    } as unknown as GetUserRepository;

    const mockGetProfileRepository: GetProfileRepository = {
      findById: mock(),
    } as unknown as GetProfileRepository;

    const useCase = new ListAllTenantsUseCase({
      [AppProviders.logger]: mockLogger,
      [AppProviders.listAllTenantsRepository]: mockListAllTenantsRepository,
      [AppProviders.sessionHandler]: mockSessionHandler,
      [AppProviders.getUserRepository]: mockGetUserRepository,
      [AppProviders.getProfileRepository]: mockGetProfileRepository,
    });

    return {
      useCase,
      mockLogger,
      mockListAllTenantsRepository,
      mockSessionHandler,
      mockGetUserRepository,
      mockGetProfileRepository,
    };
  };

  describe('execute', () => {
    it('should return list of all tenants when user is master', async () => {
      const { useCase, mockListAllTenantsRepository, mockGetUserRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'admin',
        passwordHash: 'hash',
        isMaster: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockListAllTenantsRepository.listAll as ReturnType<typeof mock>).mockResolvedValue([
        {
          id: 'tenant-1',
          name: 'Tenant 1',
          createdBy: 'user-123',
          createdAt: new Date('2024-01-01'),
          updatedBy: null,
          updatedAt: new Date('2024-01-01'),
          deletedBy: null,
          deletedAt: null,
        },
        {
          id: 'tenant-2',
          name: 'Tenant 2',
          createdBy: 'user-456',
          createdAt: new Date('2024-01-02'),
          updatedBy: null,
          updatedAt: new Date('2024-01-02'),
          deletedBy: null,
          deletedAt: null,
        },
      ]);

      const result = await useCase.execute({
        includeDeleted: false,
        skip: 0,
        take: 100,
      });

      expect(result.tenants).toBeDefined();
      expect(result.tenants.length).toBe(2);
      expect(result.tenants[0]?.id).toBe('tenant-1');
      expect(result.tenants[1]?.id).toBe('tenant-2');
    });

    it('should throw ForbiddenError when user is not master', async () => {
      const { useCase, mockGetUserRepository } = setup();

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
        await useCase.execute({
          includeDeleted: false,
          skip: 0,
          take: 100,
        });
      }).toThrow(ForbiddenError);
    });

    it('should pass pagination parameters to repository', async () => {
      const { useCase, mockListAllTenantsRepository, mockGetUserRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'admin',
        passwordHash: 'hash',
        isMaster: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockListAllTenantsRepository.listAll as ReturnType<typeof mock>).mockResolvedValue([]);

      await useCase.execute({
        includeDeleted: true,
        skip: 10,
        take: 20,
      });

      expect(mockListAllTenantsRepository.listAll).toHaveBeenCalledWith({
        includeDeleted: true,
        skip: 10,
        take: 20,
      });
    });

    it('should log start and success', async () => {
      const { useCase, mockLogger, mockListAllTenantsRepository, mockGetUserRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'admin',
        passwordHash: 'hash',
        isMaster: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockListAllTenantsRepository.listAll as ReturnType<typeof mock>).mockResolvedValue([]);

      await useCase.execute({
        includeDeleted: false,
        skip: 0,
        take: 100,
      });

      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          includeDeleted: false,
          skip: 0,
          take: 100,
        }),
        'list_all_tenants:start',
        'ListAllTenantsUseCase',
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantCount: 0,
        }),
        'list_all_tenants:success',
        'ListAllTenantsUseCase',
      );
    });
  });
});

