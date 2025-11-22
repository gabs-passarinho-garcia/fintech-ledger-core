import { describe, it, expect } from 'bun:test';
import { QueryParameterConverter } from '../QueryParameterConverter';

describe('QueryParameterConverter', () => {
  describe('toDate', () => {
    it('should return Date object when value is already a Date', () => {
      const date = new Date('2024-01-15');
      const result = QueryParameterConverter.toDate(date);

      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(date.getTime());
    });

    it('should convert string to Date', () => {
      const dateString = '2024-01-15T10:30:00Z';
      const result = QueryParameterConverter.toDate(dateString);

      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toBe(new Date(dateString).toISOString());
    });

    it('should return undefined when value is undefined', () => {
      const result = QueryParameterConverter.toDate(undefined);
      expect(result).toBeUndefined();
    });

    it('should return undefined when value is null', () => {
      const result = QueryParameterConverter.toDate(null);
      expect(result).toBeUndefined();
    });

    it('should return undefined when value is empty string', () => {
      const result = QueryParameterConverter.toDate('');
      expect(result).toBeUndefined();
    });

    it('should return undefined when value is not a Date or string', () => {
      expect(QueryParameterConverter.toDate(123)).toBeUndefined();
      expect(QueryParameterConverter.toDate({})).toBeUndefined();
      expect(QueryParameterConverter.toDate([])).toBeUndefined();
    });
  });

  describe('toNumber', () => {
    it('should return number when value is already a number', () => {
      expect(QueryParameterConverter.toNumber(42)).toBe(42);
      expect(QueryParameterConverter.toNumber(0)).toBe(0);
      expect(QueryParameterConverter.toNumber(-10)).toBe(-10);
    });

    it('should convert string to number', () => {
      expect(QueryParameterConverter.toNumber('42')).toBe(42);
      expect(QueryParameterConverter.toNumber('0')).toBe(0);
      expect(QueryParameterConverter.toNumber('-10')).toBe(-10);
    });

    it('should return undefined when value is undefined', () => {
      expect(QueryParameterConverter.toNumber(undefined)).toBeUndefined();
    });

    it('should return undefined when value is null', () => {
      expect(QueryParameterConverter.toNumber(null)).toBeUndefined();
    });

    it('should return undefined when string is not a valid number', () => {
      expect(QueryParameterConverter.toNumber('not-a-number')).toBeUndefined();
      expect(QueryParameterConverter.toNumber('abc123')).toBeUndefined();
    });

    it('should return undefined when value is not a number or string', () => {
      expect(QueryParameterConverter.toNumber({})).toBeUndefined();
      expect(QueryParameterConverter.toNumber([])).toBeUndefined();
      expect(QueryParameterConverter.toNumber(true)).toBeUndefined();
    });
  });

  describe('normalizePagination', () => {
    it('should return default values when both parameters are undefined', () => {
      const result = QueryParameterConverter.normalizePagination();

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should normalize page and limit from numbers', () => {
      const result = QueryParameterConverter.normalizePagination(2, 50);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });

    it('should normalize page and limit from strings', () => {
      const result = QueryParameterConverter.normalizePagination('3', '30');

      expect(result.page).toBe(3);
      expect(result.limit).toBe(30);
    });

    it('should use default page when page is undefined', () => {
      const result = QueryParameterConverter.normalizePagination(undefined, 25);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(25);
    });

    it('should use default limit when limit is undefined', () => {
      const result = QueryParameterConverter.normalizePagination(5, undefined);

      expect(result.page).toBe(5);
      expect(result.limit).toBe(20);
    });

    it('should cap limit at 100', () => {
      const result = QueryParameterConverter.normalizePagination(1, 150);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(100);
    });

    it('should cap limit at 100 when limit is string', () => {
      const result = QueryParameterConverter.normalizePagination(1, '200');

      expect(result.page).toBe(1);
      expect(result.limit).toBe(100);
    });

    it('should handle invalid page values by using default', () => {
      const result = QueryParameterConverter.normalizePagination('invalid', 30);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(30);
    });

    it('should handle invalid limit values by using default', () => {
      const result = QueryParameterConverter.normalizePagination(2, 'invalid');

      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });
  });
});

