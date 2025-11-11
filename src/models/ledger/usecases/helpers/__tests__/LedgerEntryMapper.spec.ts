import { describe, it, expect } from 'bun:test';
import { LedgerEntryMapper } from '../LedgerEntryMapper';
import { LedgerEntry } from '../../../domain/LedgerEntry.entity';
import { Decimal } from 'decimal.js';

describe('LedgerEntryMapper', () => {
  const createMockLedgerEntry = (overrides?: Partial<{
    id: string;
    tenantId: string;
    fromAccountId: string | null;
    toAccountId: string | null;
    amount: Decimal;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    createdBy: string;
    updatedBy: string | null;
  }>): LedgerEntry => {
    return LedgerEntry.reconstruct({
      id: overrides?.id || 'entry-1',
      tenantId: overrides?.tenantId || 'tenant-1',
      fromAccountId: overrides?.fromAccountId ?? null,
      toAccountId: overrides?.toAccountId ?? null,
      amount: overrides?.amount || new Decimal('1000.50'),
      type: overrides?.type || 'DEPOSIT',
      status: overrides?.status || 'COMPLETED',
      createdBy: overrides?.createdBy || 'user-1',
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedBy: overrides?.updatedBy ?? null,
      updatedAt: new Date('2024-01-15T10:00:00Z'),
      deletedBy: null,
      deletedAt: null,
    });
  };

  describe('toDto', () => {
    it('should map LedgerEntry to DTO correctly', () => {
      const entry = createMockLedgerEntry({
        id: 'entry-123',
        tenantId: 'tenant-456',
        amount: new Decimal('5000.75'),
        type: 'TRANSFER',
        status: 'PENDING',
      });

      const result = LedgerEntryMapper.toDto(entry);

      expect(result.id).toBe('entry-123');
      expect(result.tenantId).toBe('tenant-456');
      expect(result.amount).toBe('5000.75');
      expect(result.type).toBe('TRANSFER');
      expect(result.status).toBe('PENDING');
      expect(result.createdBy).toBe('user-1');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should map nullable fields correctly', () => {
      const entry = createMockLedgerEntry({
        fromAccountId: 'account-from',
        toAccountId: 'account-to',
        updatedBy: 'user-2',
      });

      const result = LedgerEntryMapper.toDto(entry);

      expect(result.fromAccountId).toBe('account-from');
      expect(result.toAccountId).toBe('account-to');
      expect(result.updatedBy).toBe('user-2');
    });

    it('should map null fields correctly', () => {
      const entry = createMockLedgerEntry({
        fromAccountId: null,
        toAccountId: null,
        updatedBy: null,
      });

      const result = LedgerEntryMapper.toDto(entry);

      expect(result.fromAccountId).toBeNull();
      expect(result.toAccountId).toBeNull();
      expect(result.updatedBy).toBeNull();
    });

    it('should convert Decimal amount to string', () => {
      const entry = createMockLedgerEntry({
        amount: new Decimal('1234.5678'),
      });

      const result = LedgerEntryMapper.toDto(entry);

      expect(result.amount).toBe('1234.5678');
      expect(typeof result.amount).toBe('string');
    });
  });

  describe('toDtoArray', () => {
    it('should map array of LedgerEntry to array of DTOs', () => {
      const entries = [
        createMockLedgerEntry({ id: 'entry-1', amount: new Decimal('100.00') }),
        createMockLedgerEntry({ id: 'entry-2', amount: new Decimal('200.00') }),
        createMockLedgerEntry({ id: 'entry-3', amount: new Decimal('300.00') }),
      ];

      const result = LedgerEntryMapper.toDtoArray(entries);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('entry-1');
      expect(result[0].amount).toBe('100'); // Decimal.js removes trailing zeros
      expect(result[1].id).toBe('entry-2');
      expect(result[1].amount).toBe('200'); // Decimal.js removes trailing zeros
      expect(result[2].id).toBe('entry-3');
      expect(result[2].amount).toBe('300'); // Decimal.js removes trailing zeros
    });

    it('should return empty array when input is empty', () => {
      const result = LedgerEntryMapper.toDtoArray([]);

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

