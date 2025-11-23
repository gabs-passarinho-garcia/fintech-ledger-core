import { describe, it, expect, mock } from 'bun:test';
import { GetAccountRepository } from '../GetAccountRepository';
import { NotFoundError } from '@/common/errors';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { Decimal } from 'decimal.js';
import type { AccountData } from '../GetAccountRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('GetAccountRepository', () => {
  const createMockPrisma = (account: any = null) => {
    const mockFindFirst = mock(async () => account);

    return {
      account: {
        findFirst: mockFindFirst,
      },
    } as unknown as PrismaHandler;
  };

  describe('findById', () => {
    it('should return account when found', async () => {
      const mockAccount: AccountData = {
        id: 'account-1',
        tenantId: 'tenant-1',
        profileId: null,
        name: 'Test Account',
        balance: new Decimal('1000.00') as any,
      };

      const mockPrisma = createMockPrisma(mockAccount);
      const repository = new GetAccountRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.findById({
        accountId: 'account-1',
        tenantId: 'tenant-1',
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe('account-1');
      expect(result?.tenantId).toBe('tenant-1');
      expect(mockPrisma.account.findFirst).toHaveBeenCalled();
    });

    it('should return null when account not found', async () => {
      const mockPrisma = createMockPrisma(null);
      const repository = new GetAccountRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.findById({
        accountId: 'non-existent',
        tenantId: 'tenant-1',
      });

      expect(result).toBeNull();
    });

    it('should use transaction client when provided', async () => {
      const mockAccount: AccountData = {
        id: 'account-1',
        tenantId: 'tenant-1',
        profileId: null,
        name: 'Test Account',
        balance: new Decimal('1000.00') as any,
      };

      const mockTx = {
        account: {
          findFirst: mock(async () => mockAccount),
        },
      } as any;

      const mockPrisma = createMockPrisma(mockAccount);
      const repository = new GetAccountRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.findById({
        accountId: 'account-1',
        tenantId: 'tenant-1',
        tx: mockTx,
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe('account-1');
      expect(mockTx.account.findFirst).toHaveBeenCalled();
    });
  });

  describe('findByIdOrThrow', () => {
    it('should return account when found', async () => {
      const mockAccount: AccountData = {
        id: 'account-1',
        tenantId: 'tenant-1',
        profileId: null,
        name: 'Test Account',
        balance: new Decimal('1000.00') as any,
      };

      const mockPrisma = createMockPrisma(mockAccount);
      const repository = new GetAccountRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.findByIdOrThrow({
        accountId: 'account-1',
        tenantId: 'tenant-1',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('account-1');
      expect(result.tenantId).toBe('tenant-1');
    });

    it('should throw NotFoundError when account not found', async () => {
      const mockPrisma = createMockPrisma(null);
      const repository = new GetAccountRepository({ [AppProviders.prisma]: mockPrisma });

      await expect(
        repository.findByIdOrThrow({
          accountId: 'non-existent',
          tenantId: 'tenant-1',
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});

