import { describe, it, expect, mock } from 'bun:test';
import { CreateProfileUseCase } from '../CreateProfileUseCase';
import type { ITransactionManager } from '@/common/adapters/ITransactionManager';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { CreateProfileRepository } from '../../infra/repositories/CreateProfileRepository';
import type { GetProfileRepository } from '../../infra/repositories/GetProfileRepository';
import type { GetTenantRepository } from '@/models/tenant/infra/repositories/GetTenantRepository';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { GetUserRepository } from '../../infra/repositories/GetUserRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { NotFoundError, InternalError } from '@/common/errors';
import { ProfileFactory } from '../../domain/Profile.factory';

describe('CreateProfileUseCase', () => {
  const setup = () => {
    const mockLogger: ILogger = {
      debug: mock(),
      info: mock(),
      warn: mock(),
      error: mock(),
      log: mock(),
    };

    const mockCreateProfileRepository: CreateProfileRepository = {
      create: mock(),
    } as unknown as CreateProfileRepository;

    const mockGetProfileRepository: GetProfileRepository = {
      findByUserIdAndTenantId: mock(),
      findById: mock(),
    } as unknown as GetProfileRepository;

    const mockGetTenantRepository: GetTenantRepository = {
      findById: mock(),
    } as unknown as GetTenantRepository;

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
    } as unknown as SessionHandler;

    const mockGetUserRepository: GetUserRepository = {
      findById: mock(),
    } as unknown as GetUserRepository;

    const mockTransactionManager: ITransactionManager = {
      runInTransaction: mock(async (fn) => await fn({ prisma: {} as never })),
    } as unknown as ITransactionManager;

    const useCase = new CreateProfileUseCase({
      [AppProviders.transactionManager]: mockTransactionManager,
      [AppProviders.logger]: mockLogger,
      [AppProviders.createProfileRepository]: mockCreateProfileRepository,
      [AppProviders.getProfileRepository]: mockGetProfileRepository,
      [AppProviders.getTenantRepository]: mockGetTenantRepository,
      [AppProviders.sessionHandler]: mockSessionHandler,
      [AppProviders.getUserRepository]: mockGetUserRepository,
    });

    return {
      useCase,
      mockLogger,
      mockCreateProfileRepository,
      mockGetProfileRepository,
      mockGetTenantRepository,
      mockSessionHandler,
      mockTransactionManager,
    };
  };

  describe('execute', () => {
    it('should create profile with success', async () => {
      const {
        useCase,
        mockGetTenantRepository,
        mockGetProfileRepository,
        mockCreateProfileRepository,
        mockGetUserRepository,
      } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
        passwordHash: 'hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockGetTenantRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'tenant-123',
        name: 'Test Tenant',
        deletedAt: null,
      });

      (mockGetProfileRepository.findByUserIdAndTenantId as ReturnType<typeof mock>).mockResolvedValue(
        null,
      );

      const profile = ProfileFactory.create({
        userId: 'user-123',
        tenantId: 'tenant-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      });

      (mockCreateProfileRepository.create as ReturnType<typeof mock>).mockResolvedValue(profile);

      const input = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        tenantId: 'tenant-123',
      };

      const result = await useCase.execute(input);

      expect(result.id).toBe(profile.id);
      expect(result.userId).toBe('user-123');
      expect(result.tenantId).toBe('tenant-123');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.email).toBe('john.doe@example.com');
    });

    it('should throw NotFoundError when tenant does not exist', async () => {
      const { useCase, mockGetTenantRepository, mockGetUserRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
        passwordHash: 'hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockGetTenantRepository.findById as ReturnType<typeof mock>).mockResolvedValue(null);

      const input = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        tenantId: 'non-existent-tenant',
      };

      await expect(async () => {
        await useCase.execute(input);
      }).toThrow(NotFoundError);
    });

    it('should throw NotFoundError when tenant is deleted', async () => {
      const { useCase, mockGetTenantRepository, mockGetUserRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
        passwordHash: 'hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockGetTenantRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'tenant-123',
        name: 'Deleted Tenant',
        deletedAt: new Date(),
      });

      const input = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        tenantId: 'tenant-123',
      };

      await expect(async () => {
        await useCase.execute(input);
      }).toThrow(NotFoundError);
    });

    it('should throw InternalError when user already has profile for tenant', async () => {
      const {
        useCase,
        mockGetTenantRepository,
        mockGetProfileRepository,
        mockGetUserRepository,
      } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
        passwordHash: 'hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockGetTenantRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'tenant-123',
        name: 'Test Tenant',
        deletedAt: null,
      });

      const existingProfile = ProfileFactory.create({
        userId: 'user-123',
        tenantId: 'tenant-123',
        firstName: 'Existing',
        lastName: 'Profile',
        email: 'existing@example.com',
      });

      (mockGetProfileRepository.findByUserIdAndTenantId as ReturnType<typeof mock>).mockResolvedValue(
        existingProfile,
      );

      const input = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        tenantId: 'tenant-123',
      };

      await expect(async () => {
        await useCase.execute(input);
      }).toThrow(InternalError);
    });

    it('should create profile within transaction', async () => {
      const {
        useCase,
        mockGetTenantRepository,
        mockGetProfileRepository,
        mockCreateProfileRepository,
        mockTransactionManager,
        mockGetUserRepository,
      } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
        passwordHash: 'hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockGetTenantRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'tenant-123',
        name: 'Test Tenant',
        deletedAt: null,
      });

      (mockGetProfileRepository.findByUserIdAndTenantId as ReturnType<typeof mock>).mockResolvedValue(
        null,
      );

      const profile = ProfileFactory.create({
        userId: 'user-123',
        tenantId: 'tenant-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      });

      (mockCreateProfileRepository.create as ReturnType<typeof mock>).mockResolvedValue(profile);

      const input = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        tenantId: 'tenant-123',
      };

      await useCase.execute(input);

      expect(mockTransactionManager.runInTransaction).toHaveBeenCalledTimes(1);
    });
  });
});

