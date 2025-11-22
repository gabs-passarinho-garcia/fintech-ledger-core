import { describe, it, expect, mock } from 'bun:test';
import { ListAllLedgerEntriesUseCase } from '../ListAllLedgerEntriesUseCase';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { ListAllLedgerEntriesRepository } from '../../infra/repositories/ListAllLedgerEntriesRepository';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { GetUserRepository } from '@/models/auth/infra/repositories/GetUserRepository';
import type { GetProfileRepository } from '@/models/auth/infra/repositories/GetProfileRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { ForbiddenError } from '@/common/errors';
import { Decimal } from 'decimal.js';
import { LedgerEntry } from '../../domain/LedgerEntry.entity';

describe('ListAllLedgerEntriesUseCase', () => {
  const setup = () => {
    const mockLogger: ILogger = {
      debug: mock(),
      info: mock(),
      warn: mock(),
      error: mock(),
      log: mock(),
    };

    const mockListAllLedgerEntriesRepository: ListAllLedgerEntriesRepository = {
      listAll: mock(),
    } as unknown as ListAllLedgerEntriesRepository;

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

    const useCase = new ListAllLedgerEntriesUseCase({
      [AppProviders.logger]: mockLogger,
      [AppProviders.listAllLedgerEntriesRepository]: mockListAllLedgerEntriesRepository,
      [AppProviders.sessionHandler]: mockSessionHandler,
      [AppProviders.getUserRepository]: mockGetUserRepository,
      [AppProviders.getProfileRepository]: mockGetProfileRepository,
    });

    return {
      useCase,
      mockLogger,
      mockListAllLedgerEntriesRepository,
      mockSessionHandler,
      mockGetUserRepository,
      mockGetProfileRepository,
    };
  };

  describe('execute', () => {
    it('should return list of all ledger entries when user is master', async () => {
      const { useCase, mockListAllLedgerEntriesRepository, mockGetUserRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'admin',
        passwordHash: 'hash',
        isMaster: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const mockEntry = LedgerEntry.reconstruct({
        id: 'entry-1',
        tenantId: 'tenant-1',
        fromAccountId: 'account-1',
        toAccountId: 'account-2',
        amount: new Decimal('100.00'),
        type: 'TRANSFER',
        status: 'COMPLETED',
        createdBy: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedBy: null,
        updatedAt: new Date('2024-01-01'),
        deletedBy: null,
        deletedAt: null,
      });

      (mockListAllLedgerEntriesRepository.listAll as ReturnType<typeof mock>).mockResolvedValue({
        entries: [mockEntry],
        total: 1,
        page: 1,
        limit: 20,
      });

      const result = await useCase.execute({
        page: 1,
        limit: 20,
      });

      expect(result.entries).toBeDefined();
      expect(result.entries.length).toBe(1);
      expect(result.entries[0]?.id).toBe('entry-1');
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
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
          page: 1,
          limit: 20,
        });
      }).toThrow(ForbiddenError);
    });

    it('should pass filters to repository', async () => {
      const { useCase, mockListAllLedgerEntriesRepository, mockGetUserRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'admin',
        passwordHash: 'hash',
        isMaster: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockListAllLedgerEntriesRepository.listAll as ReturnType<typeof mock>).mockResolvedValue({
        entries: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      await useCase.execute({
        status: 'COMPLETED',
        type: 'TRANSFER',
        tenantId: 'tenant-1',
        page: 1,
        limit: 20,
        includeDeleted: true,
      });

      expect(mockListAllLedgerEntriesRepository.listAll).toHaveBeenCalledWith({
        filters: {
          status: 'COMPLETED',
          type: 'TRANSFER',
          tenantId: 'tenant-1',
        },
        page: 1,
        limit: 20,
        includeDeleted: true,
      });
    });

    it('should normalize pagination parameters', async () => {
      const { useCase, mockListAllLedgerEntriesRepository, mockGetUserRepository } = setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'admin',
        passwordHash: 'hash',
        isMaster: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockListAllLedgerEntriesRepository.listAll as ReturnType<typeof mock>).mockResolvedValue({
        entries: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      await useCase.execute({
        page: undefined,
        limit: undefined,
      });

      expect(mockListAllLedgerEntriesRepository.listAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 20,
        }),
      );
    });

    it('should log start and success', async () => {
      const { useCase, mockLogger, mockListAllLedgerEntriesRepository, mockGetUserRepository } =
        setup();

      (mockGetUserRepository.findById as ReturnType<typeof mock>).mockResolvedValue({
        id: 'user-123',
        username: 'admin',
        passwordHash: 'hash',
        isMaster: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (mockListAllLedgerEntriesRepository.listAll as ReturnType<typeof mock>).mockResolvedValue({
        entries: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      await useCase.execute({
        page: 1,
        limit: 20,
      });

      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 20,
        }),
        'list_all_ledger_entries:start',
        'ListAllLedgerEntriesUseCase',
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          total: 0,
          returned: 0,
        }),
        'list_all_ledger_entries:success',
        'ListAllLedgerEntriesUseCase',
      );
    });
  });
});

