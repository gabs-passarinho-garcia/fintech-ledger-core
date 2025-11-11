import { describe, it, expect } from 'bun:test';
import { InternalError } from '../InternalError';
import { HTTPStatusCode, ErrorCode, ErrorName, ErrorMessage } from '../../enums';

describe('InternalError', () => {
  describe('constructor', () => {
    it('should create error without parameters', () => {
      const error = new InternalError();

      expect(error.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      expect(error.errorCode).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.errorName).toBe(ErrorName[ErrorCode.INTERNAL_ERROR]);
      expect(error.message).toBe(ErrorMessage[ErrorCode.INTERNAL_ERROR]);
      expect(error.path).toBeUndefined();
      expect(error.data).toBeUndefined();
    });

    it('should create error with originalError', () => {
      const originalError = new Error('Database connection failed');

      const error = new InternalError({
        originalError,
      });

      expect(error.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      expect(error.errorCode).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.errorName).toBe(ErrorName[ErrorCode.INTERNAL_ERROR]);
      expect(error.cause).toBe(originalError);
    });

    it('should create error with additionalMessage', () => {
      const error = new InternalError({
        additionalMessage: 'Unexpected error occurred during processing',
      });

      expect(error.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      expect(error.errorCode).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.errorName).toBe(ErrorName[ErrorCode.INTERNAL_ERROR]);
      expect(error.message).toBe(
        `${ErrorMessage[ErrorCode.INTERNAL_ERROR]}: Unexpected error occurred during processing`,
      );
    });

    it('should create error with path', () => {
      const error = new InternalError({
        path: '/api/transactions',
      });

      expect(error.path).toBe('/api/transactions');
      expect(error.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      expect(error.errorCode).toBe(ErrorCode.INTERNAL_ERROR);
    });

    it('should create error with data', () => {
      const error = new InternalError({
        data: {
          params: { transactionId: '789' },
          query: { include: 'details' },
          body: { amount: 500 },
        },
      });

      expect(error.data).toEqual({
        params: { transactionId: '789' },
        query: { include: 'details' },
        body: { amount: 500 },
      });
    });

    it('should create error with all parameters', () => {
      const originalError = new Error('Unexpected database error');
      const error = new InternalError({
        originalError,
        additionalMessage: 'Failed to process transaction',
        path: '/api/transactions/create',
        data: {
          params: { transactionId: '999' },
          query: { retry: 'false' },
          body: { amount: 1000 },
        },
      });

      expect(error.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      expect(error.errorCode).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.errorName).toBe(ErrorName[ErrorCode.INTERNAL_ERROR]);
      expect(error.message).toBe(
        `${ErrorMessage[ErrorCode.INTERNAL_ERROR]}: Failed to process transaction`,
      );
      expect(error.cause).toBe(originalError);
      expect(error.path).toBe('/api/transactions/create');
      expect(error.data).toEqual({
        params: { transactionId: '999' },
        query: { retry: 'false' },
        body: { amount: 1000 },
      });
    });

    it('should create error with originalError that is not an Error instance', () => {
      const originalError = { code: 'DB_ERROR', message: 'Connection pool exhausted' };

      const error = new InternalError({
        originalError,
      });

      expect(error.cause).toBe(originalError);
      expect(error.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      expect(error.errorCode).toBe(ErrorCode.INTERNAL_ERROR);
    });

    it('should preserve original error name when originalError is Error', () => {
      const originalError = new Error('Original error message');
      originalError.name = 'TypeError';

      const error = new InternalError({
        originalError,
        additionalMessage: 'Additional context',
      });

      // Message and name are overridden by the values passed to super() (from InternalError)
      expect(error.message).toContain('Internal error');
      expect(error.message).toContain('Additional context');
      expect(error.name).toBe(ErrorName[ErrorCode.INTERNAL_ERROR]);
    });
  });
});

