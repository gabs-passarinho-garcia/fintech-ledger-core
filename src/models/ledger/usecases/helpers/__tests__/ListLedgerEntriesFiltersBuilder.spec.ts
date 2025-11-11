import { describe, it, expect } from 'bun:test';
import { ListLedgerEntriesFiltersBuilder } from '../ListLedgerEntriesFiltersBuilder';

describe('ListLedgerEntriesFiltersBuilder', () => {
  describe('build', () => {
    it('should build filters with only tenantId', () => {
      const input = {
        tenantId: 'tenant-123',
      };

      const result = ListLedgerEntriesFiltersBuilder.build(input);

      expect(result.tenantId).toBe('tenant-123');
      expect(result.status).toBeUndefined();
      expect(result.type).toBeUndefined();
      expect(result.dateFrom).toBeUndefined();
      expect(result.dateTo).toBeUndefined();
    });

    it('should build filters with all optional parameters', () => {
      const dateFrom = new Date('2024-01-01');
      const dateTo = new Date('2024-01-31');

      const input = {
        tenantId: 'tenant-123',
        status: 'COMPLETED' as const,
        type: 'DEPOSIT' as const,
        dateFrom,
        dateTo,
      };

      const result = ListLedgerEntriesFiltersBuilder.build(input);

      expect(result.tenantId).toBe('tenant-123');
      expect(result.status).toBe('COMPLETED');
      expect(result.type).toBe('DEPOSIT');
      expect(result.dateFrom).toBeInstanceOf(Date);
      expect(result.dateFrom?.getTime()).toBe(dateFrom.getTime());
      expect(result.dateTo).toBeInstanceOf(Date);
      expect(result.dateTo?.getTime()).toBe(dateTo.getTime());
    });

    it('should convert string dates to Date objects', () => {
      const input = {
        tenantId: 'tenant-123',
        dateFrom: '2024-01-01T00:00:00Z',
        dateTo: '2024-01-31T23:59:59Z',
      };

      const result = ListLedgerEntriesFiltersBuilder.build(input);

      expect(result.dateFrom).toBeInstanceOf(Date);
      expect(result.dateTo).toBeInstanceOf(Date);
      expect(result.dateFrom?.toISOString()).toBe(new Date('2024-01-01T00:00:00Z').toISOString());
      expect(result.dateTo?.toISOString()).toBe(new Date('2024-01-31T23:59:59Z').toISOString());
    });

    it('should handle undefined date values', () => {
      const input = {
        tenantId: 'tenant-123',
        dateFrom: undefined,
        dateTo: undefined,
      };

      const result = ListLedgerEntriesFiltersBuilder.build(input);

      expect(result.dateFrom).toBeUndefined();
      expect(result.dateTo).toBeUndefined();
    });

    it('should handle invalid date values', () => {
      const input = {
        tenantId: 'tenant-123',
        dateFrom: 123,
        dateTo: null,
      };

      const result = ListLedgerEntriesFiltersBuilder.build(input);

      expect(result.dateFrom).toBeUndefined();
      expect(result.dateTo).toBeUndefined();
    });

    it('should build filters with status only', () => {
      const input = {
        tenantId: 'tenant-123',
        status: 'PENDING' as const,
      };

      const result = ListLedgerEntriesFiltersBuilder.build(input);

      expect(result.tenantId).toBe('tenant-123');
      expect(result.status).toBe('PENDING');
      expect(result.type).toBeUndefined();
    });

    it('should build filters with type only', () => {
      const input = {
        tenantId: 'tenant-123',
        type: 'WITHDRAWAL' as const,
      };

      const result = ListLedgerEntriesFiltersBuilder.build(input);

      expect(result.tenantId).toBe('tenant-123');
      expect(result.type).toBe('WITHDRAWAL');
      expect(result.status).toBeUndefined();
    });
  });
});

