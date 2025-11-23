import { describe, it, expect, mock } from 'bun:test';
import { ListTenantsByUserUseCase } from '../ListTenantsByUserUseCase';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { ListTenantsByUserRepository } from '../../infra/repositories/ListTenantsByUserRepository';
import type { ListAllTenantsRepository } from '../../infra/repositories/ListAllTenantsRepository';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { GetUserRepository } from '@/models/auth/infra/repositories/GetUserRepository';
import type { GetProfileRepository } from '@/models/auth/infra/repositories/GetProfileRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('ListTenantsByUserUseCase', () => {
  const setup = () => {
    const mockLogger: ILogger = {
      debug: mock(),
      info: mock(),
      warn: mock(),
      error: mock(),
      log: mock(),
    };

    const mockListTenantsByUserRepository: ListTenantsByUserRepository = {
      listByUserId: mock(),
    } as unknown as ListTenantsByUserRepository;

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

    const useCase = new ListTenantsByUserUseCase({
      [AppProviders.logger]: mockLogger,
      [AppProviders.listTenantsByUserRepository]: mockListTenantsByUserRepository,
      [AppProviders.listAllTenantsRepository]: mockListAllTenantsRepository,
      [AppProviders.sessionHandler]: mockSessionHandler,
      [AppProviders.getUserRepository]: mockGetUserRepository,
      [AppProviders.getProfileRepository]: mockGetProfileRepository,
    });

    return {
      useCase,
      mockLogger,
      mockListTenantsByUserRepository,
      mockListAllTenantsRepository,
      mockSessionHandler,
      mockGetUserRepository,
      mockGetProfileRepository,
    };
  };

  describe('execute', () => {
    it('should return list of tenants for authenticated user', async () => {
      const { useCase, mockListTenantsByUserRepository, mockGetUserRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'user',
        passwordHash: 'hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockListTenantsByUserRepository.listByUserId as ReturnType<typeof mock>).mockResolvedValue([
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
          createdBy: 'user-123',
          createdAt: new Date('2024-01-02'),
          updatedBy: null,
          updatedAt: new Date('2024-01-02'),
          deletedBy: null,
          deletedAt: null,
        },
      ]);

      const result = await useCase.execute({});

      expect(result.tenants).toBeDefined();
      expect(result.tenants.length).toBe(2);
      expect(result.tenants[0]?.id).toBe('tenant-1');
      expect(result.tenants[0]?.name).toBe('Tenant 1');
      expect(result.tenants[1]?.id).toBe('tenant-2');
    });

    it('should return empty array when user has no tenants', async () => {
      const { useCase, mockListTenantsByUserRepository, mockGetUserRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'user',
        passwordHash: 'hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockListTenantsByUserRepository.listByUserId as ReturnType<typeof mock>).mockResolvedValue(
        [],
      );

      const result = await useCase.execute({});

      expect(result.tenants).toEqual([]);
    });

    it('should call repository with authenticated user ID', async () => {
      const { useCase, mockListTenantsByUserRepository, mockGetUserRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'user',
        passwordHash: 'hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockListTenantsByUserRepository.listByUserId as ReturnType<typeof mock>).mockResolvedValue(
        [],
      );

      await useCase.execute({});

      expect(mockListTenantsByUserRepository.listByUserId).toHaveBeenCalledWith({
        userId: 'user-123',
      });
    });

    it('should log start and success', async () => {
      const { useCase, mockLogger, mockListTenantsByUserRepository, mockGetUserRepository } =
        setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'user',
        passwordHash: 'hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockListTenantsByUserRepository.listByUserId as ReturnType<typeof mock>).mockResolvedValue(
        [],
      );

      await useCase.execute({});

      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
        }),
        'list_tenants_by_user:start',
        'ListTenantsByUserUseCase',
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          tenantCount: 0,
          isMaster: false,
        }),
        'list_tenants_by_user:success',
        'ListTenantsByUserUseCase',
      );
    });

    it('should return all tenants when user is master', async () => {
      const {
        useCase,
        mockListAllTenantsRepository,
        mockListTenantsByUserRepository,
        mockGetUserRepository,
      } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'master',
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
          createdBy: 'user-1',
          createdAt: new Date('2024-01-01'),
          updatedBy: null,
          updatedAt: new Date('2024-01-01'),
          deletedBy: null,
          deletedAt: null,
        },
        {
          id: 'tenant-2',
          name: 'Tenant 2',
          createdBy: 'user-2',
          createdAt: new Date('2024-01-02'),
          updatedBy: null,
          updatedAt: new Date('2024-01-02'),
          deletedBy: null,
          deletedAt: null,
        },
        {
          id: 'tenant-3',
          name: 'Tenant 3',
          createdBy: 'user-3',
          createdAt: new Date('2024-01-03'),
          updatedBy: null,
          updatedAt: new Date('2024-01-03'),
          deletedBy: null,
          deletedAt: null,
        },
      ]);

      const result = await useCase.execute({});

      expect(result.tenants).toBeDefined();
      expect(result.tenants.length).toBe(3);
      expect(result.tenants[0]?.id).toBe('tenant-1');
      expect(result.tenants[1]?.id).toBe('tenant-2');
      expect(result.tenants[2]?.id).toBe('tenant-3');
      expect(mockListAllTenantsRepository.listAll).toHaveBeenCalledWith({
        includeDeleted: false,
      });
      expect(mockListTenantsByUserRepository.listByUserId).not.toHaveBeenCalled();
    });

    it('should not return deleted tenants for master users', async () => {
      const { useCase, mockListAllTenantsRepository, mockGetUserRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'master',
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
          createdBy: 'user-1',
          createdAt: new Date('2024-01-01'),
          updatedBy: null,
          updatedAt: new Date('2024-01-01'),
          deletedBy: null,
          deletedAt: null,
        },
        {
          id: 'tenant-2',
          name: 'Tenant 2',
          createdBy: 'user-2',
          createdAt: new Date('2024-01-02'),
          updatedBy: null,
          updatedAt: new Date('2024-01-02'),
          deletedBy: 'user-123',
          deletedAt: new Date('2024-01-03'),
        },
      ]);

      const result = await useCase.execute({});

      expect(result.tenants).toBeDefined();
      expect(result.tenants.length).toBe(2);
      expect(mockListAllTenantsRepository.listAll).toHaveBeenCalledWith({
        includeDeleted: false,
      });
    });

    it('should use ListTenantsByUserRepository when user is not master', async () => {
      const {
        useCase,
        mockListTenantsByUserRepository,
        mockListAllTenantsRepository,
        mockGetUserRepository,
      } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'user',
        passwordHash: 'hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockListTenantsByUserRepository.listByUserId as ReturnType<typeof mock>).mockResolvedValue([
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
      ]);

      await useCase.execute({});

      expect(mockListTenantsByUserRepository.listByUserId).toHaveBeenCalledWith({
        userId: 'user-123',
      });
      expect(mockListAllTenantsRepository.listAll).not.toHaveBeenCalled();
    });
  });
});

