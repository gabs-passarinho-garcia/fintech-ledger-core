import { describe, it, expect, mock } from 'bun:test';
import { UpdateAccountBalanceRepository } from '../UpdateAccountBalanceRepository';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { Decimal } from 'decimal.js';
import { DomainError } from '@/common/errors';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('UpdateAccountBalanceRepository', () => {
  const createMockPrisma = () => {
    return {} as unknown as PrismaHandler;
  };

  describe('debit', () => {
    it('should debit amount from account balance', async () => {
      const mockAccount = {
        id: 'account-1',
        tenantId: 'tenant-1',
        balance: { toString: () => '1000.00' },
      };

      const mockFindFirst = mock(async () => mockAccount);
      const mockUpdate = mock(async () => ({
        ...mockAccount,
        balance: { toString: () => '900.00' },
      }));

      const mockTx = {
        account: {
          findFirst: mockFindFirst,
          update: mockUpdate,
        },
      } as any;

      const mockPrisma = createMockPrisma();
      const repository = new UpdateAccountBalanceRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.debit({
        accountId: 'account-1',
        tenantId: 'tenant-1',
        amount: new Decimal('100.00'),
        tx: mockTx,
      });

      expect(result.toString()).toBe('900');
      expect(mockTx.account.findFirst).toHaveBeenCalled();
      expect(mockTx.account.update).toHaveBeenCalled();
    });

    it('should throw DomainError when account not found', async () => {
      const mockFindFirst = mock(async () => null);
      const mockTx = {
        account: {
          findFirst: mockFindFirst,
        },
      } as any;

      const mockPrisma = createMockPrisma();
      const repository = new UpdateAccountBalanceRepository({ [AppProviders.prisma]: mockPrisma });

      await expect(
        repository.debit({
          accountId: 'non-existent',
          tenantId: 'tenant-1',
          amount: new Decimal('100.00'),
          tx: mockTx,
        }),
      ).rejects.toThrow(DomainError);
    });

    it('should throw DomainError when insufficient balance', async () => {
      const mockAccount = {
        id: 'account-1',
        tenantId: 'tenant-1',
        balance: { toString: () => '50.00' },
      };

      const mockFindFirst = mock(async () => mockAccount);
      const mockTx = {
        account: {
          findFirst: mockFindFirst,
        },
      } as any;

      const mockPrisma = createMockPrisma();
      const repository = new UpdateAccountBalanceRepository({ [AppProviders.prisma]: mockPrisma });

      await expect(
        repository.debit({
          accountId: 'account-1',
          tenantId: 'tenant-1',
          amount: new Decimal('100.00'),
          tx: mockTx,
        }),
      ).rejects.toThrow(DomainError);
    });
  });

  describe('credit', () => {
    it('should credit amount to account balance', async () => {
      const mockAccount = {
        id: 'account-1',
        tenantId: 'tenant-1',
        balance: { toString: () => '1000.00' },
      };

      const mockFindFirst = mock(async () => mockAccount);
      const mockUpdate = mock(async () => ({
        ...mockAccount,
        balance: { toString: () => '1100.00' },
      }));

      const mockTx = {
        account: {
          findFirst: mockFindFirst,
          update: mockUpdate,
        },
      } as any;

      const mockPrisma = createMockPrisma();
      const repository = new UpdateAccountBalanceRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.credit({
        accountId: 'account-1',
        tenantId: 'tenant-1',
        amount: new Decimal('100.00'),
        tx: mockTx,
      });

      expect(result.toString()).toBe('1100');
      expect(mockTx.account.findFirst).toHaveBeenCalled();
      expect(mockTx.account.update).toHaveBeenCalled();
    });

    it('should throw DomainError when account not found', async () => {
      const mockFindFirst = mock(async () => null);
      const mockTx = {
        account: {
          findFirst: mockFindFirst,
        },
      } as any;

      const mockPrisma = createMockPrisma();
      const repository = new UpdateAccountBalanceRepository({ [AppProviders.prisma]: mockPrisma });

      await expect(
        repository.credit({
          accountId: 'non-existent',
          tenantId: 'tenant-1',
          amount: new Decimal('100.00'),
          tx: mockTx,
        }),
      ).rejects.toThrow(DomainError);
    });
  });
});

