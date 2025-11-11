import { describe, it, expect, mock } from 'bun:test';
import { CreateLedgerEntryRepository } from '../CreateLedgerEntryRepository';
import { LedgerEntryFactory } from '../../../domain/LedgerEntry.factory';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('CreateLedgerEntryRepository', () => {
  const createMockPrisma = () => {
    const mockCreate = mock(async (args: any) => ({
      id: args.data.id,
      tenantId: args.data.tenantId,
      fromAccountId: args.data.fromAccountId,
      toAccountId: args.data.toAccountId,
      amount: args.data.amount,
      type: args.data.type,
      status: args.data.status,
      createdBy: args.data.createdBy,
      createdAt: args.data.createdAt || new Date(),
      updatedBy: args.data.updatedBy,
      updatedAt: args.data.updatedAt || new Date(),
      deletedBy: null,
      deletedAt: null,
    }));

    return {
      ledgerEntry: {
        create: mockCreate,
      },
    } as unknown as PrismaHandler;
  };

  describe('create', () => {
    it('should create a ledger entry successfully', async () => {
      const mockPrisma = createMockPrisma();
      const repository = new CreateLedgerEntryRepository({ [AppProviders.prisma]: mockPrisma });

      const ledgerEntry = LedgerEntryFactory.create({
        tenantId: 'tenant-1',
        toAccountId: 'account-1',
        amount: '100.00',
        type: 'DEPOSIT',
        createdBy: 'user-1',
      });

      const result = await repository.create({
        ledgerEntry,
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(ledgerEntry.id);
      expect(result.tenantId).toBe('tenant-1');
      expect(mockPrisma.ledgerEntry.create).toHaveBeenCalled();
    });

    it('should use transaction client when provided', async () => {
      const mockTx = {
        ledgerEntry: {
          create: mock(async (args: any) => ({
            id: args.data.id,
            tenantId: args.data.tenantId,
            fromAccountId: args.data.fromAccountId,
            toAccountId: args.data.toAccountId,
            amount: args.data.amount,
            type: args.data.type,
            status: args.data.status,
            createdBy: args.data.createdBy,
            createdAt: args.data.createdAt || new Date(),
            updatedBy: args.data.updatedBy,
            updatedAt: args.data.updatedAt || new Date(),
            deletedBy: null,
            deletedAt: null,
          })),
        },
      } as any;

      const mockPrisma = createMockPrisma();
      const repository = new CreateLedgerEntryRepository({ [AppProviders.prisma]: mockPrisma });

      const ledgerEntry = LedgerEntryFactory.create({
        tenantId: 'tenant-1',
        fromAccountId: 'account-1',
        toAccountId: 'account-2',
        amount: '100.00',
        type: 'TRANSFER',
        createdBy: 'user-1',
      });

      const result = await repository.create({
        ledgerEntry,
        tx: mockTx,
      });

      expect(result).toBeDefined();
      expect(mockTx.ledgerEntry.create).toHaveBeenCalled();
      expect(mockPrisma.ledgerEntry.create).not.toHaveBeenCalled();
    });

    it('should preserve all ledger entry properties', async () => {
      const mockPrisma = createMockPrisma();
      const repository = new CreateLedgerEntryRepository({ [AppProviders.prisma]: mockPrisma });

      const ledgerEntry = LedgerEntryFactory.create({
        tenantId: 'tenant-1',
        fromAccountId: 'account-1',
        toAccountId: 'account-2',
        amount: '250.50',
        type: 'TRANSFER',
        createdBy: 'user-1',
      });

      ledgerEntry.markAsCompleted('user-1');

      const result = await repository.create({
        ledgerEntry,
      });

      expect(result.status).toBe('COMPLETED');
      expect(result.amount.toString()).toBe('250.5');
      expect(result.type).toBe('TRANSFER');
    });
  });
});

