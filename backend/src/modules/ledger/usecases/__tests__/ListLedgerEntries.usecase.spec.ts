import { describe, it, expect, mock } from 'bun:test';
import { ListLedgerEntriesUseCase } from '@/models/ledger/usecases/ListLedgerEntries.usecase';
import type { ILogger } from '@/common/interfaces/ILogger';
import type {
  ListLedgerEntriesRepository,
  ListLedgerEntriesResult,
} from '@/models/ledger/infra/repositories/ListLedgerEntriesRepository';
import { DomainError } from '@/common/errors';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { LedgerEntry } from '@/models/ledger/domain/LedgerEntry.entity';
import { Decimal } from 'decimal.js';

describe('ListLedgerEntriesUseCase', () => {
  const setup = () => {
    const mockLogger: ILogger = {
      log: mock(() => {}),
      info: mock(() => {}),
      warn: mock(() => {}),
      error: mock(() => {}),
      debug: mock(() => {}),
    };

    const mockList = mock(async (): Promise<ListLedgerEntriesResult> => ({
      entries: [],
      total: 0,
      page: 1,
      limit: 20,
    }));

    const mockRepository = {
      list: mockList,
    } as unknown as ListLedgerEntriesRepository;

    const useCase = new ListLedgerEntriesUseCase({
      [AppProviders.logger]: mockLogger,
      [AppProviders.listLedgerEntriesRepository]: mockRepository,
    });

    return {
      useCase,
      mockLogger,
      mockRepository: { list: mockList },
    };
  };

  const createMockLedgerEntry = (id: string): LedgerEntry => {
    return LedgerEntry.reconstruct({
      id,
      tenantId: 'tenant-1',
      fromAccountId: null,
      toAccountId: 'account-1',
      amount: new Decimal('1000.00'),
      type: 'DEPOSIT',
      status: 'COMPLETED',
      createdBy: 'user-1',
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedBy: null,
      updatedAt: new Date('2024-01-15T10:00:00Z'),
      deletedBy: null,
      deletedAt: null,
    });
  };

  describe('execute', () => {
    it('should throw DomainError when tenantId is missing', async () => {
      const { useCase } = setup();

      await expect(
        useCase.execute({
          tenantId: '',
        }),
      ).rejects.toThrow(DomainError);

      await expect(
        useCase.execute({
          tenantId: '',
        }),
      ).rejects.toThrow('Tenant ID is required');
    });

    it('should list ledger entries successfully with default pagination', async () => {
      const { useCase, mockRepository } = setup();
      const entries = [createMockLedgerEntry('entry-1'), createMockLedgerEntry('entry-2')];

      mockRepository.list.mockResolvedValue({
        entries,
        total: 2,
        page: 1,
        limit: 20,
      });

      const result = await useCase.execute({
        tenantId: 'tenant-1',
      });

      expect(result.entries).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.totalPages).toBe(1);
      expect(mockRepository.list).toHaveBeenCalledWith({
        filters: {
          tenantId: 'tenant-1',
          status: undefined,
          type: undefined,
          dateFrom: undefined,
          dateTo: undefined,
        },
        page: 1,
        limit: 20,
      });
    });

    it('should use provided pagination parameters', async () => {
      const { useCase, mockRepository } = setup();
      const entries = [createMockLedgerEntry('entry-1')];

      mockRepository.list.mockResolvedValue({
        entries,
        total: 50,
        page: 2,
        limit: 10,
      });

      const result = await useCase.execute({
        tenantId: 'tenant-1',
        page: 2,
        limit: 10,
      });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.totalPages).toBe(5);
      expect(mockRepository.list).toHaveBeenCalledWith({
        filters: expect.any(Object),
        page: 2,
        limit: 10,
      });
    });

    it('should cap limit at 100', async () => {
      const { useCase, mockRepository } = setup();

      mockRepository.list.mockResolvedValue({
        entries: [],
        total: 0,
        page: 1,
        limit: 100,
      });

      await useCase.execute({
        tenantId: 'tenant-1',
        limit: 200,
      });

      expect(mockRepository.list).toHaveBeenCalledWith({
        filters: expect.any(Object),
        page: 1,
        limit: 100,
      });
    });

    it('should apply status filter', async () => {
      const { useCase, mockRepository } = setup();

      mockRepository.list.mockResolvedValue({
        entries: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      await useCase.execute({
        tenantId: 'tenant-1',
        status: 'COMPLETED',
      });

      expect(mockRepository.list).toHaveBeenCalledWith({
        filters: {
          tenantId: 'tenant-1',
          status: 'COMPLETED',
          type: undefined,
          dateFrom: undefined,
          dateTo: undefined,
        },
        page: 1,
        limit: 20,
      });
    });

    it('should apply type filter', async () => {
      const { useCase, mockRepository } = setup();

      mockRepository.list.mockResolvedValue({
        entries: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      await useCase.execute({
        tenantId: 'tenant-1',
        type: 'DEPOSIT',
      });

      expect(mockRepository.list).toHaveBeenCalledWith({
        filters: {
          tenantId: 'tenant-1',
          status: undefined,
          type: 'DEPOSIT',
          dateFrom: undefined,
          dateTo: undefined,
        },
        page: 1,
        limit: 20,
      });
    });

    it('should apply date filters', async () => {
      const { useCase, mockRepository } = setup();
      const dateFrom = new Date('2024-01-01');
      const dateTo = new Date('2024-01-31');

      mockRepository.list.mockResolvedValue({
        entries: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      await useCase.execute({
        tenantId: 'tenant-1',
        dateFrom,
        dateTo,
      });

      expect(mockRepository.list).toHaveBeenCalled();
      const calls = mockRepository.list.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const firstCall = calls[0] as unknown as [
        {
          filters: {
            dateFrom?: Date;
            dateTo?: Date;
          };
        },
      ];
      expect(firstCall[0].filters.dateFrom).toBeInstanceOf(Date);
      expect(firstCall[0].filters.dateTo).toBeInstanceOf(Date);
    });

    it('should convert string dates to Date objects', async () => {
      const { useCase, mockRepository } = setup();

      mockRepository.list.mockResolvedValue({
        entries: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      await useCase.execute({
        tenantId: 'tenant-1',
        dateFrom: '2024-01-01T00:00:00Z' as unknown as Date,
        dateTo: '2024-01-31T23:59:59Z' as unknown as Date,
      });

      expect(mockRepository.list).toHaveBeenCalled();
      const calls = mockRepository.list.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const firstCall = calls[0] as unknown as [
        {
          filters: {
            dateFrom?: Date;
            dateTo?: Date;
          };
        },
      ];
      expect(firstCall[0].filters.dateFrom).toBeInstanceOf(Date);
      expect(firstCall[0].filters.dateTo).toBeInstanceOf(Date);
    });

    it('should map entries to DTOs correctly', async () => {
      const { useCase, mockRepository } = setup();
      const entries = [
        createMockLedgerEntry('entry-1'),
        createMockLedgerEntry('entry-2'),
      ];

      mockRepository.list.mockResolvedValue({
        entries,
        total: 2,
        page: 1,
        limit: 20,
      });

      const result = await useCase.execute({
        tenantId: 'tenant-1',
      });

      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].id).toBe('entry-1');
      expect(result.entries[0].amount).toBe('1000'); // Decimal.js removes trailing zeros
      expect(result.entries[0].type).toBe('DEPOSIT');
      expect(result.entries[0].status).toBe('COMPLETED');
      expect(result.entries[1].id).toBe('entry-2');
    });

    it('should calculate totalPages correctly', async () => {
      const { useCase, mockRepository } = setup();

      mockRepository.list.mockResolvedValue({
        entries: [],
        total: 95,
        page: 1,
        limit: 20,
      });

      const result = await useCase.execute({
        tenantId: 'tenant-1',
      });

      expect(result.pagination.totalPages).toBe(5); // Math.ceil(95 / 20) = 5
    });

    it('should log start and success', async () => {
      const { useCase, mockLogger, mockRepository } = setup();

      mockRepository.list.mockResolvedValue({
        entries: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      await useCase.execute({
        tenantId: 'tenant-1',
      });

      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-1',
        }),
        'list_ledger_entries:start',
        'ListLedgerEntriesUseCase',
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-1',
          total: 0,
          returned: 0,
        }),
        'list_ledger_entries:success',
        'ListLedgerEntriesUseCase',
      );
    });
  });
});

