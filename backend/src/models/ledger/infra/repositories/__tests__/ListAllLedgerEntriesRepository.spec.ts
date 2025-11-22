import { describe, it, expect, mock } from 'bun:test';
import { ListAllLedgerEntriesRepository } from '../ListAllLedgerEntriesRepository';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { Decimal } from 'decimal.js';

describe('ListAllLedgerEntriesRepository', () => {
  const setup = () => {
    const mockFindMany = mock(async () => [
      {
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
      },
    ]);

    const mockCount = mock(async () => 1);

    const mockPrisma = {
      ledgerEntry: {
        findMany: mockFindMany,
        count: mockCount,
      },
    } as unknown as PrismaHandler;

    return { mockPrisma, mockFindMany, mockCount };
  };

  describe('listAll', () => {
    it('should list all ledger entries excluding deleted by default', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllLedgerEntriesRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      await repository.listAll({
        page: 1,
        limit: 20,
      });

      expect(mockFindMany).toHaveBeenCalledTimes(1);
      const callArgs = mockFindMany.mock.calls[0]?.[0];
      expect(callArgs?.where?.deletedAt).toBeNull();
    });

    it('should include deleted entries when includeDeleted is true', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllLedgerEntriesRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      await repository.listAll({
        page: 1,
        limit: 20,
        includeDeleted: true,
      });

      const callArgs = mockFindMany.mock.calls[0]?.[0];
      expect(callArgs?.where?.deletedAt).toBeUndefined();
    });

    it('should filter by tenantId when provided', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllLedgerEntriesRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      await repository.listAll({
        filters: {
          tenantId: 'tenant-1',
        },
        page: 1,
        limit: 20,
      });

      const callArgs = mockFindMany.mock.calls[0]?.[0];
      expect(callArgs?.where?.tenantId).toBe('tenant-1');
    });

    it('should filter by status when provided', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllLedgerEntriesRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      await repository.listAll({
        filters: {
          status: 'COMPLETED',
        },
        page: 1,
        limit: 20,
      });

      const callArgs = mockFindMany.mock.calls[0]?.[0];
      expect(callArgs?.where?.status).toBe('COMPLETED');
    });

    it('should filter by type when provided', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllLedgerEntriesRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      await repository.listAll({
        filters: {
          type: 'TRANSFER',
        },
        page: 1,
        limit: 20,
      });

      const callArgs = mockFindMany.mock.calls[0]?.[0];
      expect(callArgs?.where?.type).toBe('TRANSFER');
    });

    it('should filter by date range when provided', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllLedgerEntriesRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      const dateFrom = new Date('2024-01-01');
      const dateTo = new Date('2024-01-31');

      await repository.listAll({
        filters: {
          dateFrom,
          dateTo,
        },
        page: 1,
        limit: 20,
      });

      const callArgs = mockFindMany.mock.calls[0]?.[0];
      expect(callArgs?.where?.createdAt?.gte).toEqual(dateFrom);
      expect(callArgs?.where?.createdAt?.lte).toEqual(dateTo);
    });

    it('should support pagination', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllLedgerEntriesRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      await repository.listAll({
        page: 2,
        limit: 10,
      });

      const callArgs = mockFindMany.mock.calls[0]?.[0];
      expect(callArgs?.skip).toBe(10); // (page - 1) * limit
      expect(callArgs?.take).toBe(10);
    });

    it('should return paginated result with total count', async () => {
      const { mockPrisma, mockCount } = setup();
      const repository = new ListAllLedgerEntriesRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      const result = await repository.listAll({
        page: 1,
        limit: 20,
      });

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockCount).toHaveBeenCalledTimes(1);
    });

    it('should order by createdAt descending', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllLedgerEntriesRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      await repository.listAll({
        page: 1,
        limit: 20,
      });

      const callArgs = mockFindMany.mock.calls[0]?.[0];
      expect(callArgs?.orderBy).toEqual({
        createdAt: 'desc',
      });
    });

    it('should support transaction context', async () => {
      const { mockPrisma } = setup();
      const mockTx = {
        ledgerEntry: {
          findMany: mock(async () => []),
          count: mock(async () => 0),
        },
      };

      const repository = new ListAllLedgerEntriesRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      const result = await repository.listAll({
        page: 1,
        limit: 20,
        tx: mockTx as never,
      });

      expect(result).toBeDefined();
      expect(result.entries).toEqual([]);
    });
  });
});

