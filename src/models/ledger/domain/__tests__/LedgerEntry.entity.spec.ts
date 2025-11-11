import { describe, it, expect } from 'bun:test';
import { Decimal } from 'decimal.js';
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

  describe('LedgerEntryFactory.reconstruct', () => {
    it('should reconstruct ledger entry with all fields', () => {
      const createdAt = new Date('2024-01-01T10:00:00Z');
      const updatedAt = new Date('2024-01-01T11:00:00Z');

      const entry = LedgerEntryFactory.reconstruct({
        id: 'entry-1',
        tenantId: 'tenant-1',
        fromAccountId: 'account-1',
        toAccountId: 'account-2',
        amount: '250.50',
        type: 'TRANSFER',
        status: 'COMPLETED',
        createdBy: 'user-1',
        createdAt,
        updatedBy: 'user-2',
        updatedAt,
        deletedBy: null,
        deletedAt: null,
      });

      expect(entry.id).toBe('entry-1');
      expect(entry.tenantId).toBe('tenant-1');
      expect(entry.fromAccountId).toBe('account-1');
      expect(entry.toAccountId).toBe('account-2');
      expect(entry.amount.toString()).toBe('250.5');
      expect(entry.type).toBe('TRANSFER');
      expect(entry.status).toBe('COMPLETED');
      expect(entry.createdBy).toBe('user-1');
      expect(entry.createdAt).toBe(createdAt);
      expect(entry.updatedBy).toBe('user-2');
      expect(entry.updatedAt).toBe(updatedAt);
      expect(entry.deletedBy).toBeNull();
      expect(entry.deletedAt).toBeNull();
    });

    it('should reconstruct ledger entry with amount as Decimal', () => {
      const amount = new Decimal('100.75');
      const now = new Date();

      const entry = LedgerEntryFactory.reconstruct({
        id: 'entry-2',
        tenantId: 'tenant-1',
        fromAccountId: null,
        toAccountId: 'account-1',
        amount,
        type: 'DEPOSIT',
        status: 'PENDING',
        createdBy: 'user-1',
        createdAt: now,
        updatedBy: null,
        updatedAt: now,
        deletedBy: null,
        deletedAt: null,
      });

      expect(entry.amount).toBe(amount);
      expect(entry.amount.toString()).toBe('100.75');
    });

    it('should reconstruct ledger entry with amount as number', () => {
      const now = new Date();

      const entry = LedgerEntryFactory.reconstruct({
        id: 'entry-3',
        tenantId: 'tenant-1',
        fromAccountId: 'account-1',
        toAccountId: null,
        amount: 50.25,
        type: 'WITHDRAWAL',
        status: 'COMPLETED',
        createdBy: 'user-1',
        createdAt: now,
        updatedBy: 'user-1',
        updatedAt: now,
        deletedBy: null,
        deletedAt: null,
      });

      expect(entry.amount.toString()).toBe('50.25');
    });

    it('should reconstruct ledger entry with amount as string', () => {
      const now = new Date();

      const entry = LedgerEntryFactory.reconstruct({
        id: 'entry-4',
        tenantId: 'tenant-1',
        fromAccountId: 'account-1',
        toAccountId: 'account-2',
        amount: '999.99',
        type: 'TRANSFER',
        status: 'FAILED',
        createdBy: 'user-1',
        createdAt: now,
        updatedBy: 'user-1',
        updatedAt: now,
        deletedBy: null,
        deletedAt: null,
      });

      expect(entry.amount.toString()).toBe('999.99');
    });

    it('should reconstruct ledger entry with null optional fields', () => {
      const now = new Date();

      const entry = LedgerEntryFactory.reconstruct({
        id: 'entry-5',
        tenantId: 'tenant-1',
        fromAccountId: null,
        toAccountId: null,
        amount: '100.00',
        type: 'DEPOSIT',
        status: 'PENDING',
        createdBy: 'user-1',
        createdAt: now,
        updatedBy: null,
        updatedAt: now,
        deletedBy: null,
        deletedAt: null,
      });

      expect(entry.fromAccountId).toBeNull();
      expect(entry.toAccountId).toBeNull();
      expect(entry.updatedBy).toBeNull();
      expect(entry.deletedBy).toBeNull();
      expect(entry.deletedAt).toBeNull();
    });

    it('should reconstruct ledger entry with undefined optional fields', () => {
      const now = new Date();

      const entry = LedgerEntryFactory.reconstruct({
        id: 'entry-6',
        tenantId: 'tenant-1',
        fromAccountId: undefined,
        toAccountId: undefined,
        amount: '200.00',
        type: 'WITHDRAWAL',
        status: 'COMPLETED',
        createdBy: 'user-1',
        createdAt: now,
        updatedBy: undefined,
        updatedAt: now,
        deletedBy: undefined,
        deletedAt: undefined,
      });

      expect(entry.fromAccountId).toBeNull();
      expect(entry.toAccountId).toBeNull();
      expect(entry.updatedBy).toBeNull();
      expect(entry.deletedBy).toBeNull();
      expect(entry.deletedAt).toBeNull();
    });

    it('should reconstruct ledger entry with deleted fields', () => {
      const now = new Date();
      const deletedAt = new Date('2024-01-02T12:00:00Z');

      const entry = LedgerEntryFactory.reconstruct({
        id: 'entry-7',
        tenantId: 'tenant-1',
        fromAccountId: 'account-1',
        toAccountId: 'account-2',
        amount: '150.00',
        type: 'TRANSFER',
        status: 'COMPLETED',
        createdBy: 'user-1',
        createdAt: now,
        updatedBy: 'user-1',
        updatedAt: now,
        deletedBy: 'user-2',
        deletedAt,
      });

      expect(entry.deletedBy).toBe('user-2');
      expect(entry.deletedAt).toBe(deletedAt);
    });

    it('should preserve all database fields correctly', () => {
      const createdAt = new Date('2024-01-01T08:00:00Z');
      const updatedAt = new Date('2024-01-01T09:00:00Z');
      const deletedAt = new Date('2024-01-01T10:00:00Z');

      const entry = LedgerEntryFactory.reconstruct({
        id: 'entry-8',
        tenantId: 'tenant-2',
        fromAccountId: 'account-3',
        toAccountId: 'account-4',
        amount: '500.00',
        type: 'TRANSFER',
        status: 'FAILED',
        createdBy: 'user-3',
        createdAt,
        updatedBy: 'user-4',
        updatedAt,
        deletedBy: 'user-5',
        deletedAt,
      });

      expect(entry.id).toBe('entry-8');
      expect(entry.tenantId).toBe('tenant-2');
      expect(entry.fromAccountId).toBe('account-3');
      expect(entry.toAccountId).toBe('account-4');
      expect(entry.amount.toString()).toBe('500');
      expect(entry.type).toBe('TRANSFER');
      expect(entry.status).toBe('FAILED');
      expect(entry.createdBy).toBe('user-3');
      expect(entry.createdAt).toBe(createdAt);
      expect(entry.updatedBy).toBe('user-4');
      expect(entry.updatedAt).toBe(updatedAt);
      expect(entry.deletedBy).toBe('user-5');
      expect(entry.deletedAt).toBe(deletedAt);
    });
  });
});

