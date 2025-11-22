import { describe, it, expect, mock } from 'bun:test';
import { DeleteUserUseCase } from '../DeleteUserUseCase';
import type { ITransactionManager } from '@/common/adapters/ITransactionManager';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { DeleteUserRepository } from '../../infra/repositories/DeleteUserRepository';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { GetUserRepository } from '../../infra/repositories/GetUserRepository';
import type { GetProfileRepository } from '../../infra/repositories/GetProfileRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { ForbiddenError } from '@/common/errors';

describe('DeleteUserUseCase', () => {
  const setup = () => {
    const mockLogger: ILogger = {
      log: mock(),
      debug: mock(),
      info: mock(),
      warn: mock(),
      error: mock(),
    };

    const mockDeleteUserRepository: DeleteUserRepository = {
      delete: mock(),
    } as unknown as DeleteUserRepository;

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

    const mockGetProfileRepository: GetProfileRepository = {
      findById: mock(),
    } as unknown as GetProfileRepository;

    const mockTransactionManager: ITransactionManager = {
      runInTransaction: mock(async (fn) => await fn({ prisma: {} as never })),
    } as unknown as ITransactionManager;

    const useCase = new DeleteUserUseCase({
      [AppProviders.transactionManager]: mockTransactionManager,
      [AppProviders.logger]: mockLogger,
      [AppProviders.deleteUserRepository]: mockDeleteUserRepository,
      [AppProviders.sessionHandler]: mockSessionHandler,
      [AppProviders.getUserRepository]: mockGetUserRepository,
      [AppProviders.getProfileRepository]: mockGetProfileRepository,
    });

    return {
      useCase,
      mockLogger,
      mockDeleteUserRepository,
      mockSessionHandler,
      mockGetUserRepository,
      mockTransactionManager,
    };
  };

  describe('execute', () => {
    it('should delete user and profiles when user is owner', async () => {
      const { useCase, mockGetUserRepository, mockTransactionManager } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'user',
        passwordHash: 'hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const result = await useCase.execute({ userId: 'user-123' });

      expect(result.success).toBe(true);
      expect(mockTransactionManager.runInTransaction).toHaveBeenCalledTimes(1);
    });

    it('should delete user and profiles when user is master', async () => {
      const { useCase, mockGetUserRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'admin',
        passwordHash: 'hash',
        isMaster: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const result = await useCase.execute({ userId: 'user-456' });

      expect(result.success).toBe(true);
    });

    it('should throw ForbiddenError when user is not authorized', async () => {
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
        await useCase.execute({ userId: 'user-456' });
      }).toThrow(ForbiddenError);
    });

    it('should execute within transaction', async () => {
      const { useCase, mockGetUserRepository, mockTransactionManager } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'user',
        passwordHash: 'hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await useCase.execute({ userId: 'user-123' });

      expect(mockTransactionManager.runInTransaction).toHaveBeenCalledTimes(1);
    });
  });
});

