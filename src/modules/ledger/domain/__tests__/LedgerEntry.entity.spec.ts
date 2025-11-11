import { describe, it, expect } from 'bun:test';
import { LedgerEntryFactory } from '../LedgerEntry.factory';
import { DomainError } from '@/common/errors';

describe('LedgerEntry Entity', () => {

  describe('LedgerEntryFactory.create', () => {
    it('should create a valid ledger entry for TRANSFER', () => {
      const entry = LedgerEntryFactory.create({
        tenantId: 'tenant-1',
        fromAccountId: 'account-1',
        toAccountId: 'account-2',
        amount: '100.00',
        type: 'TRANSFER',
        createdBy: 'user-1',
      });

      expect(entry.id).toBeDefined();
      expect(entry.tenantId).toBe('tenant-1');
      expect(entry.fromAccountId).toBe('account-1');
      expect(entry.toAccountId).toBe('account-2');
      expect(entry.amount.toString()).toBe('100');
      expect(entry.type).toBe('TRANSFER');
      expect(entry.status).toBe('PENDING');
    });

    it('should create a valid ledger entry for DEPOSIT', () => {
      const entry = LedgerEntryFactory.create({
        tenantId: 'tenant-1',
        toAccountId: 'account-1',
        amount: '50.00',
        type: 'DEPOSIT',
        createdBy: 'user-1',
      });

      expect(entry.type).toBe('DEPOSIT');
      expect(entry.toAccountId).toBe('account-1');
      expect(entry.fromAccountId).toBeNull();
    });

    it('should create a valid ledger entry for WITHDRAWAL', () => {
      const entry = LedgerEntryFactory.create({
        tenantId: 'tenant-1',
        fromAccountId: 'account-1',
        amount: '25.00',
        type: 'WITHDRAWAL',
        createdBy: 'user-1',
      });

      expect(entry.type).toBe('WITHDRAWAL');
      expect(entry.fromAccountId).toBe('account-1');
      expect(entry.toAccountId).toBeNull();
    });

    it('should throw DomainError for negative amount', () => {
      expect(() => {
        LedgerEntryFactory.create({
          tenantId: 'tenant-1',
          toAccountId: 'account-1',
          amount: '-10.00',
          type: 'DEPOSIT',
          createdBy: 'user-1',
        });
      }).toThrow(DomainError);
    });

    it('should throw DomainError for zero amount', () => {
      expect(() => {
        LedgerEntryFactory.create({
          tenantId: 'tenant-1',
          toAccountId: 'account-1',
          amount: '0',
          type: 'DEPOSIT',
          createdBy: 'user-1',
        });
      }).toThrow(DomainError);
    });

    it('should throw DomainError for TRANSFER without both accounts', () => {
      expect(() => {
        LedgerEntryFactory.create({
          tenantId: 'tenant-1',
          fromAccountId: 'account-1',
          amount: '100.00',
          type: 'TRANSFER',
          createdBy: 'user-1',
        });
      }).toThrow(DomainError);
    });

    it('should throw DomainError for TRANSFER with same account', () => {
      expect(() => {
        LedgerEntryFactory.create({
          tenantId: 'tenant-1',
          fromAccountId: 'account-1',
          toAccountId: 'account-1',
          amount: '100.00',
          type: 'TRANSFER',
          createdBy: 'user-1',
        });
      }).toThrow(DomainError);
    });
  });

  describe('LedgerEntry.markAsCompleted', () => {
    it('should mark entry as completed', () => {
      const entry = LedgerEntryFactory.create({
        tenantId: 'tenant-1',
        toAccountId: 'account-1',
        amount: '100.00',
        type: 'DEPOSIT',
        createdBy: 'user-1',
      });

      entry.markAsCompleted('user-1');

      expect(entry.status).toBe('COMPLETED');
      expect(entry.updatedBy).toBe('user-1');
    });

    it('should throw DomainError when marking already completed entry', () => {
      const entry = LedgerEntryFactory.create({
        tenantId: 'tenant-1',
        toAccountId: 'account-1',
        amount: '100.00',
        type: 'DEPOSIT',
        createdBy: 'user-1',
      });

      entry.markAsCompleted('user-1');

      expect(() => {
        entry.markAsCompleted('user-1');
      }).toThrow(DomainError);
    });
  });

  describe('LedgerEntry.markAsFailed', () => {
    it('should mark entry as failed', () => {
      const entry = LedgerEntryFactory.create({
        tenantId: 'tenant-1',
        toAccountId: 'account-1',
        amount: '100.00',
        type: 'DEPOSIT',
        createdBy: 'user-1',
      });

      entry.markAsFailed('user-1');

      expect(entry.status).toBe('FAILED');
      expect(entry.updatedBy).toBe('user-1');
    });
  });
});

